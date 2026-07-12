(function () {
  "use strict";

  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var fileInput = document.getElementById("file-input");
  var input = document.getElementById("input-text");
  var output = document.getElementById("output-text");
  var results = document.getElementById("results");
  var metrics = document.getElementById("metrics");
  var details = document.getElementById("details");
  var lastClean = "";
  var lastReport = null;

  function getToggle(id) {
    var el = document.getElementById(id);
    return !el || el.checked;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function splitCodeBlocks(text) {
    var parts = [];
    var re = /(```[\s\S]*?```|`[^`\n]*`)/g;
    var last = 0;
    var match;
    while ((match = re.exec(text)) !== null) {
      if (match.index > last) parts.push({ text: text.slice(last, match.index), code: false });
      parts.push({ text: match[0], code: true });
      last = re.lastIndex;
    }
    if (last < text.length) parts.push({ text: text.slice(last), code: false });
    return parts;
  }

  function removeBackslashes(text) {
    var count = 0;
    var out = splitCodeBlocks(text).map(function (part) {
      if (part.code) return part.text;
      return part.text.replace(/\\([*_#[\](){}.!>|+-])/g, function (_, char) {
        count += 1;
        return char;
      });
    }).join("");
    return { text: out, count: count };
  }

  function decodeEntities(text) {
    var count = 0;
    var map = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": "\"",
      "&apos;": "'",
      "&nbsp;": " ",
      "&#160;": " "
    };
    var out = splitCodeBlocks(text).map(function (part) {
      if (part.code) return part.text;
      return part.text.replace(/&(amp|lt|gt|quot|apos|nbsp);|&#160;/g, function (match) {
        count += 1;
        return map[match] || match;
      });
    }).join("");
    return { text: out, count: count };
  }

  var toxicMap = {
    0x0000: "NULL",
    0x001A: "SUBSTITUTE",
    0x001B: "ESCAPE",
    0x00AD: "SOFT_HYPHEN",
    0x200B: "ZERO_WIDTH_SPACE",
    0x200C: "ZERO_WIDTH_NON_JOINER",
    0x200D: "ZERO_WIDTH_JOINER",
    0x200E: "LEFT_TO_RIGHT_MARK",
    0x200F: "RIGHT_TO_LEFT_MARK",
    0x202A: "LTR_EMBEDDING",
    0x202B: "RTL_EMBEDDING",
    0x202C: "POP_DIRECTIONAL_FORMATTING",
    0x202D: "LTR_OVERRIDE",
    0x202E: "RTL_OVERRIDE",
    0x2060: "WORD_JOINER",
    0xFEFF: "BYTE_ORDER_MARK"
  };

  function removeToxic(text) {
    var removed = [];
    var out = [];
    for (var i = 0; i < text.length; i += 1) {
      var cp = text.codePointAt(i);
      if (cp > 0xffff) i += 1;
      if (cp === 0x00A0) {
        removed.push({ pos: i, name: "NO_BREAK_SPACE", action: "convertito in spazio" });
        out.push(" ");
      } else if (toxicMap[cp] || (cp >= 0xFDD0 && cp <= 0xFDEF) || cp === 0xFFFE || cp === 0xFFFF) {
        removed.push({ pos: i, name: toxicMap[cp] || "NON_CHARACTER", action: "rimosso" });
      } else {
        out.push(String.fromCodePoint(cp));
      }
    }
    return { text: out.join(""), removed: removed };
  }

  function normalizeTypography(text) {
    var count = 0;
    var map = {
      "\u201C": "\"",
      "\u201D": "\"",
      "\u2018": "'",
      "\u2019": "'",
      "\u2014": "--",
      "\u2013": "-",
      "\u2026": "...",
      "\uFB01": "fi",
      "\uFB02": "fl",
      "\uFB03": "ffi",
      "\uFB04": "ffl"
    };
    var out = text.replace(/[\u201C\u201D\u2018\u2019\u2014\u2013\u2026\uFB01\uFB02\uFB03\uFB04]/g, function (match) {
      count += 1;
      return map[match];
    });
    return { text: out, count: count };
  }

  var homoglyphs = {
    "\u0430": "a",
    "\u0435": "e",
    "\u043E": "o",
    "\u0440": "p",
    "\u0441": "c",
    "\u0445": "x",
    "\u0456": "i",
    "\u0391": "A",
    "\u0392": "B",
    "\u0395": "E",
    "\u039F": "O",
    "\u03A1": "P"
  };

  function detectHomoglyphs(text) {
    var found = [];
    for (var i = 0; i < text.length; i += 1) {
      var ch = text[i];
      if (homoglyphs[ch]) found.push({ pos: i, char: ch, replacement: homoglyphs[ch] });
    }
    return found;
  }

  function detectPdfArtifacts(text) {
    var artifacts = [];
    var lines = text.split("\n");
    var frequency = {};
    lines.forEach(function (line) {
      var s = line.trim();
      if (s) frequency[s] = (frequency[s] || 0) + 1;
    });
    lines.forEach(function (line, index) {
      var s = line.trim();
      if (!s) return;
      if (/^\d{1,3}$/.test(s)) artifacts.push({ line: index + 1, type: "numero pagina", value: s });
      else if (/^(pagina\s+\d+\s+di\s+\d+|page\s+\d+\s+of\s+\d+)$/i.test(s)) artifacts.push({ line: index + 1, type: "indicatore pagina", value: s });
      else if (/^[-=]{5,}$/.test(s)) artifacts.push({ line: index + 1, type: "separatore", value: s });
      else if (frequency[s] >= 3 && s.length > 8) artifacts.push({ line: index + 1, type: "riga ripetuta", value: s });
    });
    return artifacts;
  }

  function detectTables(text) {
    return text.split("\n").reduce(function (acc, line, index) {
      if (!line.includes("|") && /\S\s{3,}\S/.test(line)) {
        acc.push({ line: index + 1, value: line.trim().slice(0, 100) });
      }
      return acc;
    }, []);
  }

  async function sha256(text) {
    if (!window.crypto || !window.crypto.subtle) return "non disponibile";
    var bytes = new TextEncoder().encode(text);
    var hash = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.prototype.map.call(new Uint8Array(hash), function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }

  function renderDetails(report) {
    var warnings = [];
    report.tables.forEach(function (item) {
      warnings.push("Possibile pseudo-tabella alla riga " + item.line + ": " + item.value);
    });
    report.homoglyphs.forEach(function (item) {
      warnings.push("Omoglifo alla posizione " + item.pos + ": " + item.char + " -> " + item.replacement);
    });
    report.pdf.forEach(function (item) {
      warnings.push("Artefatto PDF, riga " + item.line + " (" + item.type + "): " + item.value);
    });
    report.toxic.forEach(function (item) {
      warnings.push("Carattere speciale " + item.name + " alla posizione " + item.pos + ": " + item.action);
    });
    if (!warnings.length) return "<p>Nessun avviso rilevato dai controlli attivi.</p>";
    return "<ul class=\"checklist warning-list\">" + warnings.slice(0, 24).map(function (item) {
      return "<li>" + escapeHtml(item) + "</li>";
    }).join("") + "</ul>";
  }

  async function runTool() {
    if (!input || !output) return;
    var text = input.value || "";
    if (!text.trim()) {
      input.focus();
      return;
    }

    var report = {
      backslashes: 0,
      entities: 0,
      toxic: [],
      typography: 0,
      homoglyphs: [],
      pdf: [],
      tables: []
    };

    report.tables = detectTables(text);

    if (getToggle("mod-backslash")) {
      var b = removeBackslashes(text);
      text = b.text;
      report.backslashes = b.count;
    }
    if (getToggle("mod-html")) {
      var h = decodeEntities(text);
      text = h.text;
      report.entities = h.count;
    }
    if (getToggle("mod-toxic")) {
      var t = removeToxic(text);
      text = t.text;
      report.toxic = t.removed;
    }
    if (getToggle("mod-typography")) {
      var n = normalizeTypography(text);
      text = n.text;
      report.typography = n.count;
    }
    if (getToggle("mod-homoglyphs")) report.homoglyphs = detectHomoglyphs(text);
    if (getToggle("mod-pdf")) report.pdf = detectPdfArtifacts(text);

    report.sha256 = await sha256(text);
    lastClean = text;
    lastReport = report;
    output.value = text;

    if (metrics) {
      metrics.innerHTML = [
        ["Backslash", report.backslashes],
        ["Entita HTML", report.entities],
        ["Caratteri speciali", report.toxic.length],
        ["Avvisi", report.homoglyphs.length + report.pdf.length + report.tables.length]
      ].map(function (pair) {
        return "<div class=\"metric\"><strong>" + pair[1] + "</strong><span>" + pair[0] + "</span></div>";
      }).join("");
    }
    if (details) details.innerHTML = renderDetails(report) + "<p class=\"fineprint\">SHA-256 output: " + escapeHtml(report.sha256) + "</p>";
    if (results) results.classList.remove("hidden");
  }

  function download(name, type, content) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  document.querySelectorAll("[data-run-tool]").forEach(function (button) {
    button.addEventListener("click", runTool);
  });

  document.querySelectorAll("[data-clear-tool]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (input) input.value = "";
      if (output) output.value = "";
      if (results) results.classList.add("hidden");
      lastClean = "";
      lastReport = null;
    });
  });

  document.querySelectorAll("[data-example-tool]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!input) return;
      input.value = "# Esempio\\n\\nTesto con \\*escape\\*, &amp; entita HTML, una riga     pseudo tabellare,\\n\\n1\\n\\nPagina 2 di 5\\n\\nparola con carattere sospetto: c\u0430sa.";
      input.focus();
    });
  });

  document.querySelectorAll("[data-copy-output]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!output || !output.value || !navigator.clipboard) return;
      navigator.clipboard.writeText(output.value);
    });
  });

  document.querySelectorAll("[data-download-clean]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (lastClean) download("bonificato.md", "text/markdown;charset=utf-8", lastClean);
    });
  });

  document.querySelectorAll("[data-download-report]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (lastReport) download("bonifica-report.json", "application/json;charset=utf-8", JSON.stringify(lastReport, null, 2));
    });
  });

  if (fileInput && input) {
    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        input.value = String(reader.result || "");
      };
      reader.readAsText(file);
    });
  }
}());
