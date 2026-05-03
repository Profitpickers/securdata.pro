#!/usr/bin/env python3
"""
bonifica.py — Pipeline di bonifica Markdown pre-AGI  v3.1
SecurData Pro — https://securdata.pro
Guida di riferimento: "Markdown Puro per Dataset AI Generativa" v2.1

Utilizzo:
    python bonifica.py input.md [opzioni]

Flag disponibili:
    --output FILE        Salva il testo bonificato su file
    --strict             Interrompe se vengono rilevati artefatti critici
    --report FILE        Salva il report in formato JSON
    --fix-backslash      Rimuovi backslash-escape inutili (modulo 1)
    --fix-html           Decodifica entità HTML (modulo 4)
    --fix-toxic          Rimuovi caratteri Unicode tossici (modulo 6)
    --fix-typography     Normalizza caratteri tipografici a ASCII (modulo 7)
    --check-homoglyphs   Segnala caratteri omoglifi — solo report (modulo 3)
    --check-pdf          Rileva artefatti da estrazione PDF (modulo 5)
    --full-check         Esegui tutti i moduli in sequenza

Esempio:
    python bonifica.py articolo.md --full-check --output clean.md --report report.json
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import List, Tuple


# ─────────────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def _split_code_blocks(testo: str) -> List[Tuple[str, bool]]:
    """Divide il testo in segmenti, marcando quelli dentro blocchi ``` come codice.

    Args:
        testo: Testo Markdown da analizzare.

    Returns:
        Lista di tuple (segmento, è_codice). I segmenti con è_codice=True
        non devono essere modificati dai moduli di bonifica.
    """
    pattern = re.compile(r"(```(?:[^\n]*)\n.*?```)", re.DOTALL)
    segmenti: List[Tuple[str, bool]] = []
    ultimo = 0
    for match in pattern.finditer(testo):
        inizio, fine = match.start(), match.end()
        if inizio > ultimo:
            segmenti.append((testo[ultimo:inizio], False))
        segmenti.append((testo[inizio:fine], True))
        ultimo = fine
    if ultimo < len(testo):
        segmenti.append((testo[ultimo:], False))
    return segmenti


def calcola_sha256(testo: str) -> str:
    """Calcola il digest SHA-256 del testo fornito (UTF-8).

    Args:
        testo: Stringa da sottoporre a hash.

    Returns:
        Stringa esadecimale del digest SHA-256 (64 caratteri).
    """
    return hashlib.sha256(testo.encode("utf-8")).hexdigest()


# ─────────────────────────────────────────────────────────────────────────────
# MODULO 1 — rimuovi_backslash_fantasma
# ─────────────────────────────────────────────────────────────────────────────

# Caratteri che i converter (pandoc, Word export) escappano inutilmente
_BACKSLASH_TARGETS = set(r"*.!()[]{}\+-=#|`~")

# Regex per backslash seguiti da uno dei caratteri target
_BACKSLASH_RE = re.compile(r"\\([*.!\(\)\[\]{}\+\-=#|`~\\])")


def rimuovi_backslash_fantasma(testo: str) -> Tuple[str, int]:
    """Rimuove i backslash-escape inutili aggiunti dai converter Markdown.

    Gestisce i casi: \\* \\. \\! \\( \\) \\[ \\] \\{ \\} \\+ \\- \\= \\# \\| \\` \\~
    Non rimuove \\n e \\t (escape di controllo legittimi).
    Non modifica il contenuto all'interno di blocchi codice (tra ``` e ```).

    Args:
        testo: Testo Markdown da bonificare.

    Returns:
        Tupla (testo_pulito, numero_rimozioni).
    """
    segmenti = _split_code_blocks(testo)
    parti: List[str] = []
    totale = 0

    for segmento, è_codice in segmenti:
        if è_codice:
            parti.append(segmento)
        else:
            nuovo, n = _BACKSLASH_RE.subn(r"\1", segmento)
            parti.append(nuovo)
            totale += n

    return "".join(parti), totale


# ─────────────────────────────────────────────────────────────────────────────
# MODULO 2 — normalizza_tabelle
# ─────────────────────────────────────────────────────────────────────────────

# Soglia: almeno 3 spazi consecutivi per rilevare pseudo-colonne
_PSEUDO_TABELLA_RE = re.compile(r"\S[ ]{3,}\S")
# Residui di code fence mal convertiti: riga isolata con solo backtick o tilde
_CODE_FENCE_RESIDUO_RE = re.compile(r"^[`~]{3,}\s*$")


def normalizza_tabelle(testo: str) -> Tuple[str, List[dict]]:
    """Rileva pseudo-tabelle senza pipe e residui di code fence mal convertiti.

    Non converte automaticamente le pseudo-tabelle perché la struttura potrebbe
    essere ambigua. Segnala ogni occorrenza con numero di riga per revisione umana.

    Args:
        testo: Testo Markdown da analizzare.

    Returns:
        Tupla (testo_invariato, lista_warning_con_numero_riga).
        Ogni warning è un dict con chiavi: {riga, tipo, contenuto, azione_consigliata}.
    """
    warning: List[dict] = []
    righe = testo.split("\n")

    for i, riga in enumerate(righe, start=1):
        if _PSEUDO_TABELLA_RE.search(riga):
            warning.append({
                "riga": i,
                "tipo": "pseudo_tabella",
                "contenuto": riga.strip(),
                "azione_consigliata": "verifica — converti in tabella Markdown con pipe | se appropriato",
            })
        elif _CODE_FENCE_RESIDUO_RE.match(riga):
            warning.append({
                "riga": i,
                "tipo": "code_fence_residuo",
                "contenuto": riga.strip(),
                "azione_consigliata": "verifica — possibile residuo di code fence mal convertito",
            })

    return testo, warning


# ─────────────────────────────────────────────────────────────────────────────
# MODULO 3 — rileva_omoglifi
# ─────────────────────────────────────────────────────────────────────────────

# Mappa minima critica: omoglifo → sostituto ASCII consigliato
# Cirillico
_OMOGLIFI: dict = {
    "\u0430": ("а", "a", "Cirillico"),   # а → a
    "\u0435": ("е", "e", "Cirillico"),   # е → e
    "\u043E": ("о", "o", "Cirillico"),   # о → o
    "\u0440": ("р", "r", "Cirillico"),   # р → r
    "\u0441": ("с", "c", "Cirillico"),   # с → c
    "\u0445": ("х", "x", "Cirillico"),   # х → x
    # Greco
    "\u03BF": ("ο", "o", "Greco"),       # ο → o
    "\u03B1": ("α", "a", "Greco"),       # α → a
    "\u03B5": ("ε", "e", "Greco"),       # ε → e
    "\u03B9": ("ι", "i", "Greco"),       # ι → i
}


def rileva_omoglifi(testo: str) -> List[dict]:
    """Cerca caratteri visivamente identici ai latini ma da altri blocchi Unicode.

    Analizza Cirillico (а е о р с х) e Greco (ο α ε ι).
    NON sostituisce automaticamente: restituisce solo un report per revisione umana.

    Args:
        testo: Testo Markdown da analizzare.

    Returns:
        Lista di dict, uno per ogni occorrenza trovata, con chiavi:
        {posizione, carattere, codepoint, blocco_unicode, sostituto_ascii_consigliato}.
    """
    trovati: List[dict] = []
    for pos, char in enumerate(testo):
        if char in _OMOGLIFI:
            _, sostituto, blocco = _OMOGLIFI[char]
            trovati.append({
                "posizione": pos,
                "carattere": char,
                "codepoint": f"U+{ord(char):04X}",
                "blocco_unicode": blocco,
                "sostituto_ascii_consigliato": sostituto,
            })
    return trovati


# ─────────────────────────────────────────────────────────────────────────────
# MODULO 4 — decodifica_entita_html
# ─────────────────────────────────────────────────────────────────────────────

# Entità da convertire (ordine rilevante: le numeriche prima di &amp;)
_ENTITA_HTML: List[Tuple[str, str]] = [
    ("&#160;", " "),
    ("&#38;",  "&"),
    ("&nbsp;", " "),
    ("&amp;",  "&"),
    ("&lt;",   "<"),
    ("&gt;",   ">"),
    ("&quot;", '"'),
    ("&apos;", "'"),
]

_ENTITA_RE = re.compile(
    "|".join(re.escape(e) for e, _ in _ENTITA_HTML)
)
_ENTITA_MAP = dict(_ENTITA_HTML)


def decodifica_entita_html(testo: str) -> Tuple[str, int]:
    """Converte le entità HTML comuni in caratteri testuali normali.

    Converte: &amp; &nbsp; &lt; &gt; &quot; &apos; &#160; &#38;
    Non modifica il contenuto all'interno di blocchi codice (tra ``` e ```).

    Args:
        testo: Testo Markdown da bonificare.

    Returns:
        Tupla (testo_convertito, numero_conversioni).
    """
    segmenti = _split_code_blocks(testo)
    parti: List[str] = []
    totale = 0

    for segmento, è_codice in segmenti:
        if è_codice:
            parti.append(segmento)
        else:
            def _sostituisci(m: re.Match) -> str:  # type: ignore[type-arg]
                nonlocal totale
                totale += 1
                return _ENTITA_MAP[m.group(0)]

            parti.append(_ENTITA_RE.sub(_sostituisci, segmento))

    return "".join(parti), totale


# ─────────────────────────────────────────────────────────────────────────────
# MODULO 5 — rileva_artefatti_pdf
# ─────────────────────────────────────────────────────────────────────────────

_NUMERO_PAGINA_RE = re.compile(r"^\s*\d{1,3}\s*$")
_PAGINA_X_DI_Y_RE = re.compile(
    r"^\s*(pagina\s+\d+\s+di\s+\d+|page\s+\d+\s+of\s+\d+)\s*$",
    re.IGNORECASE,
)
_SEPARATORE_RE = re.compile(r"^\s*[-=]{5,}\s*$")


def rileva_artefatti_pdf(testo: str) -> List[dict]:
    """Rileva pattern tipici di artefatti da estrazione PDF.

    Individua:
    - Numeri di pagina isolati (riga con solo un intero 1-999)
    - Pattern "Pagina X di Y" / "Page X of Y" su riga isolata
    - Righe identiche che si ripetono ogni N righe (header/footer)
    - Sequenze di trattini o uguale che simulano separatori di pagina

    Args:
        testo: Testo Markdown da analizzare.

    Returns:
        Lista di dict, uno per ogni artefatto, con chiavi:
        {tipo, riga, contenuto, azione_consigliata ("rimuovi" | "verifica")}.
    """
    artefatti: List[dict] = []
    righe = testo.split("\n")

    # Contatore frequenze per rilevare righe ripetute (header/footer)
    frequenza: dict = {}
    for i, riga in enumerate(righe, start=1):
        stripped = riga.strip()
        if stripped:
            frequenza.setdefault(stripped, []).append(i)

    righe_ripetute: set = set()
    for contenuto, posizioni in frequenza.items():
        if len(posizioni) >= 3:
            righe_ripetute.add(contenuto)

    for i, riga in enumerate(righe, start=1):
        stripped = riga.strip()

        if _NUMERO_PAGINA_RE.match(riga) and stripped:
            artefatti.append({
                "tipo": "numero_pagina",
                "riga": i,
                "contenuto": stripped,
                "azione_consigliata": "rimuovi",
            })
        elif _PAGINA_X_DI_Y_RE.match(stripped):
            artefatti.append({
                "tipo": "intestazione_pagina",
                "riga": i,
                "contenuto": stripped,
                "azione_consigliata": "rimuovi",
            })
        elif _SEPARATORE_RE.match(riga):
            artefatti.append({
                "tipo": "separatore_pagina",
                "riga": i,
                "contenuto": stripped,
                "azione_consigliata": "verifica",
            })
        elif stripped in righe_ripetute:
            artefatti.append({
                "tipo": "header_footer_ripetuto",
                "riga": i,
                "contenuto": stripped,
                "azione_consigliata": "rimuovi",
            })

    return artefatti


# ─────────────────────────────────────────────────────────────────────────────
# MODULO 6 — rimuovi_caratteri_tossici
# ─────────────────────────────────────────────────────────────────────────────

# Caratteri di controllo e invisibili tossici per dataset AI.
# Fonte: Guida "Markdown Puro per Dataset AI Generativa" v2.1 §1.2
# Ogni voce: (codepoint, nome_breve, livello_rischio)
_CARATTERI_TOSSICI: List[Tuple[int, str, str]] = [
    # ── Controllo C0/C1 ────────────────────────────────────────────────────────
    (0x0000, "NULL",                         "critico"),
    (0x0008, "BACKSPACE",                    "alto"),
    (0x000B, "VERTICAL_TAB",                 "medio"),
    (0x000C, "FORM_FEED",                    "medio"),
    (0x001A, "SUBSTITUTE_EOF_DOS",           "alto"),
    (0x001B, "ESCAPE_ANSI",                  "critico"),
    # ── Spazi non-standard ─────────────────────────────────────────────────────
    (0x00A0, "NO_BREAK_SPACE",               "medio"),
    (0x00AD, "SOFT_HYPHEN",                  "alto"),
    # ── Zero-width e formato (usati per fingerprinting) ────────────────────────
    (0x200B, "ZERO_WIDTH_SPACE",             "critico"),
    (0x200C, "ZERO_WIDTH_NON_JOINER",        "critico"),
    (0x200D, "ZERO_WIDTH_JOINER",            "critico"),
    (0x200E, "LEFT_TO_RIGHT_MARK",           "alto"),
    (0x200F, "RIGHT_TO_LEFT_MARK",           "alto"),
    (0x2028, "LINE_SEPARATOR",               "medio"),
    (0x2029, "PARAGRAPH_SEPARATOR",          "medio"),
    (0x202A, "LTR_EMBEDDING",                "alto"),
    (0x202B, "RTL_EMBEDDING",                "alto"),
    (0x202C, "POP_DIRECTIONAL_FORMATTING",   "alto"),
    (0x202D, "LTR_OVERRIDE",                 "critico"),
    (0x202E, "RTL_OVERRIDE",                 "critico"),
    (0x2060, "WORD_JOINER",                  "alto"),
    (0x2061, "FUNCTION_APPLICATION",         "medio"),
    (0x2062, "INVISIBLE_TIMES",              "medio"),
    (0x2063, "INVISIBLE_SEPARATOR",          "medio"),
    (0x2064, "INVISIBLE_PLUS",               "medio"),
    (0x206A, "INHIBIT_SYMMETRIC_SWAPPING",   "alto"),
    (0x206B, "ACTIVATE_SYMMETRIC_SWAPPING",  "alto"),
    (0x206C, "INHIBIT_ARABIC_FORM_SHAPING",  "alto"),
    (0x206D, "ACTIVATE_ARABIC_FORM_SHAPING", "alto"),
    (0x206E, "NATIONAL_DIGIT_SHAPES",        "alto"),
    (0x206F, "NOMINAL_DIGIT_SHAPES",         "alto"),
    # ── BOM e non-characters ───────────────────────────────────────────────────
    (0xFEFF, "BYTE_ORDER_MARK_ZWNBSP",       "critico"),
    (0xFFFE, "NON_CHARACTER_FFFE",           "critico"),
    (0xFFFF, "NON_CHARACTER_FFFF",           "critico"),
]

# Set veloce per lookup O(1)
_TOSSICI_SET: set = {cp for cp, _, _ in _CARATTERI_TOSSICI}
# Mappa codepoint → (nome, rischio)
_TOSSICI_MAP: dict = {cp: (nome, rischio) for cp, nome, rischio in _CARATTERI_TOSSICI}

# Range non-character FDD0–FDEF (sempre tossici)
_FDD0_FDEF = range(0xFDD0, 0xFDF0)
# Range Private Use Area E000–F8FF (traccianti proprietari)
_PUA_START, _PUA_END = 0xE000, 0xF8FF


def rimuovi_caratteri_tossici(testo: str) -> Tuple[str, List[dict]]:
    """Rimuove i caratteri Unicode tossici per i dataset di AI generativa.

    Copre la lista critica definita nella Guida "Markdown Puro per Dataset AI
    Generativa" v2.1 §1.2: caratteri di controllo, zero-width, bidi override,
    BOM fuori posizione, non-characters FDD0-FDEF e Private Use Area.

    Il U+00A0 (NO-BREAK SPACE) viene convertito in spazio normale (U+0020)
    anziché eliminato. Tutti gli altri vengono rimossi.
    Tabulazioni (U+0009), line feed (U+000A) e carriage return (U+000D)
    sono esclusi dalla rimozione perché legittimi in Markdown.

    Args:
        testo: Testo Markdown da bonificare.

    Returns:
        Tupla (testo_pulito, lista_rimozioni).
        Ogni rimozione è un dict con chiavi:
        {posizione_originale, codepoint, nome, rischio, azione}.
    """
    rimozioni: List[dict] = []
    chars_out: List[str] = []

    for pos, ch in enumerate(testo):
        cp = ord(ch)

        # Converti NO-BREAK SPACE in spazio ordinario
        if cp == 0x00A0:
            rimozioni.append({
                "posizione_originale": pos,
                "codepoint": f"U+{cp:04X}",
                "nome": "NO_BREAK_SPACE",
                "rischio": "medio",
                "azione": "convertito_in_spazio",
            })
            chars_out.append(" ")
            continue

        # Tossici in lookup diretto
        if cp in _TOSSICI_SET:
            nome, rischio = _TOSSICI_MAP[cp]
            rimozioni.append({
                "posizione_originale": pos,
                "codepoint": f"U+{cp:04X}",
                "nome": nome,
                "rischio": rischio,
                "azione": "rimosso",
            })
            continue  # carattere eliminato

        # Non-characters FDD0–FDEF
        if cp in _FDD0_FDEF:
            rimozioni.append({
                "posizione_originale": pos,
                "codepoint": f"U+{cp:04X}",
                "nome": "NON_CHARACTER_FDD0_FDEF",
                "rischio": "critico",
                "azione": "rimosso",
            })
            continue

        # Private Use Area (segnala ma rimuove)
        if _PUA_START <= cp <= _PUA_END:
            rimozioni.append({
                "posizione_originale": pos,
                "codepoint": f"U+{cp:04X}",
                "nome": "PRIVATE_USE_AREA",
                "rischio": "variabile",
                "azione": "rimosso",
            })
            continue

        chars_out.append(ch)

    return "".join(chars_out), rimozioni


# ─────────────────────────────────────────────────────────────────────────────
# MODULO 7 — normalizza_tipografia
# ─────────────────────────────────────────────────────────────────────────────

# Sostituzioni tipografiche → ASCII.
# Fonte: Guida "Markdown Puro per Dataset AI Generativa" v2.1 §1.3
# Per dataset AI si preferiscono le forme ASCII per coerenza del tokenizer.
_TIPOGRAFIA: List[Tuple[str, str, str]] = [
    # virgolette curve doppie
    ("\u201C", '"', "virgoletta_aperta_doppia"),    # " → "
    ("\u201D", '"', "virgoletta_chiusa_doppia"),    # " → "
    # virgolette curve singole / apostrofo tipografico
    ("\u2018", "'", "virgoletta_aperta_singola"),   # ' → '
    ("\u2019", "'", "apostrofo_tipografico"),       # ' → '
    # trattini
    ("\u2014", "--", "em_dash"),                    # — → --
    ("\u2013", "-",  "en_dash"),                    # – → -
    # ellissi
    ("\u2026", "...", "ellissi_unicode"),            # … → ...
    # legature tipografiche (problematiche per OCR e ricerca)
    ("\uFB01", "fi", "legatura_fi"),                # ﬁ → fi
    ("\uFB02", "fl", "legatura_fl"),                # ﬂ → fl
    ("\uFB03", "ffi", "legatura_ffi"),              # ﬃ → ffi
    ("\uFB04", "ffl", "legatura_ffl"),              # ﬄ → ffl
    # spazio non-break → spazio ordinario (anche gestito in modulo 6)
    ("\u00A0", " ", "no_break_space"),              # → spazio
]

_TIPOGRAFIA_RE = re.compile(
    "|".join(re.escape(orig) for orig, _, _ in _TIPOGRAFIA)
)
_TIPOGRAFIA_MAP: dict = {orig: (asc, nome) for orig, asc, nome in _TIPOGRAFIA}


def normalizza_tipografia(testo: str) -> Tuple[str, List[dict]]:
    """Normalizza caratteri tipografici Unicode alle loro equivalenti forme ASCII.

    Converte virgolette curve, em/en dash, ellissi Unicode e legature tipografiche
    (ﬁ ﬂ ﬃ ﬄ) in caratteri ASCII equivalenti, per coerenza del tokenizer nei
    dataset di AI generativa.

    Fonte: Guida "Markdown Puro per Dataset AI Generativa" v2.1 §1.3.

    Args:
        testo: Testo Markdown da bonificare.

    Returns:
        Tupla (testo_normalizzato, lista_sostituzioni).
        Ogni sostituzione è un dict con chiavi:
        {posizione_originale, codepoint, nome, originale, sostituto}.
    """
    sostituzioni: List[dict] = []
    # Tracciamo le posizioni originali prima di modificare la stringa
    offset = 0
    risultato: List[str] = []
    ultimo = 0

    for m in _TIPOGRAFIA_RE.finditer(testo):
        orig_char = m.group(0)
        asc_char, nome = _TIPOGRAFIA_MAP[orig_char]
        cp = ord(orig_char[0])

        sostituzioni.append({
            "posizione_originale": m.start(),
            "codepoint": f"U+{cp:04X}",
            "nome": nome,
            "originale": orig_char,
            "sostituto": asc_char,
        })
        risultato.append(testo[ultimo:m.start()])
        risultato.append(asc_char)
        ultimo = m.end()

    risultato.append(testo[ultimo:])
    return "".join(risultato), sostituzioni


# ─────────────────────────────────────────────────────────────────────────────
# CLI — main()
# ─────────────────────────────────────────────────────────────────────────────

def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="bonifica",
        description="Pipeline di bonifica Markdown pre-AGI — SecurData Pro",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Esempi:\n"
            "  python bonifica.py articolo.md --full-check\n"
            "  python bonifica.py articolo.md --fix-backslash --fix-html --fix-toxic --fix-typography --output clean.md\n"
            "  python bonifica.py articolo.md --check-homoglyphs --report report.json\n"
        ),
    )
    parser.add_argument("input", help="File Markdown da bonificare")
    parser.add_argument("--output", metavar="FILE",
                        help="Salva il testo bonificato su file")
    parser.add_argument("--strict", action="store_true",
                        help="Interrompe con exit(1) se vengono rilevati artefatti critici")
    parser.add_argument("--report", metavar="FILE",
                        help="Salva il report completo in formato JSON")
    parser.add_argument("--fix-backslash", action="store_true",
                        help="Rimuovi backslash-escape inutili (modulo 1)")
    parser.add_argument("--fix-html", action="store_true",
                        help="Decodifica entità HTML (modulo 4)")
    parser.add_argument("--fix-toxic", action="store_true",
                        help="Rimuovi caratteri Unicode tossici — zero-width, BOM, bidi override ecc. (modulo 6)")
    parser.add_argument("--fix-typography", action="store_true",
                        help="Normalizza tipografia Unicode ad ASCII — virgolette curve, em-dash, legature (modulo 7)")
    parser.add_argument("--check-homoglyphs", action="store_true",
                        help="Segnala caratteri omoglifi — solo report (modulo 3)")
    parser.add_argument("--check-pdf", action="store_true",
                        help="Rileva artefatti da estrazione PDF (modulo 5)")
    parser.add_argument("--full-check", action="store_true",
                        help="Esegui tutti i moduli in sequenza")
    return parser


def main() -> None:
    """Entry-point CLI della pipeline di bonifica Markdown."""
    parser = _build_parser()
    args = parser.parse_args()

    # Lettura file di input
    input_path = Path(args.input)
    if not input_path.is_file():
        print(f"[ERRORE] File non trovato: {args.input}", file=sys.stderr)
        sys.exit(1)

    testo_originale = input_path.read_text(encoding="utf-8")
    testo = testo_originale
    report: dict = {
        "file_input": str(input_path.resolve()),
        "sha256_originale": calcola_sha256(testo_originale),
        "moduli": {},
    }

    # Modalità full-check: abilita tutti i moduli
    if args.full_check:
        args.fix_backslash = True
        args.fix_html = True
        args.fix_toxic = True
        args.fix_typography = True
        args.check_homoglyphs = True
        args.check_pdf = True

    ha_artefatti_critici = False

    # ── Modulo 1: backslash fantasma ──────────────────────────────────────────
    if args.fix_backslash:
        testo, n_backslash = rimuovi_backslash_fantasma(testo)
        report["moduli"]["backslash"] = {
            "rimozioni": n_backslash,
            "stato": "OK" if n_backslash == 0 else "MODIFICATO",
        }
        print(f"[BACKSLASH]  Rimozioni: {n_backslash}")

    # ── Modulo 2: tabelle (sempre eseguito come check) ────────────────────────
    _, warning_tabelle = normalizza_tabelle(testo)
    if warning_tabelle:
        report["moduli"]["tabelle"] = {
            "warning": len(warning_tabelle),
            "dettagli": warning_tabelle,
        }
        print(f"[TABELLE]    Warning: {len(warning_tabelle)}")
        for w in warning_tabelle[:5]:
            print(f"             riga {w['riga']}: {w['tipo']} — {w['contenuto'][:60]}")
        if len(warning_tabelle) > 5:
            print(f"             … e altri {len(warning_tabelle) - 5}")

    # ── Modulo 3: omoglifi ────────────────────────────────────────────────────
    if args.check_homoglyphs:
        omoglifi = rileva_omoglifi(testo)
        report["moduli"]["omoglifi"] = {
            "trovati": len(omoglifi),
            "dettagli": omoglifi,
        }
        print(f"[OMOGLIFI]   Trovati: {len(omoglifi)}")
        for o in omoglifi[:10]:
            print(
                f"             pos {o['posizione']}: {o['carattere']!r} "
                f"({o['codepoint']}, {o['blocco_unicode']}) "
                f"→ suggerito '{o['sostituto_ascii_consigliato']}'"
            )
        if len(omoglifi) > 10:
            print(f"             … e altri {len(omoglifi) - 10}")
        if omoglifi and args.strict:
            ha_artefatti_critici = True

    # ── Modulo 4: entità HTML ─────────────────────────────────────────────────
    if args.fix_html:
        testo, n_entita = decodifica_entita_html(testo)
        report["moduli"]["html"] = {
            "conversioni": n_entita,
            "stato": "OK" if n_entita == 0 else "MODIFICATO",
        }
        print(f"[HTML]       Conversioni: {n_entita}")

    # ── Modulo 5: artefatti PDF ───────────────────────────────────────────────
    if args.check_pdf:
        artefatti = rileva_artefatti_pdf(testo)
        report["moduli"]["pdf"] = {
            "artefatti": len(artefatti),
            "dettagli": artefatti,
        }
        print(f"[PDF]        Artefatti: {len(artefatti)}")
        for a in artefatti[:5]:
            print(
                f"             riga {a['riga']}: {a['tipo']} — "
                f"{a['contenuto'][:60]} [{a['azione_consigliata']}]"
            )
        if len(artefatti) > 5:
            print(f"             … e altri {len(artefatti) - 5}")
        if artefatti and args.strict:
            ha_artefatti_critici = True

    # ── Modulo 6: caratteri tossici ───────────────────────────────────────────
    if args.fix_toxic:
        testo, rimozioni_tossici = rimuovi_caratteri_tossici(testo)
        n_critici = sum(1 for r in rimozioni_tossici if r["rischio"] == "critico")
        report["moduli"]["tossici"] = {
            "rimossi": len(rimozioni_tossici),
            "critici": n_critici,
            "stato": "OK" if len(rimozioni_tossici) == 0 else "MODIFICATO",
            "dettagli": rimozioni_tossici,
        }
        print(f"[TOSSICI]    Rimossi: {len(rimozioni_tossici)} (di cui critici: {n_critici})")
        for r in rimozioni_tossici[:8]:
            print(
                f"             pos {r['posizione_originale']}: {r['codepoint']} "
                f"{r['nome']} [{r['rischio']}] → {r['azione']}"
            )
        if len(rimozioni_tossici) > 8:
            print(f"             … e altri {len(rimozioni_tossici) - 8}")
        if n_critici > 0 and args.strict:
            ha_artefatti_critici = True

    # ── Modulo 7: normalizzazione tipografica ─────────────────────────────────
    if args.fix_typography:
        testo, sostituzioni_tipo = normalizza_tipografia(testo)
        report["moduli"]["tipografia"] = {
            "sostituzioni": len(sostituzioni_tipo),
            "stato": "OK" if len(sostituzioni_tipo) == 0 else "MODIFICATO",
            "dettagli": sostituzioni_tipo,
        }
        print(f"[TIPOGRAFIA] Sostituzioni: {len(sostituzioni_tipo)}")
        for s in sostituzioni_tipo[:8]:
            print(
                f"             pos {s['posizione_originale']}: {s['codepoint']} "
                f"{s['nome']} '{s['originale']}' → '{s['sostituto']}'"
            )
        if len(sostituzioni_tipo) > 8:
            print(f"             … e altre {len(sostituzioni_tipo) - 8}")

    # ── SHA-256 del testo finale ──────────────────────────────────────────────
    report["sha256_finale"] = calcola_sha256(testo)
    print(f"\n[SHA-256]    Originale: {report['sha256_originale']}")
    if testo != testo_originale:
        print(f"[SHA-256]    Finale:    {report['sha256_finale']}")

    # ── Salvataggio output ────────────────────────────────────────────────────
    if args.output and testo != testo_originale:
        out_path = Path(args.output)
        out_path.write_text(testo, encoding="utf-8")
        print(f"\n[OUTPUT]     Salvato: {out_path.resolve()}")

    # ── Salvataggio report JSON ───────────────────────────────────────────────
    if args.report:
        report_path = Path(args.report)
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"[REPORT]     Salvato: {report_path.resolve()}")

    # ── Strict mode ──────────────────────────────────────────────────────────
    if ha_artefatti_critici:
        print("\n[STRICT]     Artefatti critici rilevati — interruzione.", file=sys.stderr)
        sys.exit(1)

    print("\n✅ Bonifica completata.")


if __name__ == "__main__":
    main()
