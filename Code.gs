// La identnumero (FOLIARO_ID) de la chi-rilata Gugla tabelo estu notita en la projektaj agordoj.
const properties = PropertiesService.getScriptProperties();
const FOLIARO_ID = properties.getProperty('FOLIARO_ID');

const AGORDOJ = Object.freeze({
  uzantoj: 'Uzantoj',
  afishoj: 'Afishoj',
  komentoj: 'Komentoj',
  vivdauro: 72 * 60 * 60 * 1000,
  sesiodauro: 6 * 60 * 60,
  maksimumajAfishoj: 100,
  pasvortajRipetoj: 12000
});

const KAPOJ = Object.freeze({
  Uzantoj: [
    'id',
    'retposhto',
    'pasvorto',
    'nomo',
    'dato_de_registrigho'
  ],
  Afishoj: [
    'id',
    'uzanto_id',
    'teksto',
    'bildo_url',
    'dato'
  ],
  Komentoj: [
    'id',
    'afiso_id',
    'uzanto_id',
    'teksto',
    'dato'
  ],
  Konfirmoj: [
    'id',
    'retposhto',
    'pasvorto',
    'nomo',
    'jhetono_haketo',
    'dato',
    'eksvalidigho'
  ]
});

const KONFIRMA_AGORDOJ = Object.freeze({
  folio: 'Konfirmoj',
  vivdauro: 24 * 60 * 60 * 1000,
  minimumaIntervalo: 60 * 1000,

  // Enmetu la publikigitan ret-apan adreson finighantan per /exec.
  retapaAdreso: 'https://script.google.com/macros/s/AKfycbxtEV2wARkUP-eM7a4s4pKAEDzLpL5kH6RcejkGD6Y_Mo6pttkMJWeY89KUbJyQzDe-Vw/exec'
});

// Google postulas la nomon doGet por servi ret-apon.
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Radio, televido kaj pli')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function forigiAfishon(jhetono, afishoId) {
  return sekure_(() => {
    afishoId = validigiTekston_(afishoId, 100, 'Afisha identigilo');

    return kunShlosilo_(() => {
      const uzanto = postuliUzanton_(jhetono);

      const afisho = legiFoliojn_(AGORDOJ.afishoj).find(ero =>
        String(ero.id) === afishoId
      );

      if (!afisho) {
        malsukcesi_(
          'La afisho ne plu ekzistas. Refreshigu la fluon.'
        );
      }

      // La servilo kontrolas la posedanton per la valida sesio.
      if (String(afisho.uzanto_id) !== String(uzanto.id)) {
        malsukcesi_('Vi rajtas forigi nur viajn proprajn afishojn.');
      }

      // Unue forigu chiujn komentojn sub la afisho.
      // Tio inkluzivas komentojn de aliaj uzantoj.
      forigiKongruajnVicojn_(
        AGORDOJ.komentoj,
        komento => String(komento.afiso_id) === afishoId
      );

      // La bildoligilo malaperas kune kun la afisha vico.
      forigiKongruajnVicojn_(
        AGORDOJ.afishoj,
        ero => String(ero.id) === afishoId
      );

      SpreadsheetApp.flush();

      return {
        mesagho: 'La afisho kaj ghiaj komentoj estas forigitaj.'
      };
    });
  });
}

function forigiKomenton(jhetono, komentoId) {
  return sekure_(() => {
    komentoId = validigiTekston_(
      komentoId, 100, 'Komenta identigilo'
    );

    return kunShlosilo_(() => {
      const uzanto = postuliUzanton_(jhetono);

      const komento = legiFoliojn_(AGORDOJ.komentoj).find(ero =>
        String(ero.id) === komentoId
      );

      if (!komento) {
        malsukcesi_(
          'La komento ne plu ekzistas. Refreshigu la fluon.'
        );
      }

      // Posedanto de afisho ne rajtas aparte forigi fremdan komenton.
      // Nur la autoro de la komento povas uzi chi tiun operacion.
      if (String(komento.uzanto_id) !== String(uzanto.id)) {
        malsukcesi_('Vi rajtas forigi nur viajn proprajn komentojn.');
      }

      forigiKongruajnVicojn_(
        AGORDOJ.komentoj,
        ero => String(ero.id) === komentoId
      );

      SpreadsheetApp.flush();

      return {
        mesagho: 'La komento estas forigita.'
      };
    });
  });
}

// Forigu kongruajn vicojn kaj redonu la nombron de forigitaj vicoj.
// La vokanto devas jam teni la skriban shlosilon.
function forigiKongruajnVicojn_(nomo, kondicho) {
  const folio = akiriFolion_(nomo);
  const nombro = folio.getLastRow() - 1;

  if (nombro <= 0) {
    return 0;
  }

  const kapoj = KAPOJ[nomo];
  const vicoj = folio.getRange(
    2, 1, nombro, kapoj.length
  ).getValues();

  const forigendaj = [];

  vicoj.forEach((vico, indekso) => {
    const objekto = {};

    kapoj.forEach((kapo, kolumno) => {
      objekto[kapo] = vico[kolumno];
    });

    if (kondicho(objekto)) {
      forigendaj.push(indekso + 2);
    }
  });

  forigiVicojn_(folio, forigendaj);

  return forigendaj.length;
}

// Nur valida sesio kaj ghusta pasvorto rajtigas kontforigon.
// La uzanto-identigilo chiam venas de la servila sesio.
function forigiUzantokonton(jhetono, pasvorto) {
  return sekure_(() => {
    pasvorto = validigiPasvorton_(pasvorto);

    return kunShlosilo_(() => {
      const uzanto = postuliUzanton_(jhetono);

      // Limigu ripetajn pasvortajn provojn ankauh dum kontforigo.
      limigiProvojn_(String(uzanto.retposhto).toLowerCase());

      if (!kontroliPasvorton_(pasvorto, uzanto.pasvorto)) {
        malsukcesi_(
          'La pasvorto ne estas ghusta. La konto ne estas forigita.'
        );
      }

      const uzantoId = String(uzanto.id);
      const retposhto = String(uzanto.retposhto).toLowerCase();

      // Unue identigu la afishojn posedatajn de la uzanto.
      const proprajAfishoj = new Set(
        legiFoliojn_(AGORDOJ.afishoj)
          .filter(afisho =>
            String(afisho.uzanto_id) === uzantoId
          )
          .map(afisho => String(afisho.id))
      );

      // Forigu proprajn komentojn kaj komentojn sub propraj afishoj.
      const komentoj = forigiKongruajnVicojn_(
        AGORDOJ.komentoj,
        komento =>
          String(komento.uzanto_id) === uzantoId ||
          proprajAfishoj.has(String(komento.afiso_id))
      );

      // Bildoligiloj malaperas kune kun la afishaj vicoj.
      const afishoj = forigiKongruajnVicojn_(
        AGORDOJ.afishoj,
        afisho => String(afisho.uzanto_id) === uzantoId
      );

      // Forigu eventualajn konfirmpetojn por la sama retposhto.
      forigiKongruajnVicojn_(
        KONFIRMA_AGORDOJ.folio,
        konfirmo =>
          String(konfirmo.retposhto).toLowerCase() === retposhto
      );

      // Forigu la konton laste.
      // Se pli frua operacio malsukcesas, la uzanto povas reprovi.
      forigiKongruajnVicojn_(
        AGORDOJ.uzantoj,
        ero => String(ero.id) === uzantoId
      );

      SpreadsheetApp.flush();

      // Nuligu la nunan sesion.
      CacheService.getScriptCache().remove('sesio:' + jhetono);

      // Aliaj sesioj ankauh ne plu rajtigas agojn:
      // postuliUzanton_ kontrolas, ke la uzantovico ankorauh ekzistas.
      return {
        mesagho: 'Via konto kaj la rilata enhavo estas forigitaj.',
        afishoj: afishoj,
        komentoj: komentoj
      };
    });
  });
}

// Provizora administra enirejo.
// Forigu ghin antau publikigo de la nova versio.
function prepariRetposhtanKonfirmon() {
  prepariApon_();

  // La voko postulas la permeson bezonatan por retposhta sendo.
  const kvoto = MailApp.getRemainingDailyQuota();

  console.log(
    'Retposhta konfirmo estas preparita. ' +
    'Restanta taga ricevanta kvoto: ' + kvoto
  );
}

// Provizora enirejo por preparado el la redaktilo.
// Forigu ghin antau publikigo de la ret-apo.
function prepariApon() {
  return prepariApon_();
}

// Rulu chi tiun privatan funkcion unufoje el la redaktilo.
// Ghi preparas la foliojn, sekretan valoron kaj purigan ellasilon.
function prepariApon_() {
  return kunShlosilo_(() => {
    const ecoj = PropertiesService.getScriptProperties();
    const identigilo =
      FOLIARO_ID.trim() || ecoj.getProperty('FOLIARO_ID');

    let foliaro;

    if (identigilo) {
      foliaro = SpreadsheetApp.openById(identigilo);
    } else {
      foliaro = SpreadsheetApp.getActiveSpreadsheet();

      if (!foliaro) {
        foliaro = SpreadsheetApp.create('Radio');
      }
    }

    Object.keys(KAPOJ).forEach(nomo => {
      let folio = foliaro.getSheetByName(nomo);

      if (!folio) {
        folio = foliaro.insertSheet(nomo);
      }

      const kapoj = KAPOJ[nomo];

      if (folio.getLastRow() === 0) {
        folio.getRange(1, 1, 1, kapoj.length).setValues([kapoj]);
      } else {
        const ekzistantaj =
          folio.getRange(1, 1, 1, kapoj.length).getValues()[0];

        if (JSON.stringify(ekzistantaj) !== JSON.stringify(kapoj)) {
          throw new Error(
            'La kolonoj de la folio ' + nomo +
            ' ne kongruas kun la postulata strukturo.'
          );
        }
      }

      folio.setFrozenRows(1);
      folio.getRange(1, 1, 1, kapoj.length)
        .setFontWeight('bold')
        .setBackground('#e7eefc');
    });

    ecoj.setProperty('FOLIARO_ID', foliaro.getId());

    // La sekreta valoro restas ekster la folio kun la pasvortoj.
    if (!ecoj.getProperty('PASVORTA_SEKRETO')) {
      ecoj.setProperty(
        'PASVORTA_SEKRETO',
        Utilities.getUuid() + Utilities.getUuid()
      );
    }

    // Ripeta preparado ne kreas duoblajn purigajn ellasilojn.
    ScriptApp.getProjectTriggers().forEach(ellasilo => {
      if (ellasilo.getHandlerFunction() === 'forigiMalnovajhojn_') {
        ScriptApp.deleteTrigger(ellasilo);
      }
    });

    // Purigu eksvalidighintajn datumojn proksimume unufoje hore.
    ScriptApp.newTrigger('forigiMalnovajhojn_')
      .timeBased()
      .everyHours(1)
      .create();

    SpreadsheetApp.flush();
    console.log('La apo estas preta. Foliaro: ' + foliaro.getUrl());

    return foliaro.getUrl();
  });
}

// Publikaj funkcioj liveras unuforman respondon.
// Neatenditaj sistemaj eraroj ne estas montrataj rekte al vizitantoj.
function sekure_(laboro) {
  try {
    return { bone: true, datumoj: laboro() };
  } catch (eraro) {
    if (!eraro.konata) {
      console.error(eraro.stack || String(eraro));
    }

    return {
      bone: false,
      eraro: eraro.konata
        ? eraro.message
        : 'La servilo ne povis plenumi la peton. Bonvolu reprovi.',
      kodo: eraro.kodo || 'ERARO'
    };
  }
}

function malsukcesi_(mesagho, kodo) {
  const eraro = new Error(mesagho);
  eraro.konata = true;
  eraro.kodo = kodo || 'VALIDIGO';
  throw eraro;
}

// Shlosilo malhelpas samtempajn konfliktajn skribojn.
function kunShlosilo_(laboro) {
  const shlosilo = LockService.getScriptLock();

  if (!shlosilo.tryLock(20000)) {
    malsukcesi_('La servilo estas okupata. Bonvolu reprovi.');
  }

  try {
    return laboro();
  } finally {
    shlosilo.releaseLock();
  }
}

function akiriFoliaron_() {
  const identigilo = FOLIARO_ID.trim() ||
    PropertiesService.getScriptProperties().getProperty('FOLIARO_ID');

  if (!identigilo) {
    malsukcesi_(
      'La apo ankorau ne estas preparita. Kontaktu la administranton.'
    );
  }

  return SpreadsheetApp.openById(identigilo);
}

function akiriFolion_(nomo) {
  const folio = akiriFoliaron_().getSheetByName(nomo);

  if (!folio) {
    malsukcesi_('Mankas bezonata folio. Kontaktu la administranton.');
  }

  return folio;
}

// Legado liveras objektojn kun la precizaj kolonnomoj.
function legiFoliojn_(nomo) {
  const folio = akiriFolion_(nomo);
  const nombro = folio.getLastRow() - 1;

  if (nombro <= 0) {
    return [];
  }

  const kapoj = KAPOJ[nomo];
  const vicoj = folio.getRange(2, 1, nombro, kapoj.length).getValues();

  return vicoj.map(vico => {
    const objekto = {};

    kapoj.forEach((kapo, indekso) => {
      objekto[kapo] = vico[indekso];
    });

    return objekto;
  }).filter(objekto => String(objekto.id).length > 0);
}

// Apostrofo malhelpas interpreton de uzanta teksto kiel folia formulo.
// La folio uzas la apostrofon kiel tekstmarkilon, ne kiel videblan enhavon.
function protektiChelon_(valoro) {
  if (typeof valoro === 'string' && /^[=+\-@\t\r]/.test(valoro)) {
    return "'" + valoro;
  }

  return valoro;
}

function skribiVicon_(nomo, vico) {
  const folio = akiriFolion_(nomo);
  const numero = folio.getLastRow() + 1;

  folio.getRange(numero, 1, 1, vico.length)
    .setValues([vico.map(valoro => protektiChelon_(valoro))]);

  SpreadsheetApp.flush();
}

function validigiTekston_(valoro, maksimumo, etikedo) {
  if (typeof valoro !== 'string') {
    malsukcesi_('Nevalida valoro: ' + etikedo + '.');
  }

  const teksto = valoro.trim();

  if (!teksto) {
    malsukcesi_('Bonvolu plenigi la kampon: ' + etikedo + '.');
  }

  if (teksto.length > maksimumo) {
    malsukcesi_(
      'La kampo "' + etikedo + '" rajtas havi maksimume ' +
      maksimumo + ' signojn.'
    );
  }

  return teksto;
}

function validigiRetposhton_(valoro) {
  const retposhto =
    validigiTekston_(valoro, 254, 'Retposhto').toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(retposhto)) {
    malsukcesi_('Bonvolu enigi validan retposhtadreson.');
  }

  return retposhto;
}

function validigiPasvorton_(pasvorto) {
  if (
    typeof pasvorto !== 'string' ||
    pasvorto.length < 10 ||
    pasvorto.length > 200 ||
    !pasvorto.trim()
  ) {
    malsukcesi_('La pasvorto devas havi inter 10 kaj 200 signojn.');
  }

  return pasvorto;
}

function fariDeksesuman_(bajtoj) {
  return bajtoj.map(bajto =>
    ('0' + ((bajto + 256) % 256).toString(16)).slice(-2)
  ).join('');
}

// Chiu pasvorto ricevas propran salon.
// Sekreta servila valoro aldone protektas kontrau nura folia liko.
function haketiPasvorton_(pasvorto, salo) {
  const sekreto = PropertiesService.getScriptProperties()
    .getProperty('PASVORTA_SEKRETO');

  if (!sekreto) {
    malsukcesi_('La apo ne estas ghuste preparita.');
  }

  let bajtoj = Utilities.computeHmacSha256Signature(
    salo + ':' + pasvorto,
    sekreto,
    Utilities.Charset.UTF_8
  );

  for (let indekso = 0; indekso < AGORDOJ.pasvortajRipetoj; indekso++) {
    bajtoj = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      bajtoj
    );
  }

  return fariDeksesuman_(bajtoj);
}

function konserviPasvorton_(pasvorto) {
  const salo = Utilities.getUuid();

  return 'v1$' + salo + '$' + haketiPasvorton_(pasvorto, salo);
}

function kompariSekrete_(unua, dua) {
  if (unua.length !== dua.length) {
    return false;
  }

  let diferenco = 0;

  for (let indekso = 0; indekso < unua.length; indekso++) {
    diferenco |= unua.charCodeAt(indekso) ^ dua.charCodeAt(indekso);
  }

  return diferenco === 0;
}

function kontroliPasvorton_(pasvorto, konservita) {
  const partoj = String(konservita).split('$');

  if (partoj.length !== 3 || partoj[0] !== 'v1') {
    return false;
  }

  return kompariSekrete_(
    haketiPasvorton_(pasvorto, partoj[1]),
    partoj[2]
  );
}

// Tio estas baza, kasheja limigo, ne plena kontrauatako-sistemo.
function limigiProvojn_(retposhto) {
  const bajtoj = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    retposhto,
    Utilities.Charset.UTF_8
  );

  const shlosilo = 'provoj:' + fariDeksesuman_(bajtoj);
  const kashejo = CacheService.getScriptCache();
  const nombro = Number(kashejo.get(shlosilo) || 0);

  if (nombro >= 15) {
    malsukcesi_(
      'Tro multaj provoj por tiu retposhtadreso. Reprovu post dek minutoj.'
    );
  }

  kashejo.put(shlosilo, String(nombro + 1), 600);
}

function publikaUzanto_(uzanto) {
  return {
    id: String(uzanto.id),
    nomo: String(uzanto.nomo),
    retposhto: String(uzanto.retposhto)
  };
}

function kreiSesion_(uzanto) {
  const jhetono = (
    Utilities.getUuid() + Utilities.getUuid()
  ).replace(/-/g, '');

  const eksvalidigho = Date.now() + AGORDOJ.sesiodauro * 1000;

  CacheService.getScriptCache().put(
    'sesio:' + jhetono,
    JSON.stringify({
      uzantoId: String(uzanto.id),
      eksvalidigho: eksvalidigho
    }),
    AGORDOJ.sesiodauro
  );

  return {
    jhetono: jhetono,
    uzanto: publikaUzanto_(uzanto)
  };
}

// La servilo neniam fidas uzanto-identigilon senditan de la retumilo.
function postuliUzanton_(jhetono) {
  if (
    typeof jhetono !== 'string' ||
    !/^[a-f0-9]{64}$/.test(jhetono)
  ) {
    malsukcesi_('Bonvolu ensaluti.', 'SESIO');
  }

  const konservita =
    CacheService.getScriptCache().get('sesio:' + jhetono);

  if (!konservita) {
    malsukcesi_('Via sesio eksvalidighis. Bonvolu ensaluti.', 'SESIO');
  }

  const sesio = JSON.parse(konservita);

  if (sesio.eksvalidigho <= Date.now()) {
    CacheService.getScriptCache().remove('sesio:' + jhetono);
    malsukcesi_('Via sesio eksvalidighis. Bonvolu ensaluti.', 'SESIO');
  }

  const uzanto = legiFoliojn_(AGORDOJ.uzantoj)
    .find(ero => String(ero.id) === sesio.uzantoId);

  if (!uzanto) {
    malsukcesi_('La uzanto ne plu ekzistas. Bonvolu ensaluti.', 'SESIO');
  }

  return uzanto;
}

function registriUzanton(nomo, retposhto, pasvorto) {
  return sekure_(() => {
    nomo = validigiTekston_(nomo, 80, 'Nomo');
    retposhto = validigiRetposhton_(retposhto);
    pasvorto = validigiPasvorton_(pasvorto);

    limigiProvojn_(retposhto);

    const retapaAdreso = akiriKonfirmanAdreson_();

    // La haketado okazas antau la skriba shlosado.
    const konservitaPasvorto = konserviPasvorton_(pasvorto);

    // Nur la haketo de la jhetono estos konservita en la folio.
    const jhetono = (
      Utilities.getUuid() + Utilities.getUuid()
    ).replace(/-/g, '');

    const jhetonoHaketo = haketiKonfirmanJhetonon_(jhetono);

    return kunShlosilo_(() => {
      purigiKonfirmojn_();

      // La sama publika respondo ne malka shas, chu konto jam ekzistas.
      const respondo = {
        mesagho:
          'Se la adreso povas esti registrita, vi ricevos konfirman ' +
          'retposhtmesaghon. Kontrolu ankau la trudposhtan dosierujon. ' +
          'Por peti novan ligilon, atendu almenau unu minuton kaj ' +
          'plenigu la registrighan formularon denove.'
      };

      const ekzistas = legiFoliojn_(AGORDOJ.uzantoj).some(uzanto =>
        String(uzanto.retposhto).toLowerCase() === retposhto
      );

      if (ekzistas) {
        return respondo;
      }

      const folio = akiriFolion_(KONFIRMA_AGORDOJ.folio);
      const nombro = folio.getLastRow() - 1;

      const vicoj = nombro > 0
        ? folio.getRange(
            2, 1, nombro, KAPOJ.Konfirmoj.length
          ).getValues()
        : [];

      const indekso = vicoj.findIndex(vico =>
        String(vico[1]).toLowerCase() === retposhto
      );

      const nun = Date.now();

      // Ripeta klako ne tuj sendas plian mesaghon.
      if (
        indekso >= 0 &&
        nun - akiriTempon_(vicoj[indekso][5]) <
          KONFIRMA_AGORDOJ.minimumaIntervalo
      ) {
        return respondo;
      }

      if (MailApp.getRemainingDailyQuota() < 1) {
        malsukcesi_(
          'La apo nun ne povas sendi pliajn retposhtmesaghojn. ' +
          'Bonvolu reprovi poste.'
        );
      }

      const numero = indekso >= 0
        ? indekso + 2
        : folio.getLastRow() + 1;

      const antauaVico = indekso >= 0 ? vicoj[indekso] : null;

      const novaVico = [
        Utilities.getUuid(),
        retposhto,
        konservitaPasvorto,
        nomo,
        jhetonoHaketo,
        new Date(nun),
        new Date(nun + KONFIRMA_AGORDOJ.vivdauro)
      ];

      // Nova peto anstatauas la antauan nekonfirmitan registrighon.
      // Sekve nur la plej nova sendita ligilo restas valida.
      folio.getRange(
        numero, 1, 1, KAPOJ.Konfirmoj.length
      ).setValues([
        novaVico.map(valoro => protektiChelon_(valoro))
      ]);

      SpreadsheetApp.flush();

      const ligilo =
        retapaAdreso + '?konfirmo=' + encodeURIComponent(jhetono);

      try {
        sendiKonfirmanMesaghon_(retposhto, nomo, ligilo);
      } catch (eraro) {
        // Se sendo malsukcesas, restarigu la antauan staton.
        if (antauaVico) {
          folio.getRange(
            numero, 1, 1, KAPOJ.Konfirmoj.length
          ).setValues([
            antauaVico.map(valoro => protektiChelon_(valoro))
          ]);
        } else {
          folio.deleteRow(numero);
        }

        SpreadsheetApp.flush();
        console.error('Sendo de konfirma retposhtmesagho malsukcesis.');

        malsukcesi_(
          'Ne eblis sendi la konfirman retposhtmesaghon. ' +
          'Bonvolu reprovi poste.'
        );
      }

      return respondo;
    });
  });
}

// Akceptu ambau adresformojn en la administra agordo.
// Por la retposhta ligilo chiam uzu la formon kun /a/~/.
function akiriKonfirmanAdreson_() {
  const adreso = String(
    KONFIRMA_AGORDOJ.retapaAdreso || ''
  ).trim();

  const kongruo = adreso.match(
    /^https:\/\/script\.google\.com\/(?:a\/~\/)?macros\/s\/([A-Za-z0-9_-]+)\/exec$/
  );

  if (
    !kongruo ||
    adreso.includes('VIA_DISVOLVIGA_IDENTIGILO')
  ) {
    malsukcesi_(
      'La konfirma retposhta servo ankorau ne estas agordita. ' +
      'Kontaktu la administranton.'
    );
  }

  return 'https://script.google.com/a/~/macros/s/' +
    kongruo[1] + '/exec';
}

// Hazarda jhetono havas altan entropion kaj ne estas pasvorto.
// Por ghi sufichas rekta kriptografia haketo.
function haketiKonfirmanJhetonon_(jhetono) {
  const bajtoj = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    jhetono,
    Utilities.Charset.UTF_8
  );

  return fariDeksesuman_(bajtoj);
}

function sendiKonfirmanMesaghon_(retposhto, nomo, ligilo) {
  const teksto = [
    'Saluton, ' + nomo + '!',
    '',
    'Ni ricevis peton registri konton en informtabulo "Radio, televido kaj pli".',
    '',
    'Per registrigho vi akceptas la uzkondichojn.',
    '',
    'Vi povas legi ilin en la informtabulo per la butono',
    '"Uzkondichoj kaj kontakto al la administranto".',
    '',
    'Por konfirmi vian retposhtadreson kaj aktivigi la konton,',
    'malfermu chi tiun ligilon:',
    '',
    ligilo,
    '',
    'La ligilo validas 24 horojn kaj estas unufoje uzebla.',
    'Se vi petis plurajn ligilojn, uzu la plej novan.',
    '',
    'Post konfirmo vi povos ensaluti per via elektita pasvorto.',
    '',
    'Se vi ne petis chi tiun registrighon, ne malfermu la ligilon.',
    'Vi povas ignori chi tiun mesaghon.',
    '',
    'Amike',
    '',
    'Andreas',
    '(administranto de informtabulo "Radio, televido kaj pli")'
  ].join('\n');

  MailApp.sendEmail({
    to: retposhto,
    subject: 'Konfirmu vian registrighon en informtabulo "Radio, televido kaj pli"',
    body: teksto,
    name: 'Radio, televido kaj pli'
  });
}

// Chi tiu funkcio estas publika, char la ret-apo vokas ghin.
// La sekreta, unuuzebla jhetono rajtigas la konfirmon.
function konfirmiRegistrighon(jhetono) {
  return sekure_(() => {
    if (
      typeof jhetono !== 'string' ||
      !/^[a-f0-9]{64}$/.test(jhetono)
    ) {
      malsukcesi_('La konfirma ligilo ne estas valida.');
    }

    const serchataHaketo = haketiKonfirmanJhetonon_(jhetono);

    return kunShlosilo_(() => {
      purigiKonfirmojn_();

      const folio = akiriFolion_(KONFIRMA_AGORDOJ.folio);
      const nombro = folio.getLastRow() - 1;

      const vicoj = nombro > 0
        ? folio.getRange(
            2, 1, nombro, KAPOJ.Konfirmoj.length
          ).getValues()
        : [];

      const indekso = vicoj.findIndex(vico =>
        kompariSekrete_(String(vico[4]), serchataHaketo)
      );

      if (indekso < 0) {
        malsukcesi_(
          'La konfirma ligilo eksvalidighis, jam estis uzita au ' +
          'estis anstatauita. Provu ensaluti; se via konto ankorau ' +
          'ne estas aktiva, registrighu denove por ricevi novan ligilon.'
        );
      }

      const vico = vicoj[indekso];

      // Rekontrolu la limtempon tuj antau la aktivigo.
      if (akiriTempon_(vico[6]) <= Date.now()) {
        folio.deleteRow(indekso + 2);

        malsukcesi_(
          'La konfirma ligilo eksvalidighis. ' +
          'Registrighu denove por ricevi novan ligilon.'
        );
      }

      const retposhto = String(vico[1]).toLowerCase();

      const ekzistas = legiFoliojn_(AGORDOJ.uzantoj).some(uzanto =>
        String(uzanto.retposhto).toLowerCase() === retposhto
      );

      if (!ekzistas) {
        // Nur chi tie nekonfirmita registrigho farighas vera konto.
        // La pasvorto jam estas haketita; ne haketu ghin duan fojon.
        skribiVicon_(AGORDOJ.uzantoj, [
          Utilities.getUuid(),
          retposhto,
          String(vico[2]),
          String(vico[3]),
          new Date()
        ]);
      }

      // Forigo de la provizora vico nuligas la jhetonon.
      folio.deleteRow(indekso + 2);
      SpreadsheetApp.flush();

      return {
        mesagho:
          'Via retposhtadreso estas konfirmita. ' +
          'Via konto estas aktiva, kaj vi nun povas ensaluti.'
      };
    });
  });
}

// Voku chi tiun helpfunkcion nur dum aktiva skriba shlosilo.
// Eksvalidighintaj provizoraj registrighoj ne devas resti senfine.
function purigiKonfirmojn_() {
  const folio = akiriFolion_(KONFIRMA_AGORDOJ.folio);
  const nombro = folio.getLastRow() - 1;

  if (nombro <= 0) {
    return;
  }

  const vicoj = folio.getRange(
    2, 1, nombro, KAPOJ.Konfirmoj.length
  ).getValues();

  const nun = Date.now();
  const forigendaj = [];

  vicoj.forEach((vico, indekso) => {
    if (!vico[0] || akiriTempon_(vico[6]) <= nun) {
      forigendaj.push(indekso + 2);
    }
  });

  forigiVicojn_(folio, forigendaj);
}

function ensalutiUzanton(retposhto, pasvorto) {
  return sekure_(() => {
    retposhto = validigiRetposhton_(retposhto);
    pasvorto = validigiPasvorton_(pasvorto);

    limigiProvojn_(retposhto);

    const uzanto = legiFoliojn_(AGORDOJ.uzantoj).find(ero =>
      String(ero.retposhto).toLowerCase() === retposhto
    );

    if (!uzanto || !kontroliPasvorton_(pasvorto, uzanto.pasvorto)) {
      malsukcesi_('Malghusta retposhtadreso au pasvorto.');
    }

    return kreiSesion_(uzanto);
  });
}

function akiriNunanUzanton(jhetono) {
  return sekure_(() => publikaUzanto_(postuliUzanton_(jhetono)));
}

function elsalutiUzanton(jhetono) {
  return sekure_(() => {
    if (
      typeof jhetono === 'string' &&
      /^[a-f0-9]{64}$/.test(jhetono)
    ) {
      CacheService.getScriptCache().remove('sesio:' + jhetono);
    }

    return true;
  });
}

function aldoniAfishon(jhetono, teksto) {
  return sekure_(() => {
    teksto = validigiTekston_(teksto, 5000, 'Afisho');

    return kunShlosilo_(() => {
      const uzanto = postuliUzanton_(jhetono);
      const identigilo = Utilities.getUuid();

      // Konservu la ekzistantan folian strukturon.
      // La malnova bildokolono restas malplena por novaj afishoj.
      skribiVicon_(AGORDOJ.afishoj, [
        identigilo,
        uzanto.id,
        teksto,
        '',
        new Date()
      ]);

      return { id: identigilo };
    });
  });
}

function aldoniKomenton(jhetono, afishoId, teksto) {
  return sekure_(() => {
    teksto = validigiTekston_(teksto, 1500, 'Komento');

    if (typeof afishoId !== 'string') {
      malsukcesi_('Nevalida afisho.');
    }

    return kunShlosilo_(() => {
      const uzanto = postuliUzanton_(jhetono);
      const limo = Date.now() - AGORDOJ.vivdauro;

      const afisho = legiFoliojn_(AGORDOJ.afishoj).find(ero =>
        String(ero.id) === afishoId &&
        akiriTempon_(ero.dato) > limo
      );

      if (!afisho) {
        malsukcesi_('La afisho ne plu ekzistas au jam eksvalidighis.');
      }

      const identigilo = Utilities.getUuid();

      skribiVicon_(AGORDOJ.komentoj, [
        identigilo,
        afishoId,
        uzanto.id,
        teksto,
        new Date()
      ]);

      return { id: identigilo };
    });
  });
}

function akiriTempon_(valoro) {
  const tempo = valoro instanceof Date
    ? valoro.getTime()
    : new Date(valoro).getTime();

  return Number.isFinite(tempo) ? tempo : 0;
}

function formiDaton_(valoro) {
  return new Date(akiriTempon_(valoro)).toISOString();
}

// Forigo okazas de malsupre supren por konservi la vicnumerojn.
// Apudaj forigendaj vicoj estas forigataj kune.
function forigiVicojn_(folio, numeroj) {
  numeroj.sort((unua, dua) => dua - unua);

  let indekso = 0;

  while (indekso < numeroj.length) {
    let komenco = numeroj[indekso];
    let kvanto = 1;
    indekso++;

    while (
      indekso < numeroj.length &&
      numeroj[indekso] === komenco - 1
    ) {
      komenco = numeroj[indekso];
      kvanto++;
      indekso++;
    }

    folio.deleteRows(komenco, kvanto);
  }
}

// Chi tiu interna funkcio estas vokata nur dum aktiva shlosilo.
// Komentoj de forigita afisho estas forigataj sendepende de sia agho.
// Bildoligiloj malaperas kune kun la afishaj vicoj.
function purigiMalnovajhojn_() {
  purigiKonfirmojn_();
  const limo = Date.now() - AGORDOJ.vivdauro;
  const afishfolio = akiriFolion_(AGORDOJ.afishoj);
  const komentfolio = akiriFolion_(AGORDOJ.komentoj);
  const vivantaj = new Set();
  const forigendajAfishoj = [];
  const forigendajKomentoj = [];

  const afishnombro = afishfolio.getLastRow() - 1;

  if (afishnombro > 0) {
    const vicoj = afishfolio
      .getRange(2, 1, afishnombro, KAPOJ.Afishoj.length)
      .getValues();

    vicoj.forEach((vico, indekso) => {
      if (!vico[0] || akiriTempon_(vico[4]) <= limo) {
        forigendajAfishoj.push(indekso + 2);
      } else {
        vivantaj.add(String(vico[0]));
      }
    });
  }

  const komentnombro = komentfolio.getLastRow() - 1;

  if (komentnombro > 0) {
    const vicoj = komentfolio
      .getRange(2, 1, komentnombro, KAPOJ.Komentoj.length)
      .getValues();

    vicoj.forEach((vico, indekso) => {
      if (
        !vico[0] ||
        akiriTempon_(vico[4]) <= limo ||
        !vivantaj.has(String(vico[1]))
      ) {
        forigendajKomentoj.push(indekso + 2);
      }
    });
  }

  forigiVicojn_(komentfolio, forigendajKomentoj);
  forigiVicojn_(afishfolio, forigendajAfishoj);
  SpreadsheetApp.flush();
}

// La substreko malpermesas rektan vokon per google.script.run.
// La tempobazita ellasilo tamen povas voki chi tiun funkcion.
function forigiMalnovajhojn_() {  
  return kunShlosilo_(() => purigiMalnovajhojn_());
}

function akiriAfishojn() {
  return sekure_(() => kunShlosilo_(() => {
    purigiMalnovajhojn_();

    const limo = Date.now() - AGORDOJ.vivdauro;
    const nomoj = Object.create(null);

    legiFoliojn_(AGORDOJ.uzantoj).forEach(uzanto => {
      nomoj[String(uzanto.id)] = String(uzanto.nomo);
    });

    const afishoj = legiFoliojn_(AGORDOJ.afishoj)
      .filter(afisho => akiriTempon_(afisho.dato) > limo)
      .sort((unua, dua) =>
        akiriTempon_(dua.dato) - akiriTempon_(unua.dato)
      )
      .slice(0, AGORDOJ.maksimumajAfishoj);

    const identigiloj = new Set(
      afishoj.map(afisho => String(afisho.id))
    );

    const komentojLauAfisho = Object.create(null);

    legiFoliojn_(AGORDOJ.komentoj)
      .filter(komento =>
        identigiloj.has(String(komento.afiso_id)) &&
        akiriTempon_(komento.dato) > limo
      )
      .sort((unua, dua) =>
        akiriTempon_(unua.dato) - akiriTempon_(dua.dato)
      )
      .forEach(komento => {
        const identigilo = String(komento.afiso_id);

        if (!komentojLauAfisho[identigilo]) {
          komentojLauAfisho[identigilo] = [];
        }

        komentojLauAfisho[identigilo].push({
          id: String(komento.id),
          uzantoId: String(komento.uzanto_id),
          nomo: nomoj[String(komento.uzanto_id)] || 'Nekonata uzanto',
          teksto: String(komento.teksto),
          dato: formiDaton_(komento.dato)
        });
      });

    // Autoraj identigiloj ne estas sesiaj jhetonoj.
    // Retposhtadresoj kaj pasvortoj restas ekster la publika fluo.
    return afishoj.map(afisho => ({
      id: String(afisho.id),
      uzantoId: String(afisho.uzanto_id),
      nomo: nomoj[String(afisho.uzanto_id)] || 'Nekonata uzanto',
      teksto: String(afisho.teksto),      
      dato: formiDaton_(afisho.dato),
      komentoj: komentojLauAfisho[String(afisho.id)] || []
    }));
  }));
}

// La kontakta adreso (ADMINISTRANTA_RETPOSHTO) estu notita en la projektaj agordoj.
const ADMINISTRANTA_RETPOSHTO = properties.getProperty('ADMINISTRANTA_RETPOSHTO');

// Nur ensalutinta uzanto povas ricevi la kontaktadreson.
function akiriAdministrantanRetposhton(jhetono) {
  return sekure_(() => {
    postuliUzanton_(jhetono);

    const retposhto = ADMINISTRANTA_RETPOSHTO.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(retposhto)) {
      malsukcesi_(
        'La administra retposhtadreso ankorau ne estas agordita.'
      );
    }

    return retposhto;
  });
}
