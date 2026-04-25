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

  var els = {
    form: document.getElementById("auditForm"),
    domainInput: document.getElementById("domainInput"),
    resolverSelect: document.getElementById("resolverSelect"),
    customSelectors: document.getElementById("customSelectors"),
    runStatus: document.getElementById("runStatus"),
    auditButton: document.getElementById("auditButton"),
    sampleButton: document.getElementById("sampleButton"),
    summary: document.getElementById("summary"),
    reportActions: document.getElementById("reportActions"),
    copyReportButton: document.getElementById("copyReportButton"),
    downloadJsonButton: document.getElementById("downloadJsonButton"),
    panels: {
      spf: document.getElementById("spfPanel"),
      dmarc: document.getElementById("dmarcPanel"),
      dkim: document.getElementById("dkimPanel"),
      mx: document.getElementById("mxPanel"),
      extras: document.getElementById("extrasPanel")
    }
  };

  var lastReport = null;

  els.form.addEventListener("submit", function (event) {
    event.preventDefault();
    runAudit();
  });

  els.sampleButton.addEventListener("click", function () {
    els.domainInput.value = "google.com";
    document.querySelector('input[name="selectorMode"][value="broad"]').checked = true;
    runAudit();
  });

  els.copyReportButton.addEventListener("click", function () {
    if (!lastReport) return;
    copyText(buildTextReport(lastReport));
  });

  els.downloadJsonButton.addEventListener("click", function () {
    if (!lastReport) return;
    downloadJson(lastReport);
  });

  function runAudit() {
    var domain;

    try {
      domain = normalizeDomain(els.domainInput.value);
    } catch (error) {
      setStatus("Dominio invalido", "fail");
      showError(error.message);
      return;
    }

    var selectorMode = document.querySelector('input[name="selectorMode"]:checked').value;
    var selectors = buildSelectorList(selectorMode, els.customSelectors.value);
    var resolver = els.resolverSelect.value;

    setLoading(true);
    setStatus("Consultando DNS", "running");
    clearResults();
    renderDkimProgress(0, selectors.length, []);

    auditDomain(domain, resolver, selectors)
      .then(function (report) {
        lastReport = report;
        renderReport(report);
        setStatus("Analisis listo", "");
      })
      .catch(function (error) {
        setStatus("Error DNS", "fail");
        showError(error.message || "No se pudo completar el analisis.");
      })
      .finally(function () {
        setLoading(false);
      });
  }

  async function auditDomain(domain, resolver, selectors) {
    var startedAt = new Date().toISOString();

    var foundation = await Promise.all([
      auditSpf(domain, resolver),
      auditDmarc(domain, resolver),
      auditMx(domain, resolver),
      auditExtras(domain, resolver)
    ]);

    var dkim = await auditDkim(domain, resolver, selectors);

    return {
      domain: domain,
      resolver: resolver,
      checkedAt: startedAt,
      spf: foundation[0],
      dmarc: foundation[1],
      mx: foundation[2],
      extras: foundation[3],
      dkim: dkim,
      score: calculateScore(foundation[0], foundation[1], dkim, foundation[2])
    };
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
    var lookupMechanisms = collectSpfLookups(primary);
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

    if (lookupMechanisms.length > 10) {
      status = "fail";
      findings.push({ status: "fail", text: "La politica supera el limite teorico de 10 consultas DNS de SPF." });
    } else if (lookupMechanisms.length >= 8) {
      status = worstStatus(status, "warn");
      findings.push({ status: "warn", text: "La politica esta cerca del limite de 10 consultas DNS de SPF." });
    }

    if (findings.length === 0) {
      findings.push({ status: "pass", text: "No se detectaron riesgos basicos en la politica SPF." });
    }

    meta.push({ label: "Registros SPF", value: String(spfRecords.length) });
    meta.push({ label: "Consultas SPF", value: String(lookupMechanisms.length) + " / 10" });
    meta.push({ label: "Includes", value: includes.length ? includes.join(", ") : "Ninguno" });

    return {
      title: "SPF",
      status: status,
      message: message,
      findings: findings,
      records: spfRecords,
      meta: meta
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

  async function auditDkim(domain, resolver, selectors) {
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
    var message = "No se encontro DKIM con los selectores probados.";

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

  function isDkimText(text) {
    return /^v=DKIM1(\s*;|$)/i.test(text) || /(^|;)\s*p=/i.test(text);
  }

  function buildSelectorList(mode, customText) {
    var base = mode === "broad" ? BROAD_SELECTORS : QUICK_SELECTORS;
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
      throw new Error("Usa un dominio como empresa.com o sub.empresa.com.");
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
    return Math.round(
      scorePart(spf.status, 25) +
        scorePart(dmarc.status, 35) +
        scorePart(dkim.status, 30) +
        scorePart(mx.status, 10)
    );
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

  function renderReport(report) {
    renderSummary(report);
    renderStandardPanel(els.panels.spf, report.spf);
    renderStandardPanel(els.panels.dmarc, report.dmarc);
    renderDkimPanel(report.dkim);
    renderMxPanel(report.mx);
    renderExtrasPanel(report.extras);
    els.reportActions.hidden = false;
  }

  function renderSummary(report) {
    var cards = [
      { label: "Score", value: report.score + "/100", detail: report.domain, status: scoreStatus(report.score) },
      { label: "SPF", value: statusLabel(report.spf.status), detail: report.spf.message, status: report.spf.status },
      { label: "DMARC", value: statusLabel(report.dmarc.status), detail: report.dmarc.message, status: report.dmarc.status },
      {
        label: "DKIM",
        value: report.dkim.found + "/" + report.dkim.checked,
        detail: report.dkim.message,
        status: report.dkim.status
      },
      { label: "MX", value: statusLabel(report.mx.status), detail: report.mx.message, status: report.mx.status }
    ];

    els.summary.innerHTML = cards
      .map(function (card) {
        return (
          '<article class="summary-card">' +
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
      renderPanelHead(result.title, result.message, result.status) +
      '<div class="panel-body">' +
      renderMeta(result.meta || []) +
      renderFindings(result.findings || []) +
      renderTxtRecords(result.records || []) +
      "</div>";
  }

  function renderMxPanel(result) {
    panelReplace(
      els.panels.mx,
      renderPanelHead(result.title, result.message, result.status) +
        '<div class="panel-body">' +
        renderFindings(result.findings || []) +
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
      renderPanelHead(result.title, result.message, result.status) +
      '<div class="panel-body"><ul class="compact-list">' +
      result.checks
        .map(function (check) {
          return (
            '<li class="compact-item"><span class="status-dot ' +
            check.status +
            '"></span><div><strong>' +
            escapeHtml(check.label) +
            '</strong><div class="muted-text">' +
            escapeHtml(check.message) +
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

  function renderDkimPanel(result) {
    var visible = result.results.filter(function (item) {
      return item.status !== "missing";
    });
    var missingCount = result.results.length - visible.length;

    if (visible.length === 0) {
      visible = result.results.slice(0, Math.min(8, result.results.length));
    }

    els.panels.dkim.innerHTML =
      renderPanelHead(result.title, result.message, result.status) +
      '<div class="panel-body">' +
      '<div class="dkim-toolbar"><strong>' +
      escapeHtml(result.found + " encontrados · " + missingCount + " sin respuesta") +
      '</strong><div class="progress" aria-hidden="true"><span style="--progress: 100%"></span></div></div>' +
      '<ul class="dkim-list">' +
      visible
        .map(function (item) {
          return (
            '<li class="dkim-row">' +
            '<div class="dkim-selector">' +
            escapeHtml(item.selector) +
            '</div><div class="dkim-detail"><strong>' +
            escapeHtml(item.summary) +
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
      renderPanelHead("DKIM", "En progreso.", "info") +
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
          return '<li class="record"><code>' + escapeHtml(note) + "</code></li>";
        })
        .join("") +
      "</ul>"
    );
  }

  function renderPanelHead(title, subtitle, status) {
    return (
      '<div class="panel-head"><div><h2 class="panel-title">' +
      escapeHtml(title) +
      '</h2><p class="panel-subtitle">' +
      escapeHtml(subtitle) +
      '</p></div><span class="badge ' +
      status +
      '">' +
      escapeHtml(statusLabel(status)) +
      "</span></div>"
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
            escapeHtml(item.label) +
            '</div><div class="meta-value">' +
            escapeHtml(item.value) +
            "</div></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderFindings(findings) {
    if (!findings.length) return "";

    return (
      '<ul class="finding-list">' +
      findings
        .map(function (finding) {
          return (
            '<li class="finding"><span class="status-dot ' +
            finding.status +
            '"></span><span>' +
            escapeHtml(finding.text) +
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
    els.reportActions.hidden = true;
    els.summary.innerHTML = "";
    els.panels.spf.innerHTML = '<div class="empty-state">SPF</div>';
    els.panels.dmarc.innerHTML = '<div class="empty-state">DMARC</div>';
    els.panels.dkim.innerHTML = '<div class="empty-state">DKIM</div>';
    els.panels.mx.innerHTML = '<div class="empty-state">MX</div>';
    els.panels.extras.innerHTML = '<div class="empty-state">MTA-STS / TLS-RPT / BIMI</div>';
  }

  function showError(message) {
    clearResults();
    els.panels.spf.innerHTML = '<div class="panel-body"><div class="error-box">' + escapeHtml(message) + "</div></div>";
  }

  function setStatus(text, tone) {
    els.runStatus.textContent = text;
    els.runStatus.className = "status-pill" + (tone ? " " + tone : "");
  }

  function setLoading(isLoading) {
    els.auditButton.disabled = isLoading;
    els.sampleButton.disabled = isLoading;
    els.resolverSelect.disabled = isLoading;
    els.customSelectors.disabled = isLoading;
    Array.from(document.querySelectorAll('input[name="selectorMode"]')).forEach(function (input) {
      input.disabled = isLoading;
    });
  }

  function statusLabel(status) {
    if (status === "pass") return "OK";
    if (status === "warn") return "Aviso";
    if (status === "fail") return "Falla";
    return "Info";
  }

  function scoreStatus(score) {
    if (score >= 85) return "pass";
    if (score >= 60) return "warn";
    return "fail";
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
    return [
      "MailShield Radar",
      "Dominio: " + report.domain,
      "Fecha: " + report.checkedAt,
      "Score: " + report.score + "/100",
      "SPF: " + statusLabel(report.spf.status) + " - " + report.spf.message,
      "DMARC: " + statusLabel(report.dmarc.status) + " - " + report.dmarc.message,
      "DKIM: " + statusLabel(report.dkim.status) + " - " + report.dkim.message,
      "MX: " + statusLabel(report.mx.status) + " - " + report.mx.message
    ].join("\n");
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Resumen copiado", "");
    } catch (error) {
      setStatus("No se pudo copiar", "fail");
    }
  }

  function downloadJson(report) {
    var blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");

    link.href = url;
    link.download = report.domain + "-mail-auth-report.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
})();
