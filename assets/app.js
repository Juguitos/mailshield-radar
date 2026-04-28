(function () {
  "use strict";

  var QUICK_SELECTORS = [
    "default",
    "selector1",
    "selector2",
    "google",
    "k1",
    "k2",
    "dkim",
    "mail",
    "email",
    "smtp",
    "s1",
    "s2",
    "sig1",
    "key1",
    "mx"
  ];

  var BROAD_SELECTORS = QUICK_SELECTORS.concat([
    "selector",
    "dkim1",
    "dkim2",
    "domainkey",
    "m1",
    "m2",
    "mandrill",
    "sendgrid",
    "mailgun",
    "amazonses",
    "ses",
    "postmark",
    "sparkpost",
    "smtpapi",
    "pm",
    "protonmail",
    "zoho",
    "zmail",
    "hubspot",
    "hs1",
    "hs2",
    "klaviyo",
    "mailchimp",
    "mte1",
    "mte2",
    "scph",
    "intercom",
    "zendesk",
    "freshdesk",
    "helpscout",
    "cm",
    "em",
    "emma",
    "constantcontact",
    "newsletter",
    "marketing",
    "transactional",
    "outbound",
    "bounce",
    "rsa",
    "ed25519",
    "20210112",
    "20230601",
    "202401",
    "202501"
  ]);

  var TYPE_NAMES = {
    5: "CNAME",
    15: "MX",
    16: "TXT"
  };

  var UI_TEXT = {
    es: {
      analyze: "Analizar",
      additionalEvidence: "Adicional",
      additionalEvidenceSubtitle: "Complementos, recomendaciones y riesgos para contexto posterior.",
      automatic: "Automatico",
      broad: "Amplia",
      copied: "Copiado",
      linkCopied: "Enlace copiado",
      linkCopyFailed: "No se pudo copiar enlace",
      copyFailed: "No se pudo copiar",
      copyLink: "Copiar enlace",
      copySummary: "Copiar resumen",
      copyEvidence: "Copiar evidencia",
      cveFollowUp: "Seguimiento CVE",
      coverage: "Cobertura",
      darkModeLabel: "Cambiar modo oscuro",
      dkim: "DKIM",
      dkimMode: "Modo DKIM",
      domain: "Dominio",
      domainInvalid: "Dominio invalido",
      domainPlaceholder: "dominio.com",
      dnsError: "Error DNS",
      dnsRunning: "Consultando DNS",
      eyebrow: "Radar DNS de correo",
      exportJson: "Exportar JSON",
      exportMd: "Exportar MD",
      extraSelectors: "Selectores extra",
      extraSelectorsAria: "Selectores DKIM extra",
      extraSelectorsPlaceholder: "selector1, selector2, google, k1",
      footerMade: "Hecho por Luis Daniel (Juguitos)",
      failure: "Falla",
      languageLabel: "Cambiar idioma",
      languageToggle: "English",
      lightMode: "Modo claro",
      noAnalysis: "No se pudo completar el analisis.",
      ready: "Listo",
      reportMode: "Modo reporte",
      reportModeExit: "Vista normal",
      reportSnapshot: "Datos del reporte",
      recommendations: "Recomendaciones",
      recommendationsSubtitle: "Acciones sugeridas al final del analisis.",
      resolver: "Resolver",
      sample: "Ejemplo",
      score: "Score",
      scoreSubtitle: "Desglose de puntos por control.",
      severity: "Severidad",
      risks: "Riesgos y CVEs",
      risksSubtitle: "Exposiciones inferidas por DNS y busquedas CVE que requieren validacion de version.",
      statusLegend: "Estados",
      warning: "Aviso",
      selectorAria: "Selectores DKIM especificos",
      selectorLabel: "Selector(es) DKIM",
      selectorPlaceholder: "selector1, google, k1",
      selectorRequired: "Selector requerido",
      selectorRequiredMessage: "Escribe al menos un selector DKIM especifico, por ejemplo selector1 o google.",
      specific: "Especifico",
      themeDark: "Modo oscuro",
      quick: "Rapida"
    },
    en: {
      analyze: "Analyze",
      additionalEvidence: "Additional",
      additionalEvidenceSubtitle: "Extras, recommendations, and risks for follow-up context.",
      automatic: "Automatic",
      broad: "Broad",
      copied: "Copied",
      linkCopied: "Link copied",
      linkCopyFailed: "Could not copy link",
      copyFailed: "Could not copy",
      copyLink: "Copy link",
      copySummary: "Copy summary",
      copyEvidence: "Copy evidence",
      cveFollowUp: "CVE follow-up",
      coverage: "Coverage",
      darkModeLabel: "Toggle dark mode",
      dkim: "DKIM",
      dkimMode: "DKIM mode",
      domain: "Domain",
      domainInvalid: "Invalid domain",
      domainPlaceholder: "domain.com",
      dnsError: "DNS error",
      dnsRunning: "Querying DNS",
      eyebrow: "Mail DNS radar",
      exportJson: "Export JSON",
      exportMd: "Export MD",
      extraSelectors: "Extra selectors",
      extraSelectorsAria: "Extra DKIM selectors",
      extraSelectorsPlaceholder: "selector1, selector2, google, k1",
      footerMade: "Made by Luis Daniel (Juguitos)",
      failure: "Fail",
      languageLabel: "Change language",
      languageToggle: "Español",
      lightMode: "Light mode",
      noAnalysis: "The analysis could not be completed.",
      ready: "Ready",
      reportMode: "Report mode",
      reportModeExit: "Normal view",
      reportSnapshot: "Report data",
      recommendations: "Recommendations",
      recommendationsSubtitle: "Suggested actions at the end of the analysis.",
      resolver: "Resolver",
      sample: "Sample",
      score: "Score",
      scoreSubtitle: "Point breakdown by control.",
      severity: "Severity",
      risks: "Risks and CVEs",
      risksSubtitle: "DNS-inferred exposure and CVE searches that require version validation.",
      statusLegend: "Status",
      warning: "Warning",
      selectorAria: "Specific DKIM selectors",
      selectorLabel: "DKIM selector(s)",
      selectorPlaceholder: "selector1, google, k1",
      selectorRequired: "Selector required",
      selectorRequiredMessage: "Enter at least one specific DKIM selector, for example selector1 or google.",
      specific: "Specific",
      themeDark: "Dark mode",
      quick: "Quick"
    }
  };

  var els = {
    form: document.getElementById("auditForm"),
    domainInput: document.getElementById("domainInput"),
    resolverSelect: document.getElementById("resolverSelect"),
    customSelectors: document.getElementById("customSelectors"),
    selectorDepth: document.getElementById("selectorDepth"),
    selectorLabel: document.getElementById("selectorLabel"),
    runStatus: document.getElementById("runStatus"),
    auditButton: document.getElementById("auditButton"),
    sampleButton: document.getElementById("sampleButton"),
    themeToggle: document.getElementById("themeToggle"),
    themeToggleText: document.getElementById("themeToggleText"),
    languageToggle: document.getElementById("languageToggle"),
    languageToggleText: document.getElementById("languageToggleText"),
    reportModeToggle: document.getElementById("reportModeToggle"),
    summary: document.getElementById("summary"),
    reportSnapshot: document.getElementById("reportSnapshot"),
    reportActions: document.getElementById("reportActions"),
    copyReportButton: document.getElementById("copyReportButton"),
    copyLinkButton: document.getElementById("copyLinkButton"),
    downloadJsonButton: document.getElementById("downloadJsonButton"),
    downloadMdButton: document.getElementById("downloadMdButton"),
    panels: {
      score: document.getElementById("scorePanel"),
      spf: document.getElementById("spfPanel"),
      dmarc: document.getElementById("dmarcPanel"),
      dkim: document.getElementById("dkimPanel"),
      mx: document.getElementById("mxPanel"),
      extras: document.getElementById("extrasPanel"),
      recommendations: document.getElementById("recommendationsPanel"),
      risks: document.getElementById("risksPanel")
    }
  };

  var lastReport = null;
  var currentLang = "es";

  initLanguage();
  initTheme();
  initReportMode();
  applyUrlState();
  updateSelectorUi();

  els.form.addEventListener("submit", function (event) {
    event.preventDefault();
    runAudit();
  });

  els.sampleButton.addEventListener("click", function () {
    els.domainInput.value = "google.com";
    document.querySelector('input[name="selectorStrategy"][value="auto"]').checked = true;
    els.selectorDepth.value = "broad";
    updateSelectorUi();
    runAudit();
  });

  els.themeToggle.addEventListener("click", function () {
    var nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
    syncShareUrl();
  });

  els.languageToggle.addEventListener("click", function () {
    var nextLang = currentLang === "es" ? "en" : "es";
    applyLanguage(nextLang, true);
    syncShareUrl();
  });

  els.reportModeToggle.addEventListener("click", function () {
    applyReportMode(!document.body.classList.contains("report-mode"), true);
    syncShareUrl();
  });

  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-copy-section]");

    if (!button || !lastReport) return;
    copyText(buildSectionEvidence(lastReport, button.getAttribute("data-copy-section")));
  });

  Array.from(document.querySelectorAll('input[name="selectorStrategy"]')).forEach(function (input) {
    input.addEventListener("change", updateSelectorUi);
  });

  els.copyReportButton.addEventListener("click", function () {
    if (!lastReport) return;
    copyText(buildTextReport(lastReport));
  });

  els.copyLinkButton.addEventListener("click", function () {
    copyShareLink();
  });

  els.downloadJsonButton.addEventListener("click", function () {
    if (!lastReport) return;
    downloadJson(lastReport);
  });

  els.downloadMdButton.addEventListener("click", function () {
    if (!lastReport) return;
    downloadMarkdown(lastReport);
  });

  function initTheme() {
    var savedTheme = "";

    try {
      savedTheme = window.localStorage.getItem("mailshield-theme") || "";
    } catch (error) {
      savedTheme = "";
    }

    applyTheme(savedTheme || "light", false);
  }

  function applyTheme(theme, persist) {
    var normalized = theme === "dark" ? "dark" : "light";

    document.documentElement.dataset.theme = normalized;
    els.themeToggle.setAttribute("aria-pressed", normalized === "dark" ? "true" : "false");
    els.themeToggle.setAttribute("aria-label", t("darkModeLabel"));
    els.themeToggleText.textContent = normalized === "dark" ? t("lightMode") : t("themeDark");

    if (persist) {
      try {
        window.localStorage.setItem("mailshield-theme", normalized);
      } catch (error) {
        return;
      }
    }
  }

  function initReportMode() {
    var savedMode = "";

    try {
      savedMode = window.localStorage.getItem("mailshield-report-mode") || "";
    } catch (error) {
      savedMode = "";
    }

    applyReportMode(savedMode === "1", false);
  }

  function applyReportMode(enabled, persist) {
    document.body.classList.toggle("report-mode", enabled);
    els.reportModeToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
    els.reportModeToggle.textContent = enabled ? t("reportModeExit") : t("reportMode");

    if (lastReport) {
      renderReportSnapshot(lastReport);
    }

    if (persist) {
      try {
        window.localStorage.setItem("mailshield-report-mode", enabled ? "1" : "0");
      } catch (error) {
        return;
      }
    }
  }

  function initLanguage() {
    var savedLang = "";

    try {
      savedLang = window.localStorage.getItem("mailshield-lang") || "";
    } catch (error) {
      savedLang = "";
    }

    applyLanguage(savedLang || "es", false);
  }

  function applyLanguage(lang, persist) {
    currentLang = lang === "en" ? "en" : "es";
    document.documentElement.lang = currentLang;
    document.documentElement.dataset.lang = currentLang;
    els.languageToggle.setAttribute("aria-pressed", currentLang === "en" ? "true" : "false");
    els.languageToggle.setAttribute("aria-label", t("languageLabel"));
    els.languageToggleText.textContent = t("languageToggle");
    updateStaticText();
    updateThemeText();
    applyReportMode(document.body.classList.contains("report-mode"), false);
    updateSelectorUi();

    if (!lastReport) {
      setStatus("ready", "");
      clearResults();
    } else {
      renderReport(lastReport);
    }

    if (persist) {
      try {
        window.localStorage.setItem("mailshield-lang", currentLang);
      } catch (error) {
        return;
      }
    }
  }

  function updateStaticText() {
    Array.from(document.querySelectorAll("[data-i18n]")).forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });

    Array.from(document.querySelectorAll("[data-i18n-placeholder]")).forEach(function (node) {
      node.placeholder = t(node.getAttribute("data-i18n-placeholder"));
    });
  }

  function updateThemeText() {
    var isDark = document.documentElement.dataset.theme === "dark";

    els.themeToggle.setAttribute("aria-label", t("darkModeLabel"));
    els.themeToggleText.textContent = isDark ? t("lightMode") : t("themeDark");
  }

  function updateSelectorUi() {
    var strategy = document.querySelector('input[name="selectorStrategy"]:checked').value;

    if (strategy === "specific") {
      els.selectorDepth.disabled = true;
      els.selectorLabel.textContent = t("selectorLabel");
      els.customSelectors.placeholder = t("selectorPlaceholder");
      els.customSelectors.setAttribute("aria-label", t("selectorAria"));
    } else {
      els.selectorDepth.disabled = false;
      els.selectorLabel.textContent = t("extraSelectors");
      els.customSelectors.placeholder = t("extraSelectorsPlaceholder");
      els.customSelectors.setAttribute("aria-label", t("extraSelectorsAria"));
    }
  }

  function t(key) {
    return (UI_TEXT[currentLang] && UI_TEXT[currentLang][key]) || UI_TEXT.es[key] || key;
  }

  function applyUrlState() {
    var params = new URLSearchParams(window.location.search);
    var lang = params.get("lang");
    var theme = params.get("theme");
    var domain = params.get("domain");
    var resolver = params.get("resolver");
    var dkim = params.get("dkim");
    var depth = params.get("depth");
    var selectors = params.get("selectors");
    var reportMode = params.get("report");

    if (lang) applyLanguage(lang, false);
    if (theme) applyTheme(theme, false);
    if (domain) els.domainInput.value = domain;
    if (resolver && ["auto", "google", "cloudflare"].indexOf(resolver) !== -1) {
      els.resolverSelect.value = resolver;
    }
    if (dkim && ["auto", "specific"].indexOf(dkim) !== -1) {
      document.querySelector('input[name="selectorStrategy"][value="' + dkim + '"]').checked = true;
    }
    if (depth && ["quick", "broad"].indexOf(depth) !== -1) {
      els.selectorDepth.value = depth;
    }
    if (selectors) {
      els.customSelectors.value = selectors;
    }
    if (reportMode === "1") {
      applyReportMode(true, false);
    }

    updateSelectorUi();

    if (domain) {
      window.setTimeout(runAudit, 0);
    }
  }

  function buildShareUrl(domainOverride) {
    var url = new URL(window.location.href);
    var params = new URLSearchParams();
    var domain = domainOverride || els.domainInput.value.trim();
    var strategy = document.querySelector('input[name="selectorStrategy"]:checked').value;
    var selectors = els.customSelectors.value.trim();
    var theme = document.documentElement.dataset.theme;

    if (domain) params.set("domain", domain);
    params.set("lang", currentLang);
    params.set("theme", theme === "dark" ? "dark" : "light");
    if (els.resolverSelect.value !== "auto") params.set("resolver", els.resolverSelect.value);
    params.set("dkim", strategy);
    if (strategy === "auto") params.set("depth", els.selectorDepth.value);
    if (selectors) params.set("selectors", selectors);
    if (document.body.classList.contains("report-mode")) params.set("report", "1");

    url.search = params.toString();
    url.hash = "";
    return url.toString();
  }

  function syncShareUrl(domainOverride) {
    var domain = domainOverride || els.domainInput.value.trim();

    if (!domain || !window.history || !window.history.replaceState) return;
    window.history.replaceState(null, "", buildShareUrl(domain));
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(buildShareUrl(lastReport ? lastReport.domain : ""));
      setStatus("linkCopied", "");
    } catch (error) {
      setStatus("linkCopyFailed", "fail");
    }
  }

  function runAudit() {
    var domain;

    try {
      domain = normalizeDomain(els.domainInput.value);
    } catch (error) {
      setStatus("domainInvalid", "fail");
      showError(error.message);
      return;
    }

    var selectorStrategy = document.querySelector('input[name="selectorStrategy"]:checked').value;
    var selectorDepth = els.selectorDepth.value;
    var selectors = buildSelectorList(selectorStrategy, selectorDepth, els.customSelectors.value);
    var resolver = els.resolverSelect.value;

    if (selectorStrategy === "specific" && selectors.length === 0) {
      setStatus("selectorRequired", "fail");
      showError(t("selectorRequiredMessage"));
      return;
    }

    setLoading(true);
    setStatus("dnsRunning", "running");
    clearResults();
    renderDkimProgress(0, selectors.length, []);
    syncShareUrl(domain);

    auditDomain(domain, resolver, selectors, {
      strategy: selectorStrategy,
      depth: selectorDepth
    })
      .then(function (report) {
        lastReport = report;
        renderReport(report);
        setStatus("ready", "");
      })
      .catch(function (error) {
        setStatus("dnsError", "fail");
        showError(error.message || t("noAnalysis"));
      })
      .finally(function () {
        setLoading(false);
      });
  }

  async function auditDomain(domain, resolver, selectors, selectorConfig) {
    var startedAt = new Date().toISOString();
    var report;
    var scoreBreakdown;

    var foundation = await Promise.all([
      auditSpf(domain, resolver),
      auditDmarc(domain, resolver),
      auditMx(domain, resolver),
      auditExtras(domain, resolver)
    ]);

    var dkim = await auditDkim(domain, resolver, selectors, selectorConfig);
    scoreBreakdown = calculateScoreBreakdown(foundation[0], foundation[1], dkim, foundation[2]);

    report = {
      domain: domain,
      resolver: resolver,
      checkedAt: startedAt,
      spf: foundation[0],
      dmarc: foundation[1],
      mx: foundation[2],
      extras: foundation[3],
      dkim: dkim,
      score: scoreBreakdown.total,
      scoreBreakdown: scoreBreakdown.items
    };

    report.recommendations = buildRecommendations(report);
    report.risks = buildRiskAssessment(report);

    return report;
  }

  async function auditSpf(domain, resolver) {
    var txt = await queryTxt(domain, resolver);
    var spfRecords = txt.records.filter(function (record) {
      return /^v=spf1(\s|$)/i.test(record.text);
    });
    var findings = [];
    var meta = [];
    var status = "pass";
    var message = "Un registro SPF publicado.";

    if (spfRecords.length === 0) {
      return {
        title: "SPF",
        status: "fail",
        message: "No se encontro SPF en el dominio raiz.",
        findings: [{ status: "fail", text: "Los servidores receptores no tienen una politica SPF que evaluar." }],
        records: [],
        meta: [{ label: "TXT revisados", value: String(txt.records.length) }]
      };
    }

    if (spfRecords.length > 1) {
      status = "fail";
      message = "Hay multiples registros SPF.";
      findings.push({ status: "fail", text: "SPF requiere un solo registro v=spf1 por dominio." });
    }

    var primary = spfRecords[0].text;
    var allMatch = primary.match(/(^|\s)([+?~-])all(\s|$)/i);
    var spfTrace = await analyzeSpfTree(domain, primary, resolver, [], 0);
    var lookupCount = spfTrace.totalLookups;
    var includes = collectSpfIncludes(primary);

    if (!allMatch) {
      status = worstStatus(status, "warn");
      findings.push({ status: "warn", text: "No se detecto mecanismo all al final de la politica." });
    } else if (allMatch[2] === "+") {
      status = "fail";
      findings.push({ status: "fail", text: "+all permite cualquier origen y anula el valor de SPF." });
    } else if (allMatch[2] === "?") {
      status = worstStatus(status, "warn");
      findings.push({ status: "warn", text: "?all deja la politica en neutral." });
    } else if (allMatch[2] === "~") {
      status = worstStatus(status, "warn");
      findings.push({ status: "warn", text: "~all es tolerante; -all es mas estricto cuando el inventario esta cerrado." });
    } else {
      findings.push({ status: "pass", text: "El mecanismo -all cierra la politica con rechazo SPF." });
    }

    if (/\bptr\b/i.test(primary)) {
      status = worstStatus(status, "warn");
      findings.push({ status: "warn", text: "El mecanismo ptr es costoso y suele evitarse en SPF moderno." });
    }

    if (lookupCount > 10) {
      status = "fail";
      findings.push({ status: "fail", text: "La politica supera el limite real estimado de 10 consultas DNS de SPF." });
    } else if (lookupCount >= 8) {
      status = worstStatus(status, "warn");
      findings.push({ status: "warn", text: "La politica esta cerca del limite de 10 consultas DNS de SPF." });
    }

    collectSpfTraceFindings(spfTrace).forEach(function (finding) {
      status = worstStatus(status, finding.status);
      findings.push(finding);
    });

    if (findings.length === 0) {
      findings.push({ status: "pass", text: "No se detectaron riesgos basicos en la politica SPF." });
    }

    meta.push({ label: "Registros SPF", value: String(spfRecords.length) });
    meta.push({ label: "Consultas SPF", value: String(lookupCount) + " / 10" });
    meta.push({ label: "Includes", value: includes.length ? includes.join(", ") : "Ninguno" });
    meta.push({ label: "SPF recursivo", value: spfTrace.expanded + " dominio(s)" });

    return {
      title: "SPF",
      status: status,
      message: message,
      findings: findings,
      records: spfRecords,
      meta: meta,
      spfTrace: spfTrace
    };
  }

  async function auditDmarc(domain, resolver) {
    var name = "_dmarc." + domain;
    var txt = await queryTxt(name, resolver);
    var records = txt.records.filter(function (record) {
      return /^v=DMARC1(\s*;|$)/i.test(record.text);
    });
    var findings = [];
    var meta = [];
    var status = "pass";
    var message = "Politica DMARC publicada.";

    if (records.length === 0) {
      return {
        title: "DMARC",
        status: "fail",
        message: "No se encontro DMARC.",
        findings: [{ status: "fail", text: "Falta _dmarc." + domain + " con v=DMARC1." }],
        records: [],
        meta: [{ label: "Nombre", value: name }]
      };
    }

    if (records.length > 1) {
      status = "fail";
      findings.push({ status: "fail", text: "DMARC requiere un solo registro en _dmarc." + domain + "." });
    }

    var tags = parseTagRecord(records[0].text);
    var policy = (tags.p || "").toLowerCase();
    var subPolicy = (tags.sp || "").toLowerCase();
    var pct = tags.pct || "100";
    var rua = tags.rua || "";
    var ruf = tags.ruf || "";
    var adkim = tags.adkim || "r";
    var aspf = tags.aspf || "r";

    if (!policy) {
      status = "fail";
      findings.push({ status: "fail", text: "El tag p es obligatorio en DMARC." });
    } else if (policy === "none") {
      status = worstStatus(status, "warn");
      findings.push({ status: "warn", text: "p=none monitorea, pero no aplica cuarentena ni rechazo." });
    } else if (policy === "quarantine") {
      status = worstStatus(status, "warn");
      findings.push({ status: "warn", text: "p=quarantine reduce abuso, aunque p=reject ofrece mayor bloqueo." });
    } else if (policy === "reject") {
      findings.push({ status: "pass", text: "p=reject aplica la politica DMARC mas estricta." });
    } else {
      status = "fail";
      findings.push({ status: "fail", text: "La politica DMARC p=" + policy + " no es valida." });
    }

    if (pct !== "100") {
      status = worstStatus(status, "warn");
      findings.push({ status: "warn", text: "pct=" + pct + " aplica DMARC solo a una parte del trafico." });
    }

    if (!rua) {
      status = worstStatus(status, "warn");
      findings.push({ status: "warn", text: "No hay rua para recibir reportes agregados." });
    }

    if (adkim !== "s" || aspf !== "s") {
      findings.push({ status: "info", text: "Alineacion relajada: adkim=" + adkim + ", aspf=" + aspf + "." });
    } else {
      findings.push({ status: "pass", text: "Alineacion estricta para DKIM y SPF." });
    }

    meta.push({ label: "p", value: policy || "Falta" });
    meta.push({ label: "sp", value: subPolicy || "Hereda p" });
    meta.push({ label: "pct", value: pct });
    meta.push({ label: "rua", value: rua || "Falta" });
    meta.push({ label: "ruf", value: ruf || "No publicado" });
    meta.push({ label: "Alineacion", value: "DKIM " + adkim + " / SPF " + aspf });

    return {
      title: "DMARC",
      status: status,
      message: message,
      findings: findings,
      records: records,
      meta: meta
    };
  }

  async function auditDkim(domain, resolver, selectors, selectorConfig) {
    var total = selectors.length;
    var complete = 0;
    var results = await mapLimit(selectors, 8, async function (selector) {
      var result = await checkDkimSelector(domain, resolver, selector);
      complete += 1;
      renderDkimProgress(complete, total, []);
      return result;
    });

    var found = results.filter(function (item) {
      return item.status !== "missing";
    });
    var active = found.filter(function (item) {
      return item.status === "pass";
    });
    var warnings = found.filter(function (item) {
      return item.status === "warn";
    });
    var status = "fail";
    var mode = selectorConfig && selectorConfig.strategy === "specific" ? "specific" : "auto";
    var depth = selectorConfig && selectorConfig.depth ? selectorConfig.depth : "quick";
    var message =
      mode === "specific"
        ? "No se encontro DKIM en los selectores indicados."
        : "No se encontro DKIM con los selectores probados.";

    if (active.length > 0 && warnings.length === 0) {
      status = "pass";
      message = "DKIM activo en " + active.length + " selector(es).";
    } else if (active.length > 0 || warnings.length > 0) {
      status = "warn";
      message = "DKIM detectado con observaciones.";
    }

    results.sort(function (a, b) {
      var weight = { pass: 0, warn: 1, info: 2, missing: 3 };
      return weight[a.status] - weight[b.status] || a.selector.localeCompare(b.selector);
    });

    return {
      title: "DKIM",
      status: status,
      message: message,
      mode: mode,
      depth: depth,
      checked: total,
      found: found.length,
      active: active.length,
      results: results
    };
  }

  async function checkDkimSelector(domain, resolver, selector) {
    var name = selector + "._domainkey." + domain;

    try {
      var txt = await queryTxt(name, resolver);
      var cnames = txt.answers.filter(function (answer) {
        return answer.type === 5;
      });
      var records = txt.records.filter(function (record) {
        return isDkimText(record.text);
      });

      if (records.length === 0 && cnames.length === 0) {
        return {
          selector: selector,
          name: name,
          status: "missing",
          summary: "Sin TXT DKIM",
          records: [],
          cnames: []
        };
      }

      if (records.length === 0 && cnames.length > 0) {
        return {
          selector: selector,
          name: name,
          status: "info",
          summary: "CNAME delegado",
          records: [],
          cnames: cnames.map(function (answer) {
            return trimDot(answer.data);
          })
        };
      }

      var tags = parseTagRecord(records[0].text);
      var notes = [];
      var status = "pass";
      var publicKey = tags.p || "";
      var keyType = (tags.k || "rsa").toLowerCase();

      if (records.length > 1) {
        status = "warn";
        notes.push("Multiples TXT DKIM para el mismo selector.");
      }

      if (!publicKey) {
        status = "warn";
        notes.push("La llave publica falta o esta vacia; puede ser un selector revocado.");
      } else {
        notes.push("Llave publicada (" + publicKey.length + " caracteres).");
      }

      if (keyType !== "rsa" && keyType !== "ed25519") {
        status = "warn";
        notes.push("Tipo de llave no habitual: " + keyType + ".");
      }

      if ((tags.t || "").toLowerCase().split(":").indexOf("y") !== -1) {
        status = "warn";
        notes.push("t=y marca el selector en modo prueba.");
      }

      cnames.forEach(function (answer) {
        notes.push("CNAME a " + trimDot(answer.data) + ".");
      });

      return {
        selector: selector,
        name: name,
        status: status,
        summary: status === "pass" ? "DKIM activo" : "DKIM con observaciones",
        records: records,
        cnames: cnames.map(function (answer) {
          return trimDot(answer.data);
        }),
        notes: notes,
        tags: {
          k: keyType,
          pLength: publicKey.length,
          t: tags.t || ""
        }
      };
    } catch (error) {
      return {
        selector: selector,
        name: name,
        status: "warn",
        summary: "Error al consultar selector",
        error: error.message,
        records: [],
        cnames: []
      };
    }
  }

  async function auditMx(domain, resolver) {
    var response = await resolveDns(domain, "MX", resolver);
    var records = response.answers
      .filter(function (answer) {
        return answer.type === 15;
      })
      .map(function (answer) {
        var parts = answer.data.split(/\s+/);
        return {
          priority: Number(parts[0]),
          exchange: trimDot(parts.slice(1).join(" "))
        };
      })
      .sort(function (a, b) {
        return a.priority - b.priority;
      });

    if (records.length === 0) {
      return {
        title: "MX",
        status: "fail",
        message: "No se encontraron registros MX.",
        findings: [{ status: "fail", text: "Sin MX, el dominio no anuncia servidores de recepcion." }],
        records: []
      };
    }

    return {
      title: "MX",
      status: "pass",
      message: records.length + " servidor(es) MX publicado(s).",
      findings: [{ status: "pass", text: "El dominio anuncia recepcion de correo." }],
      records: records
    };
  }

  async function auditExtras(domain, resolver) {
    var checks = await Promise.all([
      auditOptionalTxt("_mta-sts." + domain, "v=STSv1", "MTA-STS", resolver),
      auditOptionalTxt("_smtp._tls." + domain, "v=TLSRPTv1", "TLS-RPT", resolver),
      auditOptionalTxt("default._bimi." + domain, "v=BIMI1", "BIMI", resolver)
    ]);

    var published = checks.filter(function (check) {
      return check.status !== "info";
    }).length;

    return {
      title: "Complementos",
      status: published > 0 ? "pass" : "info",
      message: published + " control(es) opcional(es) publicado(s).",
      checks: checks
    };
  }

  async function auditOptionalTxt(name, prefix, label, resolver) {
    var txt = await queryTxt(name, resolver);
    var records = txt.records.filter(function (record) {
      return record.text.toLowerCase().indexOf(prefix.toLowerCase()) === 0;
    });

    if (records.length === 0) {
      return {
        label: label,
        name: name,
        status: "info",
        message: "No publicado",
        records: []
      };
    }

    return {
      label: label,
      name: name,
      status: "pass",
      message: "Publicado",
      records: records
    };
  }

  async function queryTxt(name, resolver) {
    var response = await resolveDns(name, "TXT", resolver);
    return {
      answers: response.answers,
      records: response.answers
        .filter(function (answer) {
          return answer.type === 16;
        })
        .map(function (answer) {
          return {
            name: trimDot(answer.name),
            ttl: answer.ttl,
            text: parseTxtData(answer.data)
          };
        })
    };
  }

  async function resolveDns(name, type, resolver) {
    var providers = resolver === "auto" ? ["google", "cloudflare"] : [resolver];
    var lastError;

    for (var i = 0; i < providers.length; i += 1) {
      try {
        return await fetchDns(providers[i], name, type);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("No se pudo consultar DNS.");
  }

  async function fetchDns(provider, name, type) {
    var controller = new AbortController();
    var timer = window.setTimeout(function () {
      controller.abort();
    }, 9000);
    var url;
    var response;

    try {
      if (provider === "google") {
        url = "https://dns.google/resolve?name=" + encodeURIComponent(name) + "&type=" + encodeURIComponent(type);
        response = await fetch(url, {
          headers: { accept: "application/dns-json" },
          signal: controller.signal
        });
      } else if (provider === "cloudflare") {
        url = "https://cloudflare-dns.com/dns-query?name=" + encodeURIComponent(name) + "&type=" + encodeURIComponent(type);
        response = await fetch(url, {
          headers: { accept: "application/dns-json" },
          signal: controller.signal
        });
      } else {
        throw new Error("Resolver no soportado: " + provider);
      }

      if (!response.ok) {
        throw new Error(provider + " respondio HTTP " + response.status + ".");
      }

      return normalizeDns(await response.json(), provider);
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Tiempo agotado consultando " + provider + ".");
      }

      throw error;
    } finally {
      window.clearTimeout(timer);
    }
  }

  function normalizeDns(payload, provider) {
    return {
      provider: provider,
      status: payload.Status,
      answers: (payload.Answer || []).map(function (answer) {
        return {
          name: answer.name,
          type: answer.type,
          typeName: TYPE_NAMES[answer.type] || String(answer.type),
          ttl: answer.TTL,
          data: answer.data
        };
      })
    };
  }

  function parseTxtData(data) {
    var parts = [];
    var match;
    var regex = /"((?:\\.|[^"\\])*)"/g;

    while ((match = regex.exec(data)) !== null) {
      parts.push(match[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
    }

    if (parts.length > 0) {
      return parts.join("");
    }

    return data.replace(/^"|"$/g, "").trim();
  }

  function parseTagRecord(text) {
    return text.split(";").reduce(function (tags, part) {
      var index = part.indexOf("=");
      var key;
      var value;

      if (index === -1) return tags;

      key = part.slice(0, index).trim().toLowerCase();
      value = part.slice(index + 1).trim();

      if (key) tags[key] = value;
      return tags;
    }, {});
  }

  function collectSpfLookups(record) {
    var tokens = record.split(/\s+/);
    return tokens.filter(function (token) {
      return /^(include:|a(?::|\/|$)|mx(?::|\/|$)|ptr(?::|$)|exists:|redirect=)/i.test(token);
    });
  }

  function collectSpfIncludes(record) {
    var matches = record.match(/\binclude:([^\s]+)/gi) || [];
    return matches.map(function (item) {
      return item.replace(/^include:/i, "");
    });
  }

  function collectSpfRedirects(record) {
    var matches = record.match(/\bredirect=([^\s]+)/gi) || [];
    return matches.map(function (item) {
      return item.replace(/^redirect=/i, "");
    });
  }

  async function analyzeSpfTree(domain, record, resolver, seen, depth) {
    var normalized = domain.toLowerCase();
    var lookupTokens = collectSpfLookups(record);
    var refs = collectSpfIncludes(record)
      .map(function (value) {
        return { type: "include", domain: value.toLowerCase() };
      })
      .concat(
        collectSpfRedirects(record).map(function (value) {
          return { type: "redirect", domain: value.toLowerCase() };
        })
      );
    var node = {
      domain: normalized,
      record: record,
      directLookups: lookupTokens.length,
      totalLookups: lookupTokens.length,
      expanded: 1,
      refs: refs,
      children: [],
      warnings: []
    };

    if (seen.indexOf(normalized) !== -1) {
      node.directLookups = 0;
      node.totalLookups = 0;
      node.warnings.push({ status: "warn", text: "Bucle SPF detectado en " + normalized + "." });
      return node;
    }

    if (depth >= 6) {
      node.warnings.push({ status: "warn", text: "Profundidad SPF maxima alcanzada en " + normalized + "." });
      return node;
    }

    for (var i = 0; i < refs.length; i += 1) {
      var ref = refs[i];
      var child = {
        type: ref.type,
        domain: ref.domain,
        directLookups: 0,
        totalLookups: 0,
        expanded: 0,
        children: [],
        warnings: []
      };
      var childRecords;
      var childTrace;

      try {
        childRecords = await loadSpfRecords(ref.domain, resolver);
        child.records = childRecords;

        if (childRecords.length === 0) {
          child.warnings.push({ status: "warn", text: labelSpfRef(ref.type) + " SPF sin registro en " + ref.domain + "." });
        } else {
          if (childRecords.length > 1) {
            child.warnings.push({
              status: "warn",
              text: labelSpfRef(ref.type) + " SPF con multiples registros en " + ref.domain + "."
            });
          }

          childTrace = await analyzeSpfTree(ref.domain, childRecords[0].text, resolver, seen.concat([normalized]), depth + 1);
          child.record = childRecords[0].text;
          child.directLookups = childTrace.directLookups;
          child.totalLookups = childTrace.totalLookups;
          child.expanded = childTrace.expanded;
          child.refs = childTrace.refs;
          child.children = childTrace.children;
          child.warnings = child.warnings.concat(childTrace.warnings);
          node.totalLookups += childTrace.totalLookups;
          node.expanded += childTrace.expanded;
        }
      } catch (error) {
        child.warnings.push({
          status: "warn",
          text: "No se pudo expandir " + ref.type + " SPF " + ref.domain + ": " + error.message
        });
      }

      node.children.push(child);
      node.warnings = node.warnings.concat(child.warnings);
    }

    return node;
  }

  async function loadSpfRecords(domain, resolver) {
    var txt = await queryTxt(domain, resolver);

    return txt.records.filter(function (record) {
      return /^v=spf1(\s|$)/i.test(record.text);
    });
  }

  function collectSpfTraceFindings(trace) {
    var seen = {};

    return (trace.warnings || []).filter(function (warning) {
      var key = warning.status + ":" + warning.text;

      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function labelSpfRef(type) {
    return type === "redirect" ? "Redirect" : "Include";
  }

  function isDkimText(text) {
    return /^v=DKIM1(\s*;|$)/i.test(text) || /(^|;)\s*p=/i.test(text);
  }

  function buildSelectorList(strategy, depth, customText) {
    var base = strategy === "specific" ? [] : depth === "broad" ? BROAD_SELECTORS : QUICK_SELECTORS;
    var custom = customText
      .split(/[\s,;]+/)
      .map(function (item) {
        return item.trim().toLowerCase();
      })
      .filter(Boolean);
    var combined = base.concat(custom).filter(function (selector) {
      return /^[a-z0-9][a-z0-9._-]{0,62}$/i.test(selector);
    });

    return Array.from(new Set(combined));
  }

  function normalizeDomain(input) {
    var value = input.trim().toLowerCase();

    value = value.replace(/^https?:\/\//, "");
    value = value.replace(/^mailto:/, "");
    value = value.split("/")[0].split("?")[0].split("#")[0].split(":")[0];
    value = value.replace(/\.$/, "");

    if (!value) {
      throw new Error("Escribe un dominio.");
    }

    if (!/^(?=.{1,253}$)(?!-)([a-z0-9-]{1,63}\.)+[a-z0-9-]{2,63}$/.test(value)) {
      throw new Error("Usa un dominio como dominio.com o sub.dominio.com.");
    }

    return value;
  }

  async function mapLimit(items, limit, worker) {
    var results = new Array(items.length);
    var index = 0;

    async function runner() {
      var current;

      while (index < items.length) {
        current = index;
        index += 1;
        results[current] = await worker(items[current], current);
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(limit, items.length) }, function () {
        return runner();
      })
    );

    return results;
  }

  function calculateScore(spf, dmarc, dkim, mx) {
    return calculateScoreBreakdown(spf, dmarc, dkim, mx).total;
  }

  function calculateScoreBreakdown(spf, dmarc, dkim, mx) {
    var items = [
      scoreBreakdownItem("SPF", spf.status, 25, spf.message),
      scoreBreakdownItem("DMARC", dmarc.status, 35, dmarc.message),
      scoreBreakdownItem("DKIM", dkim.status, 30, dkim.message),
      scoreBreakdownItem("MX", mx.status, 10, mx.message)
    ];

    return {
      total: Math.round(
        items.reduce(function (sum, item) {
          return sum + item.points;
        }, 0)
      ),
      items: items
    };
  }

  function scoreBreakdownItem(label, status, max, message) {
    return {
      label: label,
      status: status,
      statusLabel: statusLabel(status),
      points: Math.round(scorePart(status, max)),
      max: max,
      message: message
    };
  }

  function scorePart(status, max) {
    if (status === "pass") return max;
    if (status === "warn") return max * 0.55;
    if (status === "info") return max * 0.35;
    return 0;
  }

  function worstStatus(current, candidate) {
    var rank = { pass: 0, info: 1, warn: 2, fail: 3 };
    return rank[candidate] > rank[current] ? candidate : current;
  }

  function buildRecommendations(report) {
    var items = [];

    collectFindingRecommendations(items, "SPF", report.spf.findings || []);
    collectFindingRecommendations(items, "DMARC", report.dmarc.findings || []);
    collectFindingRecommendations(items, "MX", report.mx.findings || []);

    if (report.dkim.found === 0) {
      items.push({
        area: "DKIM",
        status: "fail",
        finding: report.dkim.message,
        recommendation:
          report.dkim.mode === "specific"
            ? "Confirma que el selector escrito exista y publica un TXT en selector._domainkey." + report.domain + "."
            : "Agrega el selector real del proveedor o publica DKIM para los sistemas que envian correo por este dominio."
      });
    } else {
      report.dkim.results
        .filter(function (item) {
          return item.status === "warn";
        })
        .forEach(function (item) {
          items.push({
            area: "DKIM",
            status: "warn",
            finding: item.selector + ": " + item.summary,
            recommendation: "Revisa el TXT del selector " + item.selector + " y evita llaves vacias, modo prueba o registros duplicados."
          });
        });
    }

    (report.extras.checks || [])
      .filter(function (check) {
        return check.status === "info";
      })
      .forEach(function (check) {
        items.push({
          area: check.label,
          status: "info",
          finding: check.message + " en " + check.name,
          recommendation: recommendationForOptional(check.label)
        });
      });

    if (items.length === 0) {
      items.push({
        area: "OK",
        status: "pass",
        finding: "No hay hallazgos criticos en los controles revisados.",
        recommendation: "Mantén inventario de proveedores de correo y revisa estos registros despues de cualquier cambio de envio."
      });
    }

    return items;
  }

  function collectFindingRecommendations(target, area, findings) {
    findings
      .filter(function (finding) {
        return finding.status !== "pass";
      })
      .forEach(function (finding) {
        target.push({
          area: area,
          status: finding.status,
          finding: finding.text,
          recommendation: recommendationForFinding(area, finding.text, finding.status)
        });
      });
  }

  function recommendationForFinding(area, text, status) {
    var normalized = text.toLowerCase();

    if (area === "SPF") {
      if (normalized.indexOf("multiples") !== -1 || normalized.indexOf("un solo registro") !== -1) {
        return "Fusiona todos los mecanismos autorizados en un solo registro v=spf1.";
      }
      if (normalized.indexOf("+all") !== -1) {
        return "Sustituye +all por -all o ~all despues de validar todos los remitentes legitimos.";
      }
      if (normalized.indexOf("?all") !== -1 || normalized.indexOf("~all") !== -1) {
        return "Cuando el inventario de envio este completo, endurece la politica hacia -all.";
      }
      if (normalized.indexOf("10 consultas") !== -1 || normalized.indexOf("cerca del limite") !== -1) {
        return "Reduce includes anidados, elimina proveedores no usados o usa subdominios separados para no romper SPF.";
      }
      if (normalized.indexOf("ptr") !== -1) {
        return "Reemplaza ptr por ip4, ip6, a, mx o include de proveedor documentado.";
      }
      return "Publica un unico SPF con los proveedores autorizados y un mecanismo all explicito.";
    }

    if (area === "DMARC") {
      if (normalized.indexOf("no se encontro") !== -1 || normalized.indexOf("falta") !== -1) {
        return "Publica _dmarc con v=DMARC1, un correo rua y una politica inicial p=none para monitorear.";
      }
      if (normalized.indexOf("p=none") !== -1) {
        return "Usa los reportes rua para validar alineacion y avanza gradualmente a quarantine o reject.";
      }
      if (normalized.indexOf("p=quarantine") !== -1) {
        return "Cuando no haya falsos positivos, cambia a p=reject para bloquear suplantacion.";
      }
      if (normalized.indexOf("pct=") !== -1) {
        return "Sube pct a 100 cuando la politica ya no afecte correo legitimo.";
      }
      if (normalized.indexOf("rua") !== -1) {
        return "Agrega rua=mailto:reportes@tu-dominio para recibir reportes agregados.";
      }
      if (normalized.indexOf("alineacion relajada") !== -1) {
        return "Evalua adkim=s y aspf=s cuando todos los proveedores usen dominios alineados.";
      }
      return "Asegura una sola politica DMARC valida con reportes y una ruta clara hacia reject.";
    }

    if (area === "MX") {
      return "Publica registros MX validos o separa este dominio si solo se usa para envio sin recepcion.";
    }

    return status === "fail"
      ? "Corrige este hallazgo antes de considerar el dominio protegido."
      : "Revisa este punto y documenta la decision operativa.";
  }

  function recommendationForOptional(label) {
    if (label === "MTA-STS") {
      return "Considera publicar MTA-STS para indicar a otros servidores que usen TLS al entregar correo.";
    }
    if (label === "TLS-RPT") {
      return "Considera publicar TLS-RPT para recibir reportes de fallas de entrega con TLS.";
    }
    if (label === "BIMI") {
      return "BIMI es opcional; publicalo cuando DMARC este en enforcement y tengas logo/VMC listos.";
    }

    return "Control opcional: evalua si aporta valor para el dominio.";
  }

  function buildRiskAssessment(report) {
    var risks = [];
    var spfText = (report.spf.records || []).map(function (record) {
      return record.text;
    }).join(" ");
    var spfLower = spfText.toLowerCase();
    var dmarcText = (report.dmarc.records || []).map(function (record) {
      return record.text;
    }).join(" ");
    var dmarcTags = dmarcText ? parseTagRecord(dmarcText) : {};
    var mtaSts = findExtraCheck(report, "MTA-STS");
    var tlsRpt = findExtraCheck(report, "TLS-RPT");
    var mxProducts = inferMxProducts(report.mx.records || []);
    var mxEvidence = (report.mx.records || [])
      .map(function (record) {
        return record.exchange;
      })
      .filter(Boolean)
      .join(", ");

    if (report.spf.status === "fail") {
      risks.push({
        area: "SPF",
        status: "fail",
        severity: spfLower.indexOf("+all") !== -1 ? "critical" : "high",
        title: spfLower.indexOf("+all") !== -1 ? "SPF permite cualquier origen." : "SPF no protege de forma confiable.",
        impact: "Un atacante puede intentar enviar correo usando el dominio y aumentar la probabilidad de suplantacion o phishing.",
        evidence: report.spf.message,
        cveNote: "No hay CVE directa: es una debilidad de configuracion DNS."
      });
    } else if (report.spf.status === "warn") {
      risks.push({
        area: "SPF",
        status: "warn",
        severity: "medium",
        title: "SPF requiere endurecimiento.",
        impact: "La politica puede permitir resultados ambiguos o fallar si se rebasa el limite de consultas DNS.",
        evidence: report.spf.message,
        cveNote: "No hay CVE directa: valida proveedores autorizados y el conteo SPF recursivo."
      });
    }

    if (report.dmarc.status === "fail" || (dmarcTags.p || "").toLowerCase() === "none") {
      risks.push({
        area: "DMARC",
        status: report.dmarc.status === "fail" ? "fail" : "warn",
        severity: report.dmarc.status === "fail" ? "high" : "medium",
        title: report.dmarc.status === "fail" ? "DMARC no esta publicado." : "DMARC esta en monitoreo.",
        impact: "Los receptores no tienen una politica fuerte para rechazar mensajes que fallen autenticacion y alineacion.",
        evidence: report.dmarc.message,
        cveNote: "No hay CVE directa: el riesgo es abuso de identidad del dominio."
      });
    } else if ((dmarcTags.p || "").toLowerCase() === "quarantine") {
      risks.push({
        area: "DMARC",
        status: "warn",
        severity: "low",
        title: "DMARC no esta en rechazo completo.",
        impact: "Parte del abuso puede terminar en cuarentena en vez de ser rechazado directamente.",
        evidence: "p=quarantine",
        cveNote: "No hay CVE directa."
      });
    }

    if (report.dkim.status === "fail") {
      risks.push({
        area: "DKIM",
        status: "fail",
        severity: "medium",
        title: "DKIM no fue detectado.",
        impact: "El dominio pierde una senal criptografica importante para demostrar integridad y alineacion del correo legitimo.",
        evidence: report.dkim.message,
        cveNote: "No hay CVE directa: confirma selectores reales del proveedor."
      });
    } else if (report.dkim.status === "warn") {
      risks.push({
        area: "DKIM",
        status: "warn",
        severity: "low",
        title: "DKIM tiene observaciones.",
        impact: "Selectores duplicados, llaves vacias o modo prueba pueden causar fallas de autenticacion.",
        evidence: report.dkim.message,
        cveNote: "No hay CVE directa."
      });
    }

    if (report.mx.status === "fail") {
      risks.push({
        area: "MX",
        status: "fail",
        severity: "medium",
        title: "El dominio no anuncia recepcion de correo.",
        impact: "Puede haber perdida de mensajes o una separacion incompleta entre dominios de envio y recepcion.",
        evidence: report.mx.message,
        cveNote: "Sin MX no se puede inferir producto MTA para busqueda CVE."
      });
    }

    if (report.mx.status === "pass" && mtaSts && mtaSts.status === "info") {
      risks.push({
        area: "MTA-STS",
        status: "info",
        severity: "low",
        title: "MTA-STS no esta publicado.",
        impact: "La entrega SMTP entrante puede depender de TLS oportunista sin politica publicada contra degradacion.",
        evidence: mtaSts.name,
        cveNote: "No hay CVE directa: es un control de transporte."
      });
    }

    if (report.mx.status === "pass" && tlsRpt && tlsRpt.status === "info") {
      risks.push({
        area: "TLS-RPT",
        status: "info",
        severity: "info",
        title: "TLS-RPT no esta publicado.",
        impact: "No recibiras telemetria estandar de fallas TLS en entrega SMTP.",
        evidence: tlsRpt.name,
        cveNote: "No hay CVE directa."
      });
    }

    if (report.mx.status === "pass" && mxProducts.length === 0) {
      risks.push({
        area: "CVE",
        status: "info",
        severity: "info",
        title: "Producto MTA no inferido desde MX.",
        impact: "DNS no expone software ni version; las CVEs requieren revisar banner SMTP, proveedor o inventario.",
        evidence: mxEvidence || report.mx.message,
        cveNote: "Haz busqueda CVE despues de confirmar producto y version."
      });
    }

    mxProducts.forEach(function (product) {
      risks.push({
        area: "CVE",
        status: "info",
        severity: "info",
        title: "Busqueda CVE sugerida: " + product.name + ".",
        impact: "El hostname MX sugiere este proveedor o producto, pero DNS no confirma version ni exposicion.",
        evidence: product.evidence,
        cveNote: "Confirma banner/version del servicio antes de asociar CVEs.",
        cveSearch: nvdSearchUrl(product.query)
      });
    });

    if (risks.length === 0) {
      risks.push({
        area: "OK",
        status: "pass",
        severity: "info",
        title: "Sin riesgos altos inferidos por DNS.",
        impact: "Los controles revisados no muestran exposiciones evidentes desde esta vista DNS.",
        evidence: "Score " + report.score + "/100",
        cveNote: "No se puede descartar CVEs sin inventario de software y versiones."
      });
    }

    return risks;
  }

  function findExtraCheck(report, label) {
    return (report.extras.checks || []).filter(function (check) {
      return check.label === label;
    })[0];
  }

  function inferMxProducts(records) {
    var candidates = [
      { match: /google(mail)?\.com$/i, name: "Google Workspace / Gmail MX", query: "Google Workspace Gmail SMTP" },
      { match: /protection\.outlook\.com$/i, name: "Microsoft 365 / Exchange Online", query: "Microsoft Exchange Online" },
      { match: /mimecast/i, name: "Mimecast", query: "Mimecast email security" },
      { match: /pphosted|proofpoint/i, name: "Proofpoint", query: "Proofpoint email protection" },
      { match: /messagelabs|symantec/i, name: "Broadcom Symantec Email Security", query: "Symantec Email Security" },
      { match: /zoho/i, name: "Zoho Mail", query: "Zoho Mail" },
      { match: /protonmail|proton\.ch/i, name: "Proton Mail", query: "Proton Mail" },
      { match: /zimbra/i, name: "Zimbra", query: "Zimbra Collaboration" },
      { match: /secureserver|outlook\.secureserver/i, name: "GoDaddy Mail", query: "GoDaddy email" }
    ];
    var seen = {};

    return records.reduce(function (items, record) {
      var exchange = record.exchange || "";

      candidates.forEach(function (candidate) {
        if (!candidate.match.test(exchange) || seen[candidate.name]) return;
        seen[candidate.name] = true;
        items.push({
          name: candidate.name,
          query: candidate.query,
          evidence: exchange
        });
      });

      return items;
    }, []);
  }

  function nvdSearchUrl(query) {
    return "https://nvd.nist.gov/vuln/search/results?form_type=Basic&results_type=overview&query=" + encodeURIComponent(query) + "&search_type=all";
  }

  function localizeText(value) {
    var text = String(value == null ? "" : value);
    var exact;
    var match;

    if (currentLang !== "en") return text;

    exact = {
      "Acciones sugeridas al final del analisis.": "Suggested actions at the end of the analysis.",
      "Alineacion estricta para DKIM y SPF.": "Strict alignment is enabled for DKIM and SPF.",
      "Complementos": "Extras",
      "Control opcional: evalua si aporta valor para el dominio.": "Optional control: evaluate whether it adds value for the domain.",
      "DKIM": "DKIM",
      "DKIM activo": "DKIM active",
      "DKIM con observaciones": "DKIM with notes",
      "DKIM detectado con observaciones.": "DKIM was detected with notes.",
      "DMARC": "DMARC",
      "DMARC requiere un solo registro en _dmarc.": "DMARC requires a single record at _dmarc.",
      "El dominio anuncia recepcion de correo.": "The domain advertises mail reception.",
      "El mecanismo -all cierra la politica con rechazo SPF.": "The -all mechanism closes the policy with SPF rejection.",
      "El mecanismo ptr es costoso y suele evitarse en SPF moderno.": "The ptr mechanism is expensive and is usually avoided in modern SPF.",
      "El tag p es obligatorio en DMARC.": "The p tag is required in DMARC.",
      "Error al consultar selector": "Error querying selector",
      "Escribe un dominio.": "Enter a domain.",
      "Falla": "Fail",
      "Falta": "Missing",
      "Hay multiples registros SPF.": "There are multiple SPF records.",
      "Hereda p": "Inherits p",
      "La llave publica falta o esta vacia; puede ser un selector revocado.": "The public key is missing or empty; this may be a revoked selector.",
      "La politica esta cerca del limite de 10 consultas DNS de SPF.": "The policy is close to the 10 DNS lookup SPF limit.",
      "La politica supera el limite real estimado de 10 consultas DNS de SPF.": "The policy exceeds the estimated real 10 DNS lookup SPF limit.",
      "La politica supera el limite teorico de 10 consultas DNS de SPF.": "The policy exceeds the theoretical 10 DNS lookup SPF limit.",
      "Los servidores receptores no tienen una politica SPF que evaluar.": "Receiving servers do not have an SPF policy to evaluate.",
      "MailShield Radar": "MailShield Radar",
      "MTA-STS / TLS-RPT / BIMI": "MTA-STS / TLS-RPT / BIMI",
      "Multiples TXT DKIM para el mismo selector.": "Multiple DKIM TXT records exist for the same selector.",
      "MX": "MX",
      "Ninguno": "None",
      "No hay hallazgos criticos en los controles revisados.": "No critical findings were detected in the reviewed controls.",
      "No publicado": "Not published",
      "No se detectaron riesgos basicos en la politica SPF.": "No basic risks were detected in the SPF policy.",
      "No se detecto mecanismo all al final de la politica.": "No all mechanism was detected at the end of the policy.",
      "No se pudo consultar DNS.": "Could not query DNS.",
      "No se encontro DKIM con los selectores probados.": "No DKIM record was found with the tested selectors.",
      "No se encontro DKIM en los selectores indicados.": "No DKIM record was found in the provided selectors.",
      "No se encontro DMARC.": "No DMARC record was found.",
      "No se encontro SPF en el dominio raiz.": "No SPF record was found at the root domain.",
      "No se encontraron registros MX.": "No MX records were found.",
      "No hay rua para recibir reportes agregados.": "No rua tag is present to receive aggregate reports.",
      "No publicado en default._bimi": "Not published at default._bimi",
      "No se encontraron selectores DKIM con respuesta.": "No DKIM selectors responded.",
      "OK": "OK",
      "Politica DMARC publicada.": "DMARC policy is published.",
      "Publicado": "Published",
      "Recomendaciones": "Recommendations",
      "Registros SPF": "SPF records",
      "Consultas SPF": "SPF lookups",
      "SPF recursivo": "Recursive SPF",
      "consultas DNS estimadas": "estimated DNS lookups",
      "TXT revisados": "TXT checked",
      "Includes": "Includes",
      "Nombre": "Name",
      "Alineacion": "Alignment",
      "SPF": "SPF",
      "SPF requiere un solo registro v=spf1 por dominio.": "SPF requires a single v=spf1 record per domain.",
      "SPF no protege de forma confiable.": "SPF does not protect reliably.",
      "SPF permite cualquier origen.": "SPF allows any sender.",
      "SPF requiere endurecimiento.": "SPF needs hardening.",
      "Un atacante puede intentar enviar correo usando el dominio y aumentar la probabilidad de suplantacion o phishing.": "An attacker may try to send mail using the domain and increase the likelihood of spoofing or phishing.",
      "La politica puede permitir resultados ambiguos o fallar si se rebasa el limite de consultas DNS.": "The policy may allow ambiguous results or fail when the DNS lookup limit is exceeded.",
      "No hay CVE directa: es una debilidad de configuracion DNS.": "No direct CVE: this is a DNS configuration weakness.",
      "No hay CVE directa: valida proveedores autorizados y el conteo SPF recursivo.": "No direct CVE: validate authorized providers and the recursive SPF count.",
      "DMARC no esta publicado.": "DMARC is not published.",
      "DMARC esta en monitoreo.": "DMARC is in monitoring mode.",
      "Los receptores no tienen una politica fuerte para rechazar mensajes que fallen autenticacion y alineacion.": "Receivers do not have a strong policy to reject messages that fail authentication and alignment.",
      "No hay CVE directa: el riesgo es abuso de identidad del dominio.": "No direct CVE: the risk is domain identity abuse.",
      "DMARC no esta en rechazo completo.": "DMARC is not in full rejection.",
      "Parte del abuso puede terminar en cuarentena en vez de ser rechazado directamente.": "Some abuse may land in quarantine instead of being rejected directly.",
      "No hay CVE directa.": "No direct CVE.",
      "DKIM no fue detectado.": "DKIM was not detected.",
      "El dominio pierde una senal criptografica importante para demostrar integridad y alineacion del correo legitimo.": "The domain loses an important cryptographic signal for legitimate mail integrity and alignment.",
      "No hay CVE directa: confirma selectores reales del proveedor.": "No direct CVE: confirm the provider's real selectors.",
      "DKIM tiene observaciones.": "DKIM has observations.",
      "Selectores duplicados, llaves vacias o modo prueba pueden causar fallas de autenticacion.": "Duplicate selectors, empty keys, or test mode can cause authentication failures.",
      "El dominio no anuncia recepcion de correo.": "The domain does not advertise mail reception.",
      "Puede haber perdida de mensajes o una separacion incompleta entre dominios de envio y recepcion.": "Messages may be lost, or sending and receiving domains may be incompletely separated.",
      "Sin MX no se puede inferir producto MTA para busqueda CVE.": "Without MX, no MTA product can be inferred for CVE search.",
      "MTA-STS no esta publicado.": "MTA-STS is not published.",
      "La entrega SMTP entrante puede depender de TLS oportunista sin politica publicada contra degradacion.": "Inbound SMTP delivery may depend on opportunistic TLS without a published downgrade-resistant policy.",
      "No hay CVE directa: es un control de transporte.": "No direct CVE: this is a transport control.",
      "TLS-RPT no esta publicado.": "TLS-RPT is not published.",
      "No recibiras telemetria estandar de fallas TLS en entrega SMTP.": "You will not receive standard telemetry for TLS failures in SMTP delivery.",
      "El hostname MX sugiere este proveedor o producto, pero DNS no confirma version ni exposicion.": "The MX hostname suggests this provider or product, but DNS does not confirm version or exposure.",
      "Confirma banner/version del servicio antes de asociar CVEs.": "Confirm the service banner/version before associating CVEs.",
      "Producto MTA no inferido desde MX.": "MTA product was not inferred from MX.",
      "DNS no expone software ni version; las CVEs requieren revisar banner SMTP, proveedor o inventario.": "DNS does not expose software or version; CVEs require checking SMTP banner, provider, or inventory.",
      "Haz busqueda CVE despues de confirmar producto y version.": "Search CVEs after confirming product and version.",
      "Sin riesgos altos inferidos por DNS.": "No high risks inferred from DNS.",
      "Los controles revisados no muestran exposiciones evidentes desde esta vista DNS.": "The reviewed controls do not show obvious exposure from this DNS view.",
      "No se puede descartar CVEs sin inventario de software y versiones.": "CVEs cannot be ruled out without a software and version inventory.",
      "Sin MX, el dominio no anuncia servidores de recepcion.": "Without MX, the domain does not advertise receiving mail servers.",
      "Sin TXT DKIM": "No DKIM TXT",
      "Un registro SPF publicado.": "One SPF record is published.",
      "Usa un dominio como dominio.com o sub.dominio.com.": "Use a domain like domain.com or sub.domain.com.",
      "+all permite cualquier origen y anula el valor de SPF.": "+all allows any source and defeats the value of SPF.",
      "?all deja la politica en neutral.": "?all leaves the policy neutral.",
      "~all es tolerante; -all es mas estricto cuando el inventario esta cerrado.": "~all is tolerant; -all is stricter once the sender inventory is complete.",
      "p=none monitorea, pero no aplica cuarentena ni rechazo.": "p=none monitors but does not apply quarantine or rejection.",
      "p=quarantine reduce abuso, aunque p=reject ofrece mayor bloqueo.": "p=quarantine reduces abuse, although p=reject provides stronger blocking.",
      "p=reject aplica la politica DMARC mas estricta.": "p=reject applies the strictest DMARC policy.",
      "t=y marca el selector en modo prueba.": "t=y marks the selector as test mode."
    };

    if (exact[text]) return exact[text];

    match = text.match(/^Falta _dmarc\.(.+) con v=DMARC1\.$/);
    if (match) return "Missing _dmarc." + match[1] + " with v=DMARC1.";

    match = text.match(/^DMARC requiere un solo registro en _dmarc\.(.+)\.$/);
    if (match) return "DMARC requires a single record at _dmarc." + match[1] + ".";

    match = text.match(/^La politica DMARC p=(.+) no es valida\.$/);
    if (match) return "The DMARC policy p=" + match[1] + " is not valid.";

    match = text.match(/^Bucle SPF detectado en (.+)\.$/);
    if (match) return "SPF loop detected at " + match[1] + ".";

    match = text.match(/^Profundidad SPF maxima alcanzada en (.+)\.$/);
    if (match) return "Maximum SPF depth reached at " + match[1] + ".";

    match = text.match(/^(Include|Redirect) SPF sin registro en (.+)\.$/);
    if (match) return match[1] + " SPF has no record at " + match[2] + ".";

    match = text.match(/^(Include|Redirect) SPF con multiples registros en (.+)\.$/);
    if (match) return match[1] + " SPF has multiple records at " + match[2] + ".";

    match = text.match(/^No se pudo expandir (include|redirect) SPF (.+): (.+)$/);
    if (match) return "Could not expand " + match[1] + " SPF " + match[2] + ": " + match[3];

    match = text.match(/^Busqueda CVE sugerida: (.+)\.$/);
    if (match) return "Suggested CVE search: " + match[1] + ".";

    match = text.match(/^pct=(.+) aplica DMARC solo a una parte del trafico\.$/);
    if (match) return "pct=" + match[1] + " applies DMARC to only part of the traffic.";

    match = text.match(/^Alineacion relajada: adkim=(.+), aspf=(.+)\.$/);
    if (match) return "Relaxed alignment: adkim=" + match[1] + ", aspf=" + match[2] + ".";

    match = text.match(/^DKIM activo en (\d+) selector\(es\)\.$/);
    if (match) return "DKIM active on " + match[1] + " selector(s).";

    match = text.match(/^Llave publicada \((\d+) caracteres\)\.$/);
    if (match) return "Key published (" + match[1] + " characters).";

    match = text.match(/^Tipo de llave no habitual: (.+)\.$/);
    if (match) return "Unusual key type: " + match[1] + ".";

    match = text.match(/^CNAME a (.+)\.$/);
    if (match) return "CNAME to " + match[1] + ".";

    match = text.match(/^(\d+) servidor\(es\) MX publicado\(s\)\.$/);
    if (match) return match[1] + " MX server(s) published.";

    match = text.match(/^(\d+) control\(es\) opcional\(es\) publicado\(s\)\.$/);
    if (match) return match[1] + " optional control(s) published.";

    match = text.match(/^No publicado en (.+)$/);
    if (match) return "Not published at " + match[1];

    match = text.match(/^Tiempo agotado consultando (.+)\.$/);
    if (match) return "Timeout querying " + match[1] + ".";

    match = text.match(/^(.+) respondio HTTP (.+)\.$/);
    if (match) return match[1] + " returned HTTP " + match[2] + ".";

    match = text.match(/^Resolver no soportado: (.+)$/);
    if (match) return "Unsupported resolver: " + match[1];

    match = text.match(/^Confirma que el selector escrito exista y publica un TXT en selector\._domainkey\.(.+)\.$/);
    if (match) return "Confirm the provided selector exists and publish a TXT record at selector._domainkey." + match[1] + ".";

    if (text === "Agrega el selector real del proveedor o publica DKIM para los sistemas que envian correo por este dominio.") {
      return "Add the real provider selector or publish DKIM for the systems that send mail for this domain.";
    }
    match = text.match(/^Revisa el TXT del selector (.+) y evita llaves vacias, modo prueba o registros duplicados\.$/);
    if (match) return "Review the TXT record for selector " + match[1] + " and avoid empty keys, test mode, or duplicate records.";
    if (text === "Considera publicar MTA-STS para indicar a otros servidores que usen TLS al entregar correo.") {
      return "Consider publishing MTA-STS to tell other servers to use TLS when delivering mail.";
    }
    if (text === "Considera publicar TLS-RPT para recibir reportes de fallas de entrega con TLS.") {
      return "Consider publishing TLS-RPT to receive reports about TLS delivery failures.";
    }
    if (text === "BIMI es opcional; publicalo cuando DMARC este en enforcement y tengas logo/VMC listos.") {
      return "BIMI is optional; publish it when DMARC is enforced and your logo/VMC are ready.";
    }
    if (text === "Mantén inventario de proveedores de correo y revisa estos registros despues de cualquier cambio de envio.") {
      return "Maintain an inventory of mail providers and review these records after any sending change.";
    }
    if (text === "Fusiona todos los mecanismos autorizados en un solo registro v=spf1.") {
      return "Merge all authorized mechanisms into a single v=spf1 record.";
    }
    if (text === "Sustituye +all por -all o ~all despues de validar todos los remitentes legitimos.") {
      return "Replace +all with -all or ~all after validating all legitimate senders.";
    }
    if (text === "Cuando el inventario de envio este completo, endurece la politica hacia -all.") {
      return "When the sending inventory is complete, harden the policy to -all.";
    }
    if (text === "Reduce includes anidados, elimina proveedores no usados o usa subdominios separados para no romper SPF.") {
      return "Reduce nested includes, remove unused providers, or use separate subdomains to avoid breaking SPF.";
    }
    if (text === "Reemplaza ptr por ip4, ip6, a, mx o include de proveedor documentado.") {
      return "Replace ptr with ip4, ip6, a, mx, or a documented provider include.";
    }
    if (text === "Publica un unico SPF con los proveedores autorizados y un mecanismo all explicito.") {
      return "Publish a single SPF record with authorized providers and an explicit all mechanism.";
    }
    if (text === "Publica _dmarc con v=DMARC1, un correo rua y una politica inicial p=none para monitorear.") {
      return "Publish _dmarc with v=DMARC1, a rua mailbox, and an initial p=none policy for monitoring.";
    }
    if (text === "Usa los reportes rua para validar alineacion y avanza gradualmente a quarantine o reject.") {
      return "Use rua reports to validate alignment and gradually move to quarantine or reject.";
    }
    if (text === "Cuando no haya falsos positivos, cambia a p=reject para bloquear suplantacion.") {
      return "When there are no false positives, move to p=reject to block spoofing.";
    }
    if (text === "Sube pct a 100 cuando la politica ya no afecte correo legitimo.") {
      return "Raise pct to 100 when the policy no longer affects legitimate mail.";
    }
    if (text === "Agrega rua=mailto:reportes@tu-dominio para recibir reportes agregados.") {
      return "Add rua=mailto:reports@your-domain to receive aggregate reports.";
    }
    if (text === "Evalua adkim=s y aspf=s cuando todos los proveedores usen dominios alineados.") {
      return "Evaluate adkim=s and aspf=s when all providers use aligned domains.";
    }
    if (text === "Asegura una sola politica DMARC valida con reportes y una ruta clara hacia reject.") {
      return "Ensure a single valid DMARC policy with reports and a clear path toward reject.";
    }
    if (text === "Publica registros MX validos o separa este dominio si solo se usa para envio sin recepcion.") {
      return "Publish valid MX records or separate this domain if it is only used for sending without receiving.";
    }
    if (text === "Corrige este hallazgo antes de considerar el dominio protegido.") {
      return "Fix this finding before considering the domain protected.";
    }
    if (text === "Revisa este punto y documenta la decision operativa.") {
      return "Review this point and document the operational decision.";
    }

    return text;
  }

  function localizeDkimToolbar(found, missingCount) {
    if (currentLang === "en") {
      return found + " found · " + missingCount + " no response";
    }

    return found + " encontrados · " + missingCount + " sin respuesta";
  }

  function renderReport(report) {
    renderSummary(report);
    renderReportSnapshot(report);
    renderScorePanel(report);
    renderSpfPanel(report.spf);
    renderStandardPanel(els.panels.dmarc, report.dmarc);
    renderDkimPanel(report.dkim);
    renderMxPanel(report.mx);
    renderExtrasPanel(report.extras);
    renderRecommendationsPanel(report.recommendations || []);
    renderRisksPanel(report.risks || []);
    els.reportActions.hidden = false;
  }

  function renderReportSnapshot(report) {
    var items = [
      { label: currentLang === "en" ? "Domain" : "Dominio", value: report.domain },
      { label: currentLang === "en" ? "Date" : "Fecha", value: formatDate(report.checkedAt) },
      { label: "Resolver", value: report.resolver },
      { label: "Score", value: report.score + "/100" },
      { label: t("severity"), value: severityLabel(severityForStatus(scoreStatus(report.score))) }
    ];

    els.reportSnapshot.innerHTML =
      '<span class="snapshot-title">' +
      escapeHtml(t("reportSnapshot")) +
      "</span>" +
      items
        .map(function (item) {
          return (
            '<span class="snapshot-item"><span>' +
            escapeHtml(item.label) +
            "</span><strong>" +
            escapeHtml(item.value) +
            "</strong></span>"
          );
        })
        .join("");
    els.reportSnapshot.hidden = false;
  }

  function renderScorePanel(report) {
    els.panels.score.innerHTML =
      renderPanelHead(t("score"), t("scoreSubtitle"), scoreStatus(report.score), "score") +
      '<div class="panel-body">' +
      '<ul class="score-list">' +
      (report.scoreBreakdown || [])
        .map(function (item) {
          var width = item.max === 0 ? 0 : Math.round((item.points / item.max) * 100);

          return (
            '<li class="score-item ' +
            item.status +
            '">' +
            '<div><span class="score-name">' +
            escapeHtml(item.label) +
            '</span><div class="muted-text">' +
            escapeHtml(statusLabel(item.status)) +
            "</div></div>" +
            '<div class="score-bar" aria-hidden="true"><span style="--score-width: ' +
            width +
            '%"></span></div>' +
            '<div class="score-value">' +
            escapeHtml(item.points + " / " + item.max) +
            "</div></li>"
          );
        })
        .join("") +
      "</ul></div>";
  }

  function renderSpfPanel(result) {
    els.panels.spf.innerHTML =
      renderPanelHead(result.title, result.message, result.status, "spf") +
      '<div class="panel-body">' +
      renderMeta(result.meta || []) +
      renderFindings(result.findings || [], "SPF") +
      renderSpfTrace(result.spfTrace) +
      renderTxtRecords(result.records || []) +
      "</div>";
  }

  function renderSummary(report) {
    var cards = [
      { label: "Score", value: report.score + "/100", detail: report.domain, status: scoreStatus(report.score) },
      { label: "SPF", value: statusLabel(report.spf.status), detail: localizeText(report.spf.message), status: report.spf.status },
      { label: "DMARC", value: statusLabel(report.dmarc.status), detail: localizeText(report.dmarc.message), status: report.dmarc.status },
      {
        label: "DKIM",
        value: report.dkim.found + "/" + report.dkim.checked,
        detail: localizeText(report.dkim.message),
        status: report.dkim.status
      },
      { label: "MX", value: statusLabel(report.mx.status), detail: localizeText(report.mx.message), status: report.mx.status }
    ];

    els.summary.innerHTML = cards
      .map(function (card) {
        return (
          '<article class="summary-card ' +
          card.status +
          '">' +
          '<div class="summary-label"><span>' +
          escapeHtml(card.label) +
          '</span><span class="status-dot ' +
          card.status +
          '"></span></div>' +
          '<div class="summary-value">' +
          escapeHtml(card.value) +
          "</div>" +
          '<div class="summary-detail">' +
          escapeHtml(card.detail) +
          "</div>" +
          "</article>"
        );
      })
      .join("");
    els.summary.hidden = false;
  }

  function renderStandardPanel(panel, result) {
    panel.innerHTML =
      renderPanelHead(result.title, result.message, result.status, result.title.toLowerCase()) +
      '<div class="panel-body">' +
      renderMeta(result.meta || []) +
      renderFindings(result.findings || [], result.title) +
      renderTxtRecords(result.records || []) +
      "</div>";
  }

  function renderMxPanel(result) {
    panelReplace(
      els.panels.mx,
      renderPanelHead(result.title, result.message, result.status, "mx") +
        '<div class="panel-body">' +
        renderFindings(result.findings || [], "MX") +
        '<ul class="record-list">' +
        (result.records || [])
          .map(function (record) {
            return (
              '<li class="record"><code>' +
              escapeHtml(record.priority + " " + record.exchange) +
              "</code></li>"
            );
          })
          .join("") +
        "</ul></div>"
    );
  }

  function renderExtrasPanel(result) {
    els.panels.extras.innerHTML =
      renderPanelHead(result.title, result.message, result.status, "extras") +
      '<div class="panel-body"><ul class="compact-list">' +
      result.checks
        .map(function (check) {
          return (
            '<li class="compact-item ' +
            check.status +
            '"><span class="status-dot ' +
            check.status +
            '"></span><div><strong>' +
            escapeHtml(check.label) +
            '</strong><div class="muted-text">' +
            escapeHtml(localizeText(check.message)) +
            " · " +
            escapeHtml(check.name) +
            "</div>" +
            renderTxtRecords(check.records || []) +
            "</div></li>"
          );
        })
        .join("") +
      "</ul></div>";
  }

  function renderRecommendationsPanel(recommendations) {
    els.panels.recommendations.innerHTML =
      renderPanelHead(t("recommendations"), t("recommendationsSubtitle"), recommendations.length ? "info" : "pass", "recommendations") +
      '<div class="panel-body">' +
      '<ul class="recommendation-list">' +
      recommendations
        .map(function (item) {
          var severity = severityForRecommendation(item);

          return (
            '<li class="recommendation ' +
            item.status +
            '">' +
            '<div><span class="badge ' +
            item.status +
            '">' +
            escapeHtml(localizeText(item.area)) +
            '</span><span class="severity-badge ' +
            severity +
            '">' +
            escapeHtml(severityLabel(severity)) +
            '</span></div><div class="recommendation-body"><strong>' +
            escapeHtml(localizeText(item.finding)) +
            '</strong><span class="recommendation-text">' +
            escapeHtml(localizeText(item.recommendation)) +
            "</span></div></li>"
          );
        })
        .join("") +
      "</ul></div>";
  }

  function renderRisksPanel(risks) {
    els.panels.risks.innerHTML =
      renderPanelHead(t("risks"), t("risksSubtitle"), riskPanelStatus(risks), "risks") +
      '<div class="panel-body">' +
      '<ul class="risk-list">' +
      risks
        .map(function (item) {
          var link = item.cveSearch
            ? '<a class="risk-link" href="' +
              escapeHtml(item.cveSearch) +
              '" target="_blank" rel="noreferrer">' +
              escapeHtml(t("cveFollowUp")) +
              "</a>"
            : "";

          return (
            '<li class="risk-item ' +
            item.status +
            '">' +
            '<div class="risk-head"><span class="badge ' +
            item.status +
            '">' +
            escapeHtml(localizeText(item.area)) +
            '</span><span class="severity-badge ' +
            item.severity +
            '">' +
            escapeHtml(severityLabel(item.severity)) +
            "</span></div>" +
            '<div class="risk-body"><strong>' +
            escapeHtml(localizeText(item.title)) +
            '</strong><span>' +
            escapeHtml(localizeText(item.impact)) +
            '</span><code>' +
            escapeHtml(localizeText(item.evidence)) +
            '</code><span class="muted-text">' +
            escapeHtml(localizeText(item.cveNote)) +
            "</span>" +
            link +
            "</div></li>"
          );
        })
        .join("") +
      "</ul></div>";
  }

  function risksContainIssues(risks) {
    return risks.some(function (item) {
      return item.status === "fail" || item.status === "warn";
    });
  }

  function riskPanelStatus(risks) {
    if (risksContainIssues(risks)) return "warn";
    if (
      risks.some(function (item) {
        return item.status === "info";
      })
    ) {
      return "info";
    }

    return "pass";
  }

  function renderDkimPanel(result) {
    var visible = result.results.filter(function (item) {
      return item.status !== "missing";
    });
    var missingCount = result.results.length - visible.length;

    if (visible.length === 0) {
      visible = result.results.slice(0, Math.min(8, result.results.length));
    }

    els.panels.dkim.innerHTML =
      renderPanelHead(result.title, result.message, result.status, "dkim") +
      '<div class="panel-body">' +
      '<div class="dkim-toolbar"><strong>' +
      escapeHtml(localizeDkimToolbar(result.found, missingCount)) +
      '</strong><div class="progress" aria-hidden="true"><span style="--progress: 100%"></span></div></div>' +
      '<ul class="dkim-list">' +
      visible
        .map(function (item) {
          return (
            '<li class="dkim-row ' +
            item.status +
            '">' +
            '<div class="dkim-selector">' +
            escapeHtml(item.selector) +
            '</div><div class="dkim-detail"><strong>' +
            escapeHtml(localizeText(item.summary)) +
            '</strong><span class="muted-text">' +
            escapeHtml(item.name) +
            "</span>" +
            renderDkimNotes(item) +
            renderTxtRecords(item.records || []) +
            '</div><span class="badge ' +
            item.status +
            '">' +
            escapeHtml(statusLabel(item.status)) +
            "</span></li>"
          );
        })
        .join("") +
      "</ul></div>";
  }

  function renderDkimProgress(done, total) {
    var percent = total === 0 ? 0 : Math.round((done / total) * 100);

    els.panels.dkim.innerHTML =
      renderPanelHead("DKIM", currentLang === "en" ? "In progress." : "En progreso.", "info") +
      '<div class="panel-body"><div class="dkim-toolbar"><strong>' +
      escapeHtml(done + " / " + total) +
      '</strong><div class="progress" aria-hidden="true"><span style="--progress: ' +
      percent +
      '%"></span></div></div></div>';
  }

  function renderDkimNotes(item) {
    var notes = item.notes || [];

    if (item.error) {
      notes = notes.concat([item.error]);
    }

    if (item.cnames && item.cnames.length > 0) {
      notes = notes.concat(
        item.cnames.map(function (name) {
          return "CNAME: " + name;
        })
      );
    }

    if (notes.length === 0) return "";

    return (
      '<ul class="compact-list">' +
      notes
        .map(function (note) {
          return '<li class="record"><code>' + escapeHtml(localizeText(note)) + "</code></li>";
        })
        .join("") +
      "</ul>"
    );
  }

  function renderSpfTrace(trace) {
    if (!trace) return "";

    return (
      '<div class="spf-trace"><div class="section-toolbar"><strong>' +
      escapeHtml(localizeText("SPF recursivo")) +
      '</strong><span class="muted-text">' +
      escapeHtml(trace.totalLookups + " / 10 " + localizeText("consultas DNS estimadas")) +
      '</span></div><ul class="spf-tree">' +
      renderSpfNode(trace, true) +
      "</ul></div>"
    );
  }

  function renderSpfNode(node, root) {
    var children = node.children || [];
    var label = root ? node.domain : (node.type || "include") + ": " + node.domain;
    var tone = node.totalLookups > 10 ? "fail" : node.totalLookups >= 8 ? "warn" : "info";

    return (
      '<li class="spf-node ' +
      tone +
      '"><div class="spf-node-head"><span class="status-dot ' +
      tone +
      '"></span><div><strong>' +
      escapeHtml(label) +
      '</strong><div class="muted-text">' +
      escapeHtml(node.directLookups + " directas · " + node.totalLookups + " total") +
      "</div></div></div>" +
      (children.length
        ? '<ul class="spf-tree">' +
          children
            .map(function (child) {
              return renderSpfNode(child, false);
            })
            .join("") +
          "</ul>"
        : "") +
      "</li>"
    );
  }

  function renderPanelHead(title, subtitle, status, sectionKey) {
    var severity = severityForStatus(status);
    var action = sectionKey
      ? '<button type="button" class="copy-section-button" data-copy-section="' +
        escapeHtml(sectionKey) +
        '">' +
        escapeHtml(t("copyEvidence")) +
        "</button>"
      : "";

    return (
      '<div class="panel-head ' +
      status +
      '"><div><h2 class="panel-title">' +
      escapeHtml(localizeText(title)) +
      '</h2><p class="panel-subtitle">' +
      escapeHtml(localizeText(subtitle)) +
      '</p></div><div class="panel-badges"><span class="severity-badge ' +
      severity +
      '">' +
      escapeHtml(severityLabel(severity)) +
      '</span><span class="badge ' +
      status +
      '">' +
      escapeHtml(statusLabel(status)) +
      "</span>" +
      action +
      "</div></div>"
    );
  }

  function renderMeta(meta) {
    if (!meta.length) return "";

    return (
      '<div class="meta-grid">' +
      meta
        .map(function (item) {
          return (
            '<div class="meta-item"><div class="meta-label">' +
            escapeHtml(localizeText(item.label)) +
            '</div><div class="meta-value">' +
            escapeHtml(localizeText(item.value)) +
            "</div></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderFindings(findings, area) {
    if (!findings.length) return "";

    return (
      '<ul class="finding-list">' +
      findings
        .map(function (finding) {
          var severity = severityForFinding(area || "", finding);

          return (
            '<li class="finding ' +
            finding.status +
            '"><span class="status-dot ' +
            finding.status +
            '"></span><span>' +
            escapeHtml(localizeText(finding.text)) +
            '</span><span class="severity-badge ' +
            severity +
            '">' +
            escapeHtml(severityLabel(severity)) +
            "</span></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  function renderTxtRecords(records) {
    if (!records.length) return "";

    return (
      '<ul class="record-list">' +
      records
        .map(function (record) {
          return (
            '<li class="record"><code>' +
            escapeHtml(record.text || record.data || "") +
            "</code></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  function panelReplace(panel, html) {
    panel.innerHTML = html;
  }

  function clearResults() {
    els.summary.hidden = true;
    els.reportSnapshot.hidden = true;
    els.reportActions.hidden = true;
    els.summary.innerHTML = "";
    els.reportSnapshot.innerHTML = "";
    els.panels.score.innerHTML = '<div class="empty-state">Score</div>';
    els.panels.spf.innerHTML = '<div class="empty-state">SPF</div>';
    els.panels.dmarc.innerHTML = '<div class="empty-state">DMARC</div>';
    els.panels.dkim.innerHTML = '<div class="empty-state">DKIM</div>';
    els.panels.mx.innerHTML = '<div class="empty-state">MX</div>';
    els.panels.extras.innerHTML = '<div class="empty-state">MTA-STS / TLS-RPT / BIMI</div>';
    els.panels.recommendations.innerHTML = '<div class="empty-state">' + escapeHtml(t("recommendations")) + "</div>";
    els.panels.risks.innerHTML = '<div class="empty-state">' + escapeHtml(t("risks")) + "</div>";
  }

  function showError(message) {
    clearResults();
    els.panels.spf.innerHTML = '<div class="panel-body"><div class="error-box">' + escapeHtml(localizeText(message)) + "</div></div>";
  }

  function setStatus(text, tone) {
    els.runStatus.textContent = UI_TEXT[currentLang] && UI_TEXT[currentLang][text] ? t(text) : localizeText(text);
    els.runStatus.className = "status-pill" + (tone ? " " + tone : "");
  }

  function setLoading(isLoading) {
    els.auditButton.disabled = isLoading;
    els.sampleButton.disabled = isLoading;
    els.resolverSelect.disabled = isLoading;
    els.customSelectors.disabled = isLoading;
    els.selectorDepth.disabled = isLoading || document.querySelector('input[name="selectorStrategy"]:checked').value === "specific";
    Array.from(document.querySelectorAll('input[name="selectorStrategy"]')).forEach(function (input) {
      input.disabled = isLoading;
    });
  }

  function statusLabel(status) {
    if (status === "pass") return "OK";
    if (status === "warn") return currentLang === "en" ? "Warning" : "Aviso";
    if (status === "fail") return currentLang === "en" ? "Fail" : "Falla";
    return "Info";
  }

  function severityLabel(severity) {
    var labels = {
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low",
      info: "Info"
    };

    return labels[severity] || labels.info;
  }

  function severityForStatus(status) {
    if (status === "fail") return "high";
    if (status === "warn") return "medium";
    if (status === "pass") return "info";
    return "low";
  }

  function severityForFinding(area, finding) {
    var text = String((finding && finding.text) || "").toLowerCase();

    if (finding.status === "fail") {
      if (text.indexOf("+all") !== -1 || text.indexOf("no se encontro dmarc") !== -1 || text.indexOf("falta _dmarc") !== -1) {
        return "critical";
      }
      return area === "MX" ? "medium" : "high";
    }

    if (finding.status === "warn") {
      if (text.indexOf("10 consultas") !== -1 || text.indexOf("bucle spf") !== -1) return "high";
      return "medium";
    }

    if (finding.status === "info") return "low";
    return "info";
  }

  function severityForRecommendation(item) {
    return severityForFinding(item.area, {
      status: item.status,
      text: item.finding
    });
  }

  function scoreStatus(score) {
    if (score >= 85) return "pass";
    if (score >= 60) return "warn";
    return "fail";
  }

  function formatDate(value) {
    try {
      return new Intl.DateTimeFormat(currentLang === "en" ? "en-US" : "es-MX", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  }

  function trimDot(value) {
    return String(value || "").replace(/\.$/, "");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function buildTextReport(report) {
    var exportReport = buildExportReport(report);
    var domainLabel = currentLang === "en" ? "Domain" : "Dominio";
    var dateLabel = currentLang === "en" ? "Date" : "Fecha";
    var linkLabel = currentLang === "en" ? "Share URL" : "Enlace";

    return [
      "MailShield Radar",
      domainLabel + ": " + exportReport.domain,
      dateLabel + ": " + exportReport.checkedAt,
      linkLabel + ": " + exportReport.shareUrl,
      "Score: " + exportReport.score + "/100",
      "SPF: " + statusLabel(exportReport.spf.status) + " - " + exportReport.spf.message,
      "DMARC: " + statusLabel(exportReport.dmarc.status) + " - " + exportReport.dmarc.message,
      "DKIM: " + statusLabel(exportReport.dkim.status) + " - " + exportReport.dkim.message,
      "MX: " + statusLabel(exportReport.mx.status) + " - " + exportReport.mx.message
    ].join("\n");
  }

  function buildSectionEvidence(report, section) {
    var data = buildExportReport(report);
    var labels =
      currentLang === "en"
        ? { status: "Status", severity: "Severity", evidence: "Evidence", recommendation: "Recommendation" }
        : { status: "Estado", severity: "Severidad", evidence: "Evidencia", recommendation: "Recomendacion" };
    var lines = ["# MailShield Radar - " + section.toUpperCase(), "", "- Dominio: `" + data.domain + "`", "- Fecha: `" + data.checkedAt + "`", ""];

    if (section === "score") {
      lines.push("## Score", "", "- Score: `" + data.score + "/100`");
      data.scoreBreakdown.forEach(function (item) {
        lines.push("- " + item.label + ": `" + item.points + "/" + item.max + "` `" + statusLabel(item.status) + "`");
      });
    } else if (section === "spf") {
      appendEvidenceStandard(lines, "SPF", data.spf, labels);
      if (data.spf.spfTrace) {
        lines.push("", "### SPF recursivo", "", "- Consultas estimadas: `" + data.spf.spfTrace.totalLookups + "/10`");
      }
    } else if (section === "dmarc") {
      appendEvidenceStandard(lines, "DMARC", data.dmarc, labels);
    } else if (section === "dkim") {
      lines.push("## DKIM", "", "- " + labels.status + ": `" + statusLabel(data.dkim.status) + "`", "- Resumen: " + data.dkim.message);
      if (data.dkim.selectors && data.dkim.selectors.length) {
        data.dkim.selectors.forEach(function (selector) {
          lines.push("", "### " + selector.selector, "", "- " + labels.status + ": `" + statusLabel(selector.status) + "`", "- Nombre: `" + selector.name + "`");
          if (selector.notes && selector.notes.length) appendBullets(lines, "Notas", selector.notes);
          appendTxtRecords(lines, selector.records || [], { records: "Registros" });
        });
      }
    } else if (section === "mx") {
      appendEvidenceStandard(lines, "MX", data.mx, labels);
      (data.mx.records || []).forEach(function (record) {
        lines.push("- `" + record.priority + " " + record.exchange + "`");
      });
    } else if (section === "extras") {
      lines.push("## " + localizeText("Complementos"));
      data.extras.published.forEach(function (check) {
        lines.push("", "### " + check.label, "", "- Nombre: `" + check.name + "`", "- " + labels.status + ": `" + statusLabel(check.status) + "`");
        appendTxtRecords(lines, check.records || [], { records: "Registros" });
      });
    } else if (section === "recommendations") {
      lines.push("## " + t("recommendations"));
      data.recommendations.forEach(function (item) {
        lines.push("- **" + item.area + "** `" + statusLabel(item.status) + "`: " + item.finding + " " + item.recommendation);
      });
    } else if (section === "risks") {
      lines.push("## " + t("risks"));
      data.risks.forEach(function (item) {
        lines.push(
          "- **" +
            item.area +
            "** `" +
            item.severityLabel +
            "`: " +
            item.title +
            " " +
            item.impact +
            " " +
            item.cveNote +
            (item.cveSearch ? " " + item.cveSearch : "")
        );
      });
    }

    return lines.join("\n") + "\n";
  }

  function appendEvidenceStandard(lines, title, result, labels) {
    lines.push("## " + title, "", "- " + labels.status + ": `" + statusLabel(result.status) + "`", "- Resumen: " + result.message);
    appendFindings(lines, result.findings || [], { findings: "Hallazgos" });
    appendTxtRecords(lines, result.records || [], { records: "Registros" });
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied", "");
    } catch (error) {
      setStatus("copyFailed", "fail");
    }
  }

  function downloadJson(report) {
    downloadBlob(
      report.domain + "-mailshield-report.json",
      JSON.stringify(buildExportReport(report), null, 2),
      "application/json"
    );
  }

  function downloadMarkdown(report) {
    downloadBlob(report.domain + "-mailshield-report.md", buildMarkdownReport(report), "text/markdown");
  }

  function downloadBlob(filename, content, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function buildExportReport(report) {
    return {
      app: "MailShield Radar",
      language: currentLang,
      domain: report.domain,
      checkedAt: report.checkedAt,
      resolver: report.resolver,
      shareUrl: buildShareUrl(report.domain),
      score: report.score,
      scoreBreakdown: (report.scoreBreakdown || []).map(function (item) {
        return {
          label: item.label,
          status: item.status,
          statusLabel: statusLabel(item.status),
          points: item.points,
          max: item.max,
          message: localizeText(item.message)
        };
      }),
      spf: compactStandardResult(report.spf),
      dmarc: compactStandardResult(report.dmarc),
      dkim: compactDkimResult(report.dkim),
      mx: compactMxResult(report.mx),
      extras: compactExtrasResult(report.extras),
      recommendations: (report.recommendations || []).map(function (item) {
        return {
          area: localizeText(item.area),
          status: item.status,
          statusLabel: statusLabel(item.status),
          severity: severityForRecommendation(item),
          severityLabel: severityLabel(severityForRecommendation(item)),
          finding: localizeText(item.finding),
          recommendation: localizeText(item.recommendation)
        };
      }),
      risks: (report.risks || []).map(function (item) {
        return {
          area: localizeText(item.area),
          status: item.status,
          statusLabel: statusLabel(item.status),
          severity: item.severity,
          severityLabel: severityLabel(item.severity),
          title: localizeText(item.title),
          impact: localizeText(item.impact),
          evidence: localizeText(item.evidence),
          cveNote: localizeText(item.cveNote),
          cveSearch: item.cveSearch || ""
        };
      })
    };
  }

  function compactStandardResult(result) {
    var output = {
      status: result.status,
      statusLabel: statusLabel(result.status),
      message: localizeText(result.message),
      findings: (result.findings || []).map(localizeFinding)
    };

    if (result.meta && result.meta.length) output.meta = result.meta.map(localizeMeta);
    if (result.records && result.records.length) output.records = compactTxtRecords(result.records);
    if (result.spfTrace) output.spfTrace = compactSpfTrace(result.spfTrace);

    return output;
  }

  function compactSpfTrace(trace) {
    return {
      type: trace.type || "",
      domain: trace.domain,
      directLookups: trace.directLookups,
      totalLookups: trace.totalLookups,
      expanded: trace.expanded,
      refs: (trace.refs || []).map(function (ref) {
        return { type: ref.type, domain: ref.domain };
      }),
      warnings: (trace.warnings || []).map(function (warning) {
        return {
          status: warning.status,
          statusLabel: statusLabel(warning.status),
          text: localizeText(warning.text)
        };
      }),
      children: (trace.children || []).map(compactSpfTrace)
    };
  }

  function compactMxResult(result) {
    return {
      status: result.status,
      statusLabel: statusLabel(result.status),
      message: localizeText(result.message),
      findings: (result.findings || []).map(localizeFinding),
      records: result.records || []
    };
  }

  function compactDkimResult(result) {
    var found = (result.results || []).filter(function (item) {
      return item.status !== "missing";
    });
    var output = {
      status: result.status,
      statusLabel: statusLabel(result.status),
      message: localizeText(result.message),
      mode: result.mode,
      checked: result.checked,
      found: result.found,
      active: result.active
    };

    if (found.length === 0) {
      return output;
    }

    output.selectors = found.map(function (item) {
      var selector = {
        selector: item.selector,
        name: item.name,
        status: item.status,
        statusLabel: statusLabel(item.status),
        summary: localizeText(item.summary)
      };

      if (item.records && item.records.length) selector.records = compactTxtRecords(item.records);
      if (item.cnames && item.cnames.length) selector.cnames = item.cnames;
      if (item.notes && item.notes.length) selector.notes = item.notes.map(localizeText);
      if (item.tags) selector.tags = item.tags;
      if (item.error) selector.error = localizeText(item.error);

      return selector;
    });

    return output;
  }

  function compactExtrasResult(result) {
    var published = (result.checks || []).filter(function (check) {
      return check.status !== "info";
    });

    return {
      status: result.status,
      statusLabel: statusLabel(result.status),
      message: localizeText(result.message),
      published: published.map(function (check) {
        return {
          label: check.label,
          name: check.name,
          status: check.status,
          statusLabel: statusLabel(check.status),
          message: localizeText(check.message),
          records: compactTxtRecords(check.records || [])
        };
      })
    };
  }

  function compactTxtRecords(records) {
    return records.map(function (record) {
      return {
        name: record.name,
        ttl: record.ttl,
        text: record.text
      };
    });
  }

  function localizeFinding(finding) {
    return {
      status: finding.status,
      statusLabel: statusLabel(finding.status),
      text: localizeText(finding.text)
    };
  }

  function localizeMeta(item) {
    return {
      label: localizeText(item.label),
      value: localizeText(item.value)
    };
  }

  function buildMarkdownReport(report) {
    var data = buildExportReport(report);
    var labels =
      currentLang === "en"
        ? {
            domain: "Domain",
            checkedAt: "Checked at",
            resolver: "Resolver",
            shareUrl: "Share URL",
            score: "Score",
            findings: "Findings",
            records: "Records",
            notes: "Notes",
            name: "Name",
            status: "Status",
            summary: "Summary",
            noDkim: "No DKIM selectors responded.",
            noExtras: "No optional extras were found.",
            points: "Points",
            recommendations: "Recommendations",
            risks: "Risks and CVEs"
          }
        : {
            domain: "Dominio",
            checkedAt: "Fecha",
            resolver: "Resolver",
            shareUrl: "Enlace",
            score: "Score",
            findings: "Hallazgos",
            records: "Registros",
            notes: "Notas",
            name: "Nombre",
            status: "Estado",
            summary: "Resumen",
            noDkim: "No se encontraron selectores DKIM con respuesta.",
            noExtras: "No se encontraron complementos opcionales publicados.",
            points: "Puntos",
            recommendations: "Recomendaciones",
            risks: "Riesgos y CVEs"
          };
    var lines = [
      "# MailShield Radar",
      "",
      "- " + labels.domain + ": `" + data.domain + "`",
      "- " + labels.checkedAt + ": `" + data.checkedAt + "`",
      "- " + labels.resolver + ": `" + data.resolver + "`",
      "- " + labels.shareUrl + ": " + data.shareUrl,
      "- " + labels.score + ": `" + data.score + "/100`",
      "",
      "## " + labels.score,
      ""
    ];

    data.scoreBreakdown.forEach(function (item) {
      lines.push("- **" + item.label + "** `" + item.points + "/" + item.max + "` " + statusLabel(item.status) + ": " + item.message);
    });

    lines.push(
      "",
      "## SPF",
      "",
      statusLine(data.spf, labels)
    );

    appendFindings(lines, data.spf.findings, labels);
    if (data.spf.spfTrace) {
      lines.push("", "### SPF recursivo", "", "- " + labels.points + ": `" + data.spf.spfTrace.totalLookups + "/10 DNS lookups`");
    }
    appendTxtRecords(lines, data.spf.records || [], labels);

    lines.push("", "## DKIM", "", statusLine(data.dkim, labels));
    if (data.dkim.selectors && data.dkim.selectors.length) {
      data.dkim.selectors.forEach(function (selector) {
        lines.push("", "### " + selector.selector, "", "- " + labels.status + ": `" + statusLabel(selector.status) + "`", "- " + labels.name + ": `" + selector.name + "`");
        if (selector.notes && selector.notes.length) appendBullets(lines, labels.notes, selector.notes);
        appendTxtRecords(lines, selector.records || [], labels);
      });
    } else {
      lines.push("", labels.noDkim);
    }

    lines.push("", "## DMARC", "", statusLine(data.dmarc, labels));
    appendFindings(lines, data.dmarc.findings, labels);
    appendTxtRecords(lines, data.dmarc.records || [], labels);

    lines.push("", "## MX", "", statusLine(data.mx, labels));
    appendFindings(lines, data.mx.findings, labels);
    if (data.mx.records && data.mx.records.length) {
      lines.push("", labels.records + ":");
      data.mx.records.forEach(function (record) {
        lines.push("- `" + record.priority + " " + record.exchange + "`");
      });
    }

    lines.push("", "## " + localizeText("Complementos"), "", statusLine(data.extras, labels));
    if (data.extras.published.length) {
      data.extras.published.forEach(function (check) {
        lines.push("", "### " + check.label, "", "- " + labels.name + ": `" + check.name + "`", "- " + labels.status + ": `" + statusLabel(check.status) + "`");
        appendTxtRecords(lines, check.records || [], labels);
      });
    } else {
      lines.push("", labels.noExtras);
    }

    lines.push("", "## " + labels.recommendations, "");
    data.recommendations.forEach(function (item) {
      lines.push("- **" + item.area + "** `" + item.severityLabel + "` `" + statusLabel(item.status) + "`: " + item.finding + " " + item.recommendation);
    });

    lines.push("", "## " + labels.risks, "");
    data.risks.forEach(function (item) {
      lines.push("- **" + item.area + "** `" + item.severityLabel + "`: " + item.title + " " + item.impact + " " + item.cveNote);
      if (item.cveSearch) lines.push("  " + item.cveSearch);
    });

    return lines.join("\n") + "\n";
  }

  function statusLine(result, labels) {
    return "**" + labels.status + ":** `" + statusLabel(result.status) + "`  \n**" + labels.summary + ":** " + result.message;
  }

  function appendFindings(lines, findings, labels) {
    if (!findings || !findings.length) return;

    lines.push("", labels.findings + ":");
    findings.forEach(function (finding) {
      lines.push("- `" + statusLabel(finding.status) + "` " + finding.text);
    });
  }

  function appendTxtRecords(lines, records, labels) {
    if (!records || !records.length) return;

    lines.push("", labels.records + ":");
    records.forEach(function (record) {
      lines.push("", "```text", record.text, "```");
    });
  }

  function appendBullets(lines, title, values) {
    lines.push("", title + ":");
    values.forEach(function (value) {
      lines.push("- " + value);
    });
  }
})();
