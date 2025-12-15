# Saubere Artikel-PDF (Chrome-Erweiterung)

Diese Manifest-V3-Erweiterung extrahiert den Hauptartikel der aktuell geöffneten Seite, übersetzt den Text ins Deutsche und erzeugt eine aufgeräumte PDF.

## Installation im Entwickler-Modus
1. Öffne `chrome://extensions` in Chrome und aktiviere den Entwickler-Modus.
2. Wähle **Entpackte Erweiterung laden** und zeige auf den Ordner `extension/`.
3. Öffne eine beliebige Artikelseite und klicke auf das Erweiterungssymbol.
4. Klicke im Popup auf **PDF erstellen**. Nach Abschluss startet ein Download der PDF-Datei.

## Hinweise
- Die Artikelerkennung nutzt [Mozilla Readability](https://github.com/mozilla/readability), um Werbung auszublenden und die Struktur des Inhalts zu erkennen.
- Die Übersetzung erfolgt standardmäßig über `https://libretranslate.de/translate`. Das Endpoint ist offen, kann aber Rate-Limits haben. Passe die Konstante `TRANSLATE_ENDPOINT` in `contentScript.js` bei Bedarf an.
- Die PDF-Erzeugung erfolgt lokal im Browser über [jsPDF](https://github.com/parallax/jsPDF); es werden keine Nutzerdaten an andere Dienste gesendet außer an den Übersetzungs-Endpunkt.

