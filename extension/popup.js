const exportButton = document.getElementById("export");
const statusEl = document.getElementById("status");

function setStatus(message) {
  statusEl.textContent = message;
}

exportButton.addEventListener("click", async () => {
  exportButton.disabled = true;
  setStatus("Verarbeite Artikel...");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.tabs.sendMessage(tab.id, { type: "GENERATE_PDF" });
    setStatus("PDF wird erzeugt. Bitte warten...");
  } catch (error) {
    console.error(error);
    setStatus("Konnte Nachricht nicht senden. Seite neu laden?");
  } finally {
    setTimeout(() => {
      exportButton.disabled = false;
    }, 1000);
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "PDF_STATUS") {
    setStatus(request.message);
  }
});
