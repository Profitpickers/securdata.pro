#!/usr/bin/env python3
"""
bonifica.py — Pipeline di bonifica Markdown pre-AGI
SecurData Pro — https://securdata.pro

Utilizzo:
    python bonifica.py input.md [opzioni]

Flag disponibili:
    --output FILE        Salva il testo bonificato su file
    --strict             Interrompe se vengono rilevati artefatti critici
    --report FILE        Salva il report in formato JSON
    --fix-backslash      Rimuovi backslash-escape inutili
    --fix-html           Decodifica entità HTML
    --check-homoglyphs   Segnala caratteri omoglifi (solo report)
    --check-pdf          Rileva artefatti da estrazione PDF
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
            "  python bonifica.py articolo.md --fix-backslash --fix-html --output clean.md\n"
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
