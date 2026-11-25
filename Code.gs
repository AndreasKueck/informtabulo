/*
 * Radio, televido kaj pli
 *
 * Publika enirejo: doGet.
 * La privata foriga funkcio estas rulata mane el la redaktilo.
 * Neniu publika peto legas aŭ ŝanĝas uzantajn datumojn.
 */

const FINITA_ECO_ = 'INFORMTABULO_GITHUB_TRANSIRO_FINITA_V1';

function doGet() {
  const finita = PropertiesService.getScriptProperties()
    .getProperty(FINITA_ECO_) === 'jes';

  const pagho = finita
    ? HtmlService.createHtmlOutputFromFile('index')
    : HtmlService.createHtmlOutput(
        '<!doctype html><html lang="eo"><head>' +
        '<meta charset="utf-8"></head><body>' +
        '<h1>Radio, televido kaj pli</h1>' +
        '<p>La informtabulo estas malaktivigita.</p>' +
        '<p><a target="_blank" rel="noopener noreferrer" ' +
        'href="https://github.com/AndreasKueck/informtabulo/discussions">' +
        'Malfermi la GitHub-deponejan diskut-pagharon</a></p>' +
        '</body></html>'
      );

  return pagho
    .setTitle('Radio, televido kaj pli')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/*
 * EINMAL MANUELL IM EDITOR AUSFÜHREN.
 *
 * Der abschließende Unterstrich verhindert, dass die Funktion
 * von der Webseite über google.script.run aufgerufen werden kann.
 */
function forigiDatumojnDeInformtabulo_() {
  const ecoj = PropertiesService.getScriptProperties();
  const atendataId = String(ecoj.getProperty('FOLIARO_ID') || '').trim();
  const tabelo = SpreadsheetApp.getActiveSpreadsheet();

  if (!tabelo || !atendataId || tabelo.getId() !== atendataId) {
    throw new Error(
      'Abbruch: Öffne den Editor über die zugehörige Google-Tabelle. ' +
      'Ihre ID muss mit der Skripteigenschaft FOLIARO_ID übereinstimmen.'
    );
  }

  const strukturo = {
    Komentoj: ['id', 'afiso_id', 'uzanto_id', 'teksto', 'dato'],
    Afishoj: ['id', 'uzanto_id', 'teksto', 'bildo_url', 'dato'],
    Indekso: ['id', 'pri_mi'],
    Konfirmoj: [
      'id', 'retposhto', 'pasvorto', 'nomo',
      'jhetono_haketo', 'dato', 'eksvalidigho'
    ],
    Uzantoj: ['id', 'retposhto', 'pasvorto', 'nomo', 'dato_de_registrigho']
  };

  const shlosilo = LockService.getScriptLock();
  shlosilo.waitLock(30000);

  try {
    // Erst ALLE Blätter prüfen, bevor das erste geleert wird.
    const folioj = Object.entries(strukturo).map(([nomo, kapoj]) => {
      const folio = tabelo.getSheetByName(nomo);

      if (!folio) {
        throw new Error('Abbruch: Tabellenblatt fehlt: ' + nomo);
      }

      if (folio.getLastColumn() !== kapoj.length) {
        throw new Error('Abbruch: Unerwartete Spaltenzahl in ' + nomo);
      }

      const trovita = folio.getRange(1, 1, 1, kapoj.length)
        .getDisplayValues()[0];

      if (!kapoj.every((kapo, i) => trovita[i] === kapo)) {
        throw new Error('Abbruch: Unerwartete Überschriften in ' + nomo);
      }

      return folio;
    });

    ecoj.setProperty('KI_AKTIVA', 'false');

    const rezulto = {};
    folioj.forEach(folio => {
      const nombro = folio.getLastRow() - 1;
      if (nombro > 0) {
        folio.getRange(2, 1, nombro, folio.getLastColumn()).clearContent();
      }
      rezulto[folio.getName()] = nombro;
    });

    SpreadsheetApp.flush();

    // Die endgültige Hinweisseite erst nach erfolgreicher Prüfung zeigen.
    folioj.forEach(folio => {
      if (folio.getLastRow() !== 1) {
        throw new Error(
          'Löschung nicht bestätigt. Bitte Blatt prüfen: ' + folio.getName()
        );
      }
    });

    ecoj.deleteProperty('KI_TAGA_STATO_V1');
    ecoj.setProperty(FINITA_ECO_, 'jes');
    console.log('Fertig. Geleerte Datenzeilen: ' + JSON.stringify(rezulto));
  } finally {
    shlosilo.releaseLock();
  }
}
