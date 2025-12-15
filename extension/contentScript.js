const TRANSLATE_ENDPOINT = "https://libretranslate.de/translate";

function sendStatus(message) {
  chrome.runtime.sendMessage({ type: "PDF_STATUS", message }).catch(() => {
    // Popup might be closed; silently ignore.
  });
}

function cloneDocument() {
  const clone = document.cloneNode(true);
  // Remove script tags to avoid executing anything in the cloned document.
  clone.querySelectorAll("script").forEach((node) => node.remove());
  return clone;
}

function extractArticle() {
  if (!window.Readability) {
    throw new Error("Readability Bibliothek nicht geladen");
  }

  const clone = cloneDocument();
  const article = new Readability(clone).parse();
  if (!article) return null;

  return {
    title: article.title || document.title || "Artikel",
    contentText: article.textContent.trim(),
  };
}

async function translateToGerman(text) {
  const payload = { q: text, source: "auto", target: "de", format: "text" };
  const response = await fetch(TRANSLATE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Übersetzungsdienst antwortete mit Status ${response.status}`);
  }

  const data = await response.json();
  return data.translatedText || text;
}

async function buildPdf(title, text) {
  const { jsPDF } = await import(chrome.runtime.getURL("vendor/jspdf.umd.min.js"));
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const margin = 36;
  let cursorY = margin;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(title, pageWidth);
  doc.text(titleLines, margin, cursorY);
  cursorY += titleLines.length * 22 + 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  paragraphs.forEach((para, index) => {
    const lines = doc.splitTextToSize(para, pageWidth);
    const neededHeight = lines.length * 16;
    if (cursorY + neededHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(lines, margin, cursorY);
    cursorY += neededHeight + 12;

    if (index === paragraphs.length - 1) {
      doc.setLineWidth(0.5);
    }
  });

  return doc.output("datauristring");
}

async function generatePdf() {
  try {
    sendStatus("Artikel wird analysiert...");
    const article = extractArticle();
    if (!article || !article.contentText) {
      sendStatus("Kein lesbarer Artikel gefunden.");
      return;
    }

    sendStatus("Text wird ins Deutsche übersetzt...");
    const translated = await translateToGerman(article.contentText);

    sendStatus("PDF wird aufgebaut...");
    const pdfUri = await buildPdf(article.title, translated);

    const link = document.createElement("a");
    link.href = pdfUri;
    const safeTitle = article.title.replace(/[^\p{L}\p{N}\-_ ]/gu, "_").slice(0, 80) || "artikel";
    link.download = `${safeTitle}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    sendStatus("Fertig! PDF wurde heruntergeladen.");
  } catch (error) {
    console.error("PDF-Erstellung fehlgeschlagen", error);
    sendStatus(`Fehler: ${error.message}`);
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "GENERATE_PDF") {
    generatePdf();
    sendResponse({ ok: true });
  }
});
