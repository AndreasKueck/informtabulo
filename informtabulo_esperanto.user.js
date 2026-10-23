// ==UserScript==
// @name         informtabulo: GitHub Discussions en Esperanto
// @namespace    https://github.com/AndreasKueck/informtabulo
// @version      1.1.0
// @description  Tradukas la interfacon de GitHub Discussions ĉe informtabulo en Esperanton.
// @match        https://github.com/AndreasKueck/informtabulo/*
// @run-at       document-idle
// @grant        none
// @homepageURL  https://github.com/AndreasKueck/informtabulo
// @supportURL   https://github.com/AndreasKueck/informtabulo/discussions
// ==/UserScript==

(() => {
    "use strict";

    // La pli vasta @match ebligas ankaŭ la internan navigadon de GitHub
    // de alia paĝo de la deponejo al la diskutoj.
    // La skripto tradukas nur en la ĉi-sube difinita paĝaro.
    const DISCUSSIONS_PATH =
        /^\/AndreasKueck\/informtabulo\/discussions(?:\/|$)/i;

    const DICTIONARY = new Map(Object.entries({
        // Bonvenigo kaj enkonduko al la diskutoj
        "Welcome to discussions!":
            "Bonvenon al la diskutoj!",
        "Welcome to Discussions!":
            "Bonvenon al la diskutoj!",

        "Discussions are to share announcements, create conversation in your community, answer questions, and more.":
            "Diskutoj servas por publikigi anoncojn, komenci konversaciojn en via komunumo, respondi demandojn kaj pli.",

        "To get started, you can create a new discussion.":
            "Por komenci, vi povas krei novan diskuton.",

        "Discussions are to share announcements, create conversation in your community, answer questions, and more. To get started, you can create a new discussion.":
            "Diskutoj servas por publikigi anoncojn, komenci konversaciojn en via komunumo, respondi demandojn kaj pli. Por komenci, vi povas krei novan diskuton.",

        // Apartaj teksteroj, se la ligilo dividas la alineon
        "Discussions are to share announcements, create conversation in your community, answer questions, and more. To get started, you can":
            "Diskutoj servas por publikigi anoncojn, komenci konversaciojn en via komunumo, respondi demandojn kaj pli. Por komenci, vi povas",
        "To get started, you can":
            "Por komenci, vi povas",
        "create a new discussion":
            "krei novan diskuton",
        // Filtrado kaj komunumaj statistikoj
        "Filter:": "Filtrilo:",
        "Community Insights": "Komunumaj statistikoj",
        "Community insights": "Komunumaj statistikoj",
        "Most helpful": "Plej helpemaj",

        // Memorigo pri utilaj respondoj
        "Be sure to mark someone’s comment as an answer if it helps you resolve your question — they deserve the credit! 💕":
            "Nepre marku ies komenton kiel respondon, se ĝi helpas vin solvi vian demandon — tiu persono meritas la agnoskon! 💕",
        "Be sure to mark someone's comment as an answer if it helps you resolve your question — they deserve the credit! 💕":
            "Nepre marku ies komenton kiel respondon, se ĝi helpas vin solvi vian demandon — tiu persono meritas la agnoskon! 💕",

        // Informoj pri mankantaj serĉrezultoj
        "There are no matching discussions.":
            "Neniuj diskutoj kongruas kun la serĉo.",
        "There are no matching discussions":
            "Neniuj diskutoj kongruas kun la serĉo",
        "You can open a new discussion to ask questions about this repository or get help.":
            "Vi povas komenci novan diskuton por fari demandojn pri ĉi tiu deponejo aŭ ricevi helpon.",
        "There are no matching discussions. You can open a new discussion to ask questions about this repository or get help.":
            "Neniuj diskutoj kongruas kun la serĉo. Vi povas komenci novan diskuton por fari demandojn pri ĉi tiu deponejo aŭ ricevi helpon.",
        // Ĉefa navigado
        "Skip to content": "Salti al la enhavo",
        "Navigation Menu": "Navigada menuo",
        "Toggle navigation": "Baskuligi la navigadon",
        "Open navigation menu": "Malfermi la navigadan menuon",
        "Close navigation menu": "Fermi la navigadan menuon",
        "Open user navigation menu": "Malfermi la uzantan navigadan menuon",
        "Homepage": "Ĉefpaĝo",
        "Dashboard": "Panelo",
        "Sign in": "Ensaluti",
        "Sign up": "Registriĝi",
        "Sign out": "Elsaluti",
        "Code": "Kodo",
        "Issues": "Problemoj",
        "Pull requests": "Kunigpetoj",
        "Actions": "Agoj",
        "Projects": "Projektoj",
        "Wiki": "Vikio",
        "Security": "Sekureco",
        "Security and quality": "Sekureco kaj kvalito",
        "Security & quality": "Sekureco kaj kvalito",
        "Insights": "Superrigardoj",
        "Settings": "Agordoj",
        "Discussions": "Diskutoj",
        "Agents": "Agentoj",
        "Agent": "Agento",
        "More": "Pli",
        "More options": "Pliaj opcioj",
        "More navigation options": "Pliaj navigadaj opcioj",
        "Repository navigation": "Navigado de la deponejo",
        "Repository": "Deponejo",
        "Repositories": "Deponejoj",
        "Public": "Publika",
        "Private": "Privata",
        "Watch": "Observi",
        "Unwatch": "Ĉesi observi",
        "Star": "Stelumi",
        "Unstar": "Malstelumi",
        "Fork": "Forki",

        // Serĉado
        "Search": "Serĉi",
        "Search discussions": "Serĉi diskutojn",
        "Search all discussions": "Serĉi ĉiujn diskutojn",
        "Search this repository": "Serĉi en ĉi tiu deponejo",
        "Search or jump to...": "Serĉi aŭ iri al...",
        "Search or jump to…": "Serĉi aŭ iri al…",
        "Type / to search": "Tajpu / por serĉi",
        "Search code, repositories, users, issues, pull requests...":
            "Serĉi kodon, deponejojn, uzantojn, problemojn, kunigpetojn...",
        "Search code, repositories, users, issues, pull requests…":
            "Serĉi kodon, deponejojn, uzantojn, problemojn, kunigpetojn…",
        "Search syntax tips": "Konsiloj pri serĉa sintakso",
        "No results found": "Neniuj rezultoj trovitaj",

        // Superrigardo de diskutoj
        "New discussion": "Nova diskuto",
        "Start a discussion": "Komenci diskuton",
        "All discussions": "Ĉiuj diskutoj",
        "View all discussions": "Vidi ĉiujn diskutojn",
        "Categories": "Kategorioj",
        "Category": "Kategorio",
        "Choose a category": "Elekti kategorion",
        "Select a category": "Elekti kategorion",
        "Select category": "Elekti kategorion",
        "View all categories": "Vidi ĉiujn kategoriojn",
        "Labels": "Etikedoj",
        "Label": "Etikedo",
        "Filter by label": "Filtri laŭ etikedo",
        "Filter by category": "Filtri laŭ kategorio",
        "Filter by author": "Filtri laŭ aŭtoro",
        "Author": "Aŭtoro",
        "Filter": "Filtri",
        "Filters": "Filtriloj",
        "Clear": "Forigi",
        "Clear filters": "Forigi la filtrilojn",
        "Clear current search query, filters, and sorts":
            "Forigi la nunan serĉon, filtrilojn kaj ordigon",
        "Sort": "Ordigi",
        "Sort by": "Ordigi laŭ",
        "Latest activity": "Lasta aktiveco",
        "Date created": "Kreodato",
        "Newest": "Plej novaj",
        "Oldest": "Plej malnovaj",
        "Top": "Plej popularaj",
        "Top: All": "Plej popularaj: iam ajn",
        "Top: Day": "Plej popularaj: hodiaŭ",
        "Top: Week": "Plej popularaj: ĉi-semajne",
        "Top: Month": "Plej popularaj: ĉi-monate",
        "Top: Year": "Plej popularaj: ĉi-jare",
        "Most commented": "Plej komentitaj",
        "Most upvoted": "Kun plej multaj subtenaj voĉoj",
        "Open": "Malfermita",
        "Closed": "Fermita",
        "Answered": "Respondita",
        "Unanswered": "Nerespondita",
        "Locked": "Ŝlosita",
        "Pinned": "Alpinglita",
        "No discussions found": "Neniuj diskutoj trovitaj",
        "Previous": "Antaŭa",
        "Next": "Sekva",
        "Load more": "Ŝargi pli",
        "Loading": "Ŝargante",
        "Loading...": "Ŝargante...",
        "Loading…": "Ŝargante…",

        // Kreado de nova diskuto
        "New Discussion": "Nova diskuto",
        "Create a discussion": "Krei diskuton",
        "Create a new discussion": "Krei novan diskuton",
        "Start a new discussion": "Komenci novan diskuton",
        "Choose a category for your discussion":
            "Elekti kategorion por via diskuto",
        "Select a category for your discussion":
            "Elekti kategorion por via diskuto",
        "Discussion category": "Kategorio de la diskuto",
        "Change category": "Ŝanĝi la kategorion",
        "Change discussion category": "Ŝanĝi la kategorion de la diskuto",
        "Discussion title": "Titolo de la diskuto",
        "Title": "Titolo",
        "Add a title": "Aldoni titolon",
        "Enter a title": "Enigi titolon",
        "Title (required)": "Titolo (deviga)",
        "Add a title (required)": "Aldoni titolon (deviga)",
        "Body": "Enhavo",
        "Discussion body": "Enhavo de la diskuto",
        "Add a body": "Aldoni enhavon",
        "Add a description": "Aldoni priskribon",
        "Description": "Priskribo",
        "Description (optional)": "Priskribo (nedeviga)",
        "Write your discussion here": "Skribu vian diskuton ĉi tie",
        "Write your discussion here...": "Skribu vian diskuton ĉi tie...",
        "Write your discussion here…": "Skribu vian diskuton ĉi tie…",
        "What would you like to discuss?": "Pri kio vi ŝatus diskuti?",
        "Discussion options": "Opcioj de la diskuto",
        "Create discussion": "Krei diskuton",
        "Start discussion": "Komenci diskuton",
        "Post discussion": "Publikigi la diskuton",
        "Creating discussion...": "Kreante diskuton...",
        "Creating discussion…": "Kreante diskuton…",
        "Required": "Deviga",
        "required": "deviga",
        "Optional": "Nedeviga",
        "optional": "nedeviga",
        "Required fields are marked with an asterisk (*).":
            "Devigaj kampoj estas markitaj per asterisko (*).",
        "Please enter a title": "Bonvolu enigi titolon",
        "Please enter a title.": "Bonvolu enigi titolon.",
        "Title can't be blank": "La titolo ne povas esti malplena",
        "Body can't be blank": "La enhavo ne povas esti malplena",
        "Remember, contributions to this repository should follow its":
            "Memoru, ke kontribuoj al ĉi tiu deponejo devas sekvi ĝiajn",
        "Remember, contributions to this repository should follow our":
            "Memoru, ke kontribuoj al ĉi tiu deponejo devas sekvi niajn",
        "Remember, contributions to this repository should follow its contributing guidelines and code of conduct.":
            "Memoru, ke kontribuoj al ĉi tiu deponejo devas sekvi ĝiajn kontribuajn gvidliniojn kaj kondutkodon.",
        "contributing guidelines": "kontribuajn gvidliniojn",
        "Contributing guidelines": "Kontribuaj gvidlinioj",
        "code of conduct": "kondutkodon",

        // Diskutoj kaj respondoj
        "Discussion": "Diskuto",
        "Answer": "Respondo",
        "Answers": "Respondoj",
        "Comment": "Komenti",
        "Comments": "Komentoj",
        "Reply": "Respondi",
        "Replies": "Respondoj",
        "Write a reply": "Skribi respondon",
        "Write a reply...": "Skribi respondon...",
        "Write a reply…": "Skribi respondon…",
        "Add a comment": "Aldoni komenton",
        "Leave a comment": "Lasi komenton",
        "Write a comment": "Skribi komenton",
        "Write a comment...": "Skribi komenton...",
        "Write a comment…": "Skribi komenton…",
        "Comment body": "Enhavo de la komento",
        "Reply body": "Enhavo de la respondo",
        "Join the conversation": "Aliĝi al la konversacio",
        "Sign in to comment": "Ensaluti por komenti",
        "Sign up for free": "Registriĝi senpage",
        "Mark as answer": "Marki kiel respondon",
        "Unmark as answer": "Malmarki kiel respondon",
        "Marked as answer": "Markita kiel respondo",
        "View full answer": "Vidi la tutan respondon",
        "Upvote": "Subteni per voĉo",
        "Upvoted": "Subtenita per voĉo",
        "Add reaction": "Aldoni reagon",
        "Add your reaction": "Aldoni vian reagon",
        "React": "Reagi",
        "Quote reply": "Respondi kun citaĵo",
        "Copy link": "Kopii ligilon",
        "Copy link to discussion": "Kopii ligilon al la diskuto",
        "Copy link to comment": "Kopii ligilon al la komento",
        "Link copied!": "Ligilo kopiita!",
        "Edited": "Redaktita",
        "edited": "redaktita",
        "Owner": "Posedanto",
        "Member": "Membro",
        "Collaborator": "Kunlaboranto",
        "Contributor": "Kontribuanto",
        "Maintainer": "Prizorganto",

        // Redaktilo kaj antaŭrigardo
        "Write": "Skribi",
        "Preview": "Antaŭrigardi",
        "Preview your changes": "Antaŭrigardi viajn ŝanĝojn",
        "Nothing to preview": "Nenio por antaŭrigardi",
        "Nothing to preview.": "Nenio por antaŭrigardi.",
        "Loading preview...": "Ŝargante la antaŭrigardon...",
        "Loading preview…": "Ŝargante la antaŭrigardon…",
        "Edit": "Redakti",
        "Save": "Konservi",
        "Save changes": "Konservi la ŝanĝojn",
        "Cancel": "Nuligi",
        "Submit": "Sendi",
        "Update comment": "Ĝisdatigi la komenton",
        "Markdown is supported": "Markdown estas subtenata",
        "Markdown is supported.": "Markdown estas subtenata.",
        "Markdown supported": "Markdown subtenata",
        "Markdown styling is supported":
            "Formatado per Markdown estas subtenata",
        "Markdown styling is supported.":
            "Formatado per Markdown estas subtenata.",
        "Styling with Markdown is supported":
            "Formatado per Markdown estas subtenata",
        "Use Markdown to format your discussion":
            "Uzu Markdown por formati vian diskuton",
        "Learn more about Markdown": "Lerni pli pri Markdown",
        "Markdown Guide": "Gvidilo pri Markdown",
        "Formatting help": "Helpo pri formatado",
        "Formatting options": "Opcioj pri formatado",
        "Formatting tools": "Formatiloj",
        "Markdown formatting": "Formatado per Markdown",
        "Toggle formatting toolbar": "Baskuligi la formatan ilobreton",
        "Select a tab indentation": "Elekti taban deŝovon",
        "Select tab size": "Elekti taban larĝon",

        // Iloj por formatado
        "Heading": "Titolo",
        "Header": "Titolo",
        "Add a heading": "Aldoni titolon",
        "Add heading text": "Aldoni titolan tekston",
        "Bold": "Grasa",
        "Add bold text": "Aldoni grasan tekston",
        "Italic": "Kursiva",
        "Add italic text": "Aldoni kursivan tekston",
        "Strikethrough": "Trastrekita",
        "Add strikethrough text": "Aldoni trastrekitan tekston",
        "Quote": "Citaĵo",
        "Insert a quote": "Enmeti citaĵon",
        "Insert code": "Enmeti kodon",
        "Insert a code block": "Enmeti kodblokon",
        "Code block": "Kodbloko",
        "Link": "Ligilo",
        "Add a link": "Aldoni ligilon",
        "Insert a link": "Enmeti ligilon",
        "Unordered list": "Neordigita listo",
        "Add a bulleted list": "Aldoni liston kun buloj",
        "Add a bulleted list, <ul>": "Aldoni liston kun buloj, <ul>",
        "Ordered list": "Ordigita listo",
        "Add a numbered list": "Aldoni numeritan liston",
        "Add a numbered list, <ol>": "Aldoni numeritan liston, <ol>",
        "Task list": "Taskolisto",
        "Add a task list": "Aldoni taskoliston",
        "Add a task list, <ul>": "Aldoni taskoliston, <ul>",
        "Mention": "Mencio",
        "Mention a user or team": "Mencii uzanton aŭ teamon",
        "Mention a user or team, @": "Mencii uzanton aŭ teamon, @",
        "Reference": "Referenco",
        "Reference an issue or pull request":
            "Referenci problemon aŭ kunigpeton",
        "Reference an issue or pull request, #":
            "Referenci problemon aŭ kunigpeton, #",
        "Saved replies": "Konservitaj respondoj",
        "Insert a saved reply": "Enmeti konservitan respondon",
        "Select a saved reply": "Elekti konservitan respondon",
        "Choose a saved reply": "Elekti konservitan respondon",
        "Use a saved reply": "Uzi konservitan respondon",
        "No saved replies": "Neniuj konservitaj respondoj",
        "Manage saved replies": "Administri konservitajn respondojn",
        "Emoji": "Emoĝio",
        "Add emoji": "Aldoni emoĝion",
        "Choose an emoji": "Elekti emoĝion",
        "Insert an emoji": "Enmeti emoĝion",

        // Aldono de dosieroj
        "Attach files": "Aldoni dosierojn",
        "Attach files by dragging & dropping, selecting or pasting them.":
            "Aldonu dosierojn per trenado kaj faligo, elekto aŭ algluo.",
        "Attach files by dragging & dropping, selecting or pasting them":
            "Aldonu dosierojn per trenado kaj faligo, elekto aŭ algluo",
        "Attach files by dragging & dropping,": "Aldonu dosierojn per trenado kaj faligo,",
        "selecting or pasting them": "elekto aŭ algluo",
        "selecting or pasting them.": "elekto aŭ algluo.",
        "Paste, drop, or click to add files":
            "Algluu, faligu aŭ alklaku por aldoni dosierojn",
        "Paste, drop, or click to add files.":
            "Algluu, faligu aŭ alklaku por aldoni dosierojn.",
        "Paste, drop, or click to add files (images, .zip, .pdf, etc.)":
            "Algluu, faligu aŭ alklaku por aldoni dosierojn (bildojn, .zip, .pdf, ktp.)",
        "Paste, drop, or": "Algluu, faligu aŭ",
        "click to add files": "alklaku por aldoni dosierojn",
        "Upload files": "Alŝuti dosierojn",
        "Choose files": "Elekti dosierojn",
        "Select files": "Elekti dosierojn",
        "Uploading...": "Alŝutante...",
        "Uploading…": "Alŝutante…",
        "File upload failed": "La alŝuto de la dosiero malsukcesis",
        "Try again": "Provi denove",

        // Administrado de diskutoj kaj komentoj
        "Delete": "Forigi",
        "Delete comment": "Forigi la komenton",
        "Delete discussion": "Forigi la diskuton",
        "Close": "Fermi",
        "Close discussion": "Fermi la diskuton",
        "Reopen discussion": "Remalfermi la diskuton",
        "Lock conversation": "Ŝlosi la konversacion",
        "Unlock conversation": "Malŝlosi la konversacion",
        "Pin discussion": "Alpingli la diskuton",
        "Unpin discussion": "Malalpingli la diskuton",
        "Transfer discussion": "Transigi la diskuton",
        "Convert to issue": "Konverti al problemo",
        "Report content": "Raporti la enhavon",
        "Report abuse": "Raporti misuzon",
        "Edit discussion": "Redakti la diskuton",
        "Edit comment": "Redakti la komenton",
        "Discussion actions": "Agoj pri la diskuto",
        "Comment actions": "Agoj pri la komento",

        // Sciigoj kaj flanka panelo
        "Notifications": "Sciigoj",
        "Subscribe": "Aboni",
        "Unsubscribe": "Malaboni",
        "Subscribe to this discussion": "Aboni ĉi tiun diskuton",
        "Unsubscribe from this discussion": "Malaboni ĉi tiun diskuton",
        "You’re receiving notifications because you’re subscribed to this thread.":
            "Vi ricevas sciigojn, ĉar vi abonas ĉi tiun diskuton.",
        "You're receiving notifications because you're subscribed to this thread.":
            "Vi ricevas sciigojn, ĉar vi abonas ĉi tiun diskuton.",
        "Participants": "Partoprenantoj",
        "Assignees": "Respondeculoj",
        "None yet": "Ankoraŭ neniu",
        "No labels": "Neniuj etikedoj",
        "Apply labels to this discussion": "Aldoni etikedojn al ĉi tiu diskuto",
        "Select labels": "Elekti etikedojn",
        "Search labels": "Serĉi etikedojn",
        "Unsubscribe from notifications": "Malaboni sciigojn",
        "Community guidelines": "Komunumaj gvidlinioj",
        "Code of conduct": "Kondutkodo",

        // Paĝopiedo
        "Footer": "Paĝopiedo",
        "Footer navigation": "Navigado de la paĝopiedo",
        "Terms": "Uzkondiĉoj",
        "Privacy": "Privateco",
        "Status": "Stato",
        "Community": "Komunumo",
        "Docs": "Dokumentaro",
        "Contact": "Kontakto",
        "Manage cookies": "Administri kuketojn",
        "Do not share my personal information":
            "Ne kundividu miajn personajn informojn",
    // Pliaj helptekstoj kaj rimedoj
        "If this doesn’t look right you can choose a different category.":
            "Se ĉi tiu kategorio ne ŝajnas taŭga, vi povas elekti alian.",
        "If this doesn't look right you can choose a different category.":
            "Se ĉi tiu kategorio ne ŝajnas taŭga, vi povas elekti alian.",
        "Ask a question, start a conversation, or make an announcement":
            "Faru demandon, komencu konversacion aŭ publikigu anoncon",
        "Helpful resources": "Utilaj rimedoj"
    }));

    // Traduku nur klare difinitajn interfacajn ŝablonojn,
    // ne arbitrajn frazojn el uzantaj kontribuoj.
    const PATTERNS = [
        [
            /^(\d+) comments?$/i,
            (_, n) => `${n} ${n === "1" ? "komento" : "komentoj"}`
        ],
        [
            /^(\d+) repl(?:y|ies)$/i,
            (_, n) => `${n} ${n === "1" ? "respondo" : "respondoj"}`
        ],
        [
            /^(\d+) participants?$/i,
            (_, n) => `${n} ${n === "1" ? "partoprenanto" : "partoprenantoj"}`
        ],
        [
            /^(\d+) discussions?$/i,
            (_, n) => `${n} ${n === "1" ? "diskuto" : "diskutoj"}`
        ],
        [
            /^(\d+) upvotes?$/i,
            (_, n) => `${n} ${n === "1" ? "subtena voĉo" : "subtenaj voĉoj"}`
        ],
        [
            /^View all (\d+) replies$/i,
            (_, n) => `Vidi ĉiujn ${n} respondojn`
        ],
        [
            /^View all (\d+) comments$/i,
            (_, n) => `Vidi ĉiujn ${n} komentojn`
        ]
    ];

    const ATTRIBUTES = ["title", "aria-label", "placeholder"];

    // Ne ŝanĝu uzantajn kontribuojn aŭ teknikajn elementojn.
    // Tekstareoj ne aperas ĉi tie, por ke iliaj lokokupiloj
    // restu tradukeblaj; ilian enhavon protektas processText().
    const EXCLUDED = [
        "script",
        "style",
        "noscript",
        "template",
        "pre",
        "code",
        "kbd",
        "samp",
        '[contenteditable]:not([contenteditable="false"])',
        ".markdown-body",
        ".comment-body",
        ".js-comment-body",
        ".js-discussion-title",
        ".discussion-title",
        '[data-testid="discussion-title"]',
        '[data-testid="issue-title"]',
        '[itemprop="name"]',
        ".author",
        ".user-mention",
        "time",
        "relative-time"
    ].join(",");

    // Konservu la originalojn por restarigi ankoraŭ videblajn
    // interfacajn elementojn post foriro el la diskutpaĝaro.
    const changedTexts = new Map();
    const changedAttributes = new Map();

    let active = false;
    let scheduled = false;
    const pendingRoots = new Set();

    function inScope() {
        return DISCUSSIONS_PATH.test(location.pathname);
    }

    function protectedElement(element) {
        if (!element || element.closest(EXCLUDED)) return true;

        // Protektu la titolon de diskuto sur ĝia propra paĝo.
        if (
            /\/discussions\/\d+(?:\/|$)/i.test(location.pathname) &&
            element.closest("h1")
        ) {
            return true;
        }

        // Protektu ligilajn diskutotitolojn en superrigardoj.
        const link = element.closest("a[href]");

        if (link) {
            try {
                const url = new URL(
                    link.getAttribute("href"),
                    location.href
                );

                if (
                    url.origin === location.origin &&
                    /^\/AndreasKueck\/informtabulo\/discussions\/\d+\/?$/i
                        .test(url.pathname)
                ) {
                    return true;
                }
            } catch {
                // Ignoru nevalidajn ligilojn.
            }
        }

        return false;
    }

    function translate(value) {
        if (!value || value.length > 500) return value;

        // Konservu la blankspacojn antaŭ kaj post la teksto.
        const parts = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
        const key = parts[2].replace(/\s+/g, " ");

        let translated = DICTIONARY.get(key);

        // Konservu klavkombinojn en etikedoj de formatiloj,
        // ekzemple en "Add bold text (Ctrl+B)".
        if (translated === undefined) {
            const shortcut = key.match(/^(.+?)(\s+\([^()]+\))$/);

            if (shortcut) {
                const baseTranslation = DICTIONARY.get(shortcut[1]);

                if (baseTranslation !== undefined) {
                    translated = baseTranslation + shortcut[2];
                }
            }
        }

        if (translated === undefined) {
            for (const [pattern, replacement] of PATTERNS) {
                if (pattern.test(key)) {
                    translated = key.replace(pattern, replacement);
                    break;
                }
            }
        }

        return translated === undefined
            ? value
            : parts[1] + translated + parts[3];
    }

    function processText(node) {
        const parent = node.parentElement;

        if (protectedElement(parent)) return;

        // Neniam modifu la tekston enigitan en tekstareon.
        if (parent.closest("textarea")) return;

        const original = node.nodeValue;
        const translated = translate(original);

        if (translated === original) return;

        changedTexts.set(node, { original, translated });
        node.nodeValue = translated;
    }

    function processAttributes(element) {
        if (protectedElement(element)) return;

        // Traduku nur interfacajn atributojn.
        // La valoroj de enigkampoj restas netuŝitaj.
        for (const name of ATTRIBUTES) {
            if (!element.hasAttribute(name)) continue;

            const original = element.getAttribute(name);
            const translated = translate(original);

            if (translated === original) continue;

            let records = changedAttributes.get(element);

            if (!records) {
                records = new Map();
                changedAttributes.set(element, records);
            }

            records.set(name, { original, translated });
            element.setAttribute(name, translated);
        }
    }

    function scan(root) {
        if (!root.isConnected) return;

        if (root.nodeType === Node.TEXT_NODE) {
            processText(root);
            return;
        }

        if (root.nodeType !== Node.ELEMENT_NODE) return;
        if (protectedElement(root)) return;

        processAttributes(root);

        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    if (
                        node.nodeType === Node.ELEMENT_NODE &&
                        protectedElement(node)
                    ) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let node;

        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.TEXT_NODE) {
                processText(node);
            } else {
                processAttributes(node);
            }
        }
    }

    function restore() {
        // Restarigu nur tekstojn, kiuj ankoraŭ egalas al
        // la traduko farita de ĉi tiu skripto.
        for (const [node, record] of changedTexts) {
            if (
                node.isConnected &&
                node.nodeValue === record.translated
            ) {
                node.nodeValue = record.original;
            }
        }

        for (const [element, records] of changedAttributes) {
            if (!element.isConnected) continue;

            for (const [name, record] of records) {
                if (element.getAttribute(name) === record.translated) {
                    element.setAttribute(name, record.original);
                }
            }
        }

        changedTexts.clear();
        changedAttributes.clear();
    }

    function flush() {
        scheduled = false;
        const nowActive = inScope();

        if (!nowActive) {
            if (active) restore();

            active = false;
            pendingRoots.clear();
            return;
        }

        if (!active) pendingRoots.add(document.body);
        active = true;

        // Ne konservu referencojn al jam forigitaj DOM-nodoj.
        for (const node of changedTexts.keys()) {
            if (!node.isConnected) changedTexts.delete(node);
        }

        for (const element of changedAttributes.keys()) {
            if (!element.isConnected) changedAttributes.delete(element);
        }

        const roots = [...pendingRoots].filter(
            root => root?.isConnected
        );

        pendingRoots.clear();

        // Ne trairu subarbon aparte, se ĝia praulo jam estas prilaborota.
        const rootSet = new Set(roots);

        for (const root of roots) {
            let parent = root.parentNode;

            while (parent && !rootSet.has(parent)) {
                parent = parent.parentNode;
            }

            if (!parent) scan(root);
        }
    }

    function schedule(root) {
        if (root) pendingRoots.add(root);
        if (scheduled) return;

        scheduled = true;
        requestAnimationFrame(flush);
    }

    // Observu ankaŭ poste ŝargitajn menuojn, formularojn kaj dialogojn.
    const observer = new MutationObserver(records => {
        for (const record of records) {
            if (record.type === "childList") {
                for (const node of record.addedNodes) {
                    pendingRoots.add(node);
                }
            } else {
                pendingRoots.add(record.target);
            }
        }

        schedule();
    });

    observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ATTRIBUTES
    });

    // Reagu al la navigado de GitHub sen plena reŝargo de la paĝo.
    for (const eventName of ["turbo:load", "turbo:render", "pjax:end"]) {
        document.addEventListener(
            eventName,
            () => schedule(document.body)
        );
    }

    window.addEventListener(
        "popstate",
        () => schedule(document.body)
    );

    window.addEventListener(
        "pageshow",
        () => schedule(document.body)
    );

    // Aldonu enkonstruitan helpilon por tekstoj, kiujn la
    // aŭtomata tradukado eble ne rekonas pro ilia HTML-strukturo.
    function installLanguageHelp() {
        const ID = "informtabulo-esperanta-lingva-helpo";

        if (document.getElementById(ID)) return;

        const host = document.createElement("div");
        host.id = ID;
        host.hidden = true;

        // La ombra DOM izolas la stilojn kaj malebligas,
        // ke la tradukilo modifu la tekstojn de la helpilo.
        const shadow = host.attachShadow({ mode: "open" });

        // Ĉi tiu fiksa HTML-enhavo ne enhavas uzantajn datumojn.
        shadow.innerHTML = `
            <style>
                :host {
                    all: initial;
                    position: fixed;
                    right: 16px;
                    bottom: 16px;
                    z-index: 9999;
                    width: min(370px, calc(100vw - 32px));
                    color-scheme: light dark;
                    font-family: system-ui, sans-serif;
                    font-size: 13px;
                    line-height: 1.5;
                }

                :host([hidden]) {
                    display: none !important;
                }

                details {
                    color: #1f2328;
                    background: #ffffff;
                    border: 1px solid #8c959f;
                    border-radius: 8px;
                    box-shadow: 0 4px 18px #0003;
                    overflow: hidden;
                }

                summary {
                    padding: 10px 12px;
                    cursor: pointer;
                    font-weight: 600;
                }

                summary:focus-visible {
                    outline: 2px solid #0969da;
                    outline-offset: -3px;
                }

                .content {
                    padding: 0 12px 12px;
                    max-height: 45vh;
                    overflow-y: auto;
                }

                p {
                    margin: 0 0 12px;
                }

                dl {
                    margin: 0;
                }

                dt {
                    margin-top: 12px;
                    color: #59636e;
                }

                dd {
                    margin: 3px 0 0;
                    font-weight: 600;
                }

                @media (prefers-color-scheme: dark) {
                    details {
                        color: #f0f6fc;
                        background: #151b23;
                        border-color: #59636e;
                    }

                    dt {
                        color: #b1bac4;
                    }
                }

                                .move-handle {
                    display: block;
                    box-sizing: border-box;
                    width: 100%;
                    padding: 6px 12px;
                    border: 1px solid #8c959f;
                    border-bottom: none;
                    border-radius: 8px 8px 0 0;
                    background: #eaeef2;
                    color: #1f2328;
                    font: inherit;
                    font-weight: 600;
                    text-align: center;
                    cursor: grab;
                    touch-action: none;
                    user-select: none;
                }

                .move-handle.dragging {
                    cursor: grabbing;
                }

                .move-handle:focus-visible {
                    outline: 2px solid #0969da;
                    outline-offset: -3px;
                }

                details {
                    border-radius: 0 0 8px 8px;
                }

                @media (prefers-color-scheme: dark) {
                    .move-handle {
                        color: #f0f6fc;
                        background: #252d38;
                        border-color: #59636e;
                    }
                }

            </style>

            <button
                type="button"
                class="move-handle"
                lang="eo"
                aria-label="Ŝovi la lingvan helpilon"
                title="Trenu por ŝovi; aŭ fokusu ĉi tiun butonon kaj uzu la sagoklavojn."
            >⠿ Ŝovi</button>

            <details open lang="eo">
                <summary>Lingva helpo · Esperanto</summary>

                <div class="content">
                    <p>
                        Tradukoj de kelkaj anglaj helptekstoj
                        de la interfaco:
                    </p>

                    <dl>
                        <dt lang="en">Markdown is supported</dt>
                        <dd>Markdown estas subtenata.</dd>

                        <dt lang="en">Type / to search</dt>
                        <dd>Tajpu / por serĉi.</dd>

                        <dt lang="en">
                            Ask a question, start a conversation,
                            or make an announcement
                        </dt>
                        <dd>
                            Faru demandon, komencu konversacion
                            aŭ publikigu anoncon.
                        </dd>
                                                <!-- Klarigoj pri la serĉaj operatoroj -->
                        <dt lang="en"><code>is:</code></dt>
                        <dd>
                            Filtras laŭ stato aŭ eco de diskuto.
                            La serĉa operatoro restu
                            <code>is:</code>; ne traduku ĝin
                            en serĉdemandoj.
                        </dd>

                        <dt lang="en"><code>category:</code></dt>
                        <dd>
                            Filtras laŭ kategorio.
                            La serĉa operatoro restu
                            <code>category:</code>; ne traduku ĝin
                            en serĉdemandoj.
                        </dd>

                        <!-- Filtrado kaj komunumaj statistikoj -->
                        <dt lang="en">Filter:</dt>
                        <dd>Filtrilo:</dd>

                        <dt lang="en">Community Insights</dt>
                        <dd>Komunumaj statistikoj</dd>

                        <dt lang="en">Most helpful</dt>
                        <dd>Plej helpemaj</dd>

                        <dt lang="en">
                            Be sure to mark someone’s comment as an
                            answer if it helps you resolve your
                            question — they deserve the credit! 💕
                        </dt>
                        <dd>
                            Nepre marku ies komenton kiel respondon,
                            se ĝi helpas vin solvi vian demandon —
                            tiu persono meritas la agnoskon! 💕
                        </dd>

                        <!-- Informoj pri mankantaj serĉrezultoj -->
                        <dt lang="en">
                            There are no matching discussions.
                        </dt>
                        <dd>
                            Neniuj diskutoj kongruas kun la serĉo.
                        </dd>

                        <dt lang="en">
                            You can open a new discussion to ask
                            questions about this repository or
                            get help.
                        </dt>
                        <dd>
                            Vi povas komenci novan diskuton por
                            fari demandojn pri ĉi tiu deponejo
                            aŭ ricevi helpon.
                        </dd>
                                                <!-- Klarigo pri la celo de la diskutoj -->
                        <dt lang="en">
                            Discussions are to share announcements,
                            create conversation in your community,
                            answer questions, and more. To get started,
                            you can create a new discussion.
                        </dt>
                        <dd>
                            Diskutoj servas por publikigi anoncojn,
                            komenci konversaciojn en via komunumo,
                            respondi demandojn kaj pli. Por komenci,
                            vi povas krei novan diskuton.
                        </dd>
                    </dl>
                </div>
            </details>
        `;

                // Ebligu ŝovadon per muso, tuŝo aŭ sagoklavoj.
        const moveHandle = shadow.querySelector(".move-handle");

        let dragState = null;
        let manuallyPositioned = false;

        function setHelpPosition(left, top) {
            const rect = host.getBoundingClientRect();
            const margin = 8;

            // Konservu la helpilon ene de la videbla fenestro.
            const maxLeft = Math.max(
                margin,
                window.innerWidth - rect.width - margin
            );

            const maxTop = Math.max(
                margin,
                window.innerHeight - rect.height - margin
            );

            const safeLeft = Math.min(
                Math.max(margin, left),
                maxLeft
            );

            const safeTop = Math.min(
                Math.max(margin, top),
                maxTop
            );

            host.style.left = `${safeLeft}px`;
            host.style.top = `${safeTop}px`;
            host.style.right = "auto";
            host.style.bottom = "auto";

            manuallyPositioned = true;
        }

        moveHandle.addEventListener("pointerdown", event => {
            if (!event.isPrimary || event.button !== 0) return;

            const rect = host.getBoundingClientRect();

            dragState = {
                pointerId: event.pointerId,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top
            };

            moveHandle.setPointerCapture(event.pointerId);
            moveHandle.classList.add("dragging");
            moveHandle.focus({ preventScroll: true });

            event.preventDefault();
        });

        moveHandle.addEventListener("pointermove", event => {
            if (
                !dragState ||
                event.pointerId !== dragState.pointerId
            ) {
                return;
            }

            setHelpPosition(
                event.clientX - dragState.offsetX,
                event.clientY - dragState.offsetY
            );
        });

        function stopDragging(event) {
            if (
                !dragState ||
                event.pointerId !== dragState.pointerId
            ) {
                return;
            }

            const pointerId = dragState.pointerId;
            dragState = null;

            moveHandle.classList.remove("dragging");

            if (moveHandle.hasPointerCapture(pointerId)) {
                moveHandle.releasePointerCapture(pointerId);
            }
        }

        moveHandle.addEventListener("pointerup", stopDragging);
        moveHandle.addEventListener("pointercancel", stopDragging);
        moveHandle.addEventListener(
            "lostpointercapture",
            stopDragging
        );

        // Sagoklavoj ŝovas je 10 bilderoj; kun Shift je 40.
        moveHandle.addEventListener("keydown", event => {
            const directions = {
                ArrowLeft: [-1, 0],
                ArrowRight: [1, 0],
                ArrowUp: [0, -1],
                ArrowDown: [0, 1]
            };

            const direction = directions[event.key];
            if (!direction) return;

            event.preventDefault();

            const step = event.shiftKey ? 40 : 10;
            const rect = host.getBoundingClientRect();

            setHelpPosition(
                rect.left + direction[0] * step,
                rect.top + direction[1] * step
            );
        });

        function keepHelpVisible() {
            if (
                !manuallyPositioned ||
                !host.isConnected ||
                host.hidden
            ) {
                return;
            }

            const rect = host.getBoundingClientRect();
            setHelpPosition(rect.left, rect.top);
        }

        // Korektu la pozicion post ŝanĝo de la fenestra grandeco.
        window.addEventListener("resize", keepHelpVisible);

        // Korektu ĝin ankaŭ post malfaldo aŭ faldo de la helpilo.
        shadow.querySelector("details").addEventListener(
            "toggle",
            () => requestAnimationFrame(keepHelpVisible)
        );

        function updateHelpVisibility() {
            // Uzu la saman paĝaran limigon kiel la tradukilo.
            const shouldHide =
                !DISCUSSIONS_PATH.test(location.pathname);

            if (host.hidden !== shouldHide) {
                host.hidden = shouldHide;
            }

            // Realdonu la helpilon post eventuala forigo
            // dum la interna navigado de GitHub.
            if (!host.isConnected && !shouldHide && document.body) {
                document.body.appendChild(host);
            }
        }

        for (const eventName of [
            "turbo:load",
            "turbo:render",
            "pjax:end"
        ]) {
            document.addEventListener(
                eventName,
                updateHelpVisibility
            );
        }

        window.addEventListener(
            "popstate",
            updateHelpVisibility
        );

        window.addEventListener(
            "pageshow",
            updateHelpVisibility
        );

        // Rezerva kontrolo por navigado sen la supraj eventoj.
        window.setInterval(updateHelpVisibility, 1000);

        updateHelpVisibility();
    }

    // Aktivigu la aldonan lingvan helpilon.
    installLanguageHelp();

    // Traduku la jam ŝargitan interfacon.
    schedule(document.body);
})();
