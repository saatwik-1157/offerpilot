/* ============================================================
   OfferPilot — Client Dashboard logic
   Email login (demo) → KPIs, application tracker, resumes,
   onboarding checklist. Reads/writes via window.Store.
   ============================================================ */
(function () {
  "use strict";
  var C = window.OFFERPILOT_CONFIG || {};
  var S = window.Store;

  var els = {
    gate: document.getElementById("gate"),
    app: document.getElementById("app"),
    loginForm: document.getElementById("login-form"),
    email: document.getElementById("login-email")
  };

  function statusPill(s) {
    var map = {
      "Submitted": "pill-submitted", "Viewed": "pill-viewed",
      "Screening Call": "pill-screening", "Interview": "pill-interview",
      "Offer": "pill-offer", "Rejected": "pill-rejected"
    };
    return '<span class="pill dot ' + (map[s] || "pill-submitted") + '">' + s + '</span>';
  }
  function matchChip(n) {
    var cls = n >= 88 ? "match-hi" : n >= 78 ? "match-mid" : "match-lo";
    return '<span class="match-chip ' + cls + '">' + n + '%</span>';
  }
  function badge(co) { return co.replace(/[^A-Za-z]/g, "").slice(0, 2); }
  function planLabel(plan) {
    if (["Starter", "Pro", "Elite"].indexOf(plan) !== -1) return plan + " plan";
    return plan || "OfferPilot Monthly";
  }
  // Relative to the most recent day in the current dataset, so labels stay
  // correct after the ops console runs additional daily cycles.
  var _maxDay = 1;
  function dayLabel(day) {
    var diff = _maxDay - day;
    if (diff <= 0) return "Today";
    if (diff === 1) return "Yesterday";
    return diff + " days ago";
  }

  function render(client) {
    var m = S.metricsFor(client.id);
    var apps = S.getApplications(client.id).slice().sort(function (a, b) { return b.day - a.day || b.matchScore - a.matchScore; });
    _maxDay = apps.reduce(function (mx, a) { return Math.max(mx, a.day); }, 1);

    document.getElementById("welcome").textContent = "Welcome back, " + client.name.split(" ")[0];
    document.getElementById("sub").textContent =
      client.visa + (client.optExpiry ? " · work-auth through " + client.optExpiry : "");
    document.getElementById("plan-badge").textContent = planLabel(client.plan);

    // Empty state for brand-new clients (no applications yet)
    var hasApps = m.total > 0;
    document.getElementById("empty-state").classList.toggle("hidden", hasApps);
    document.getElementById("analytics").classList.toggle("hidden", !hasApps);
    document.getElementById("kanban-panel").classList.toggle("hidden", !hasApps);

    // KPIs
    document.getElementById("kpis").innerHTML = [
      kpi("Applications sent", m.total, "since you joined", true),
      kpi("Responses", m.responded, m.responseRate + "% response rate"),
      kpi("Screening calls", m.screeningCalls, "incl. interviews & offers"),
      kpi("Offers", m.offers, m.offers ? "🎉 nice" : "keep going")
    ].join("");

    // Onboarding checklist
    var onboarded = client.onboarded;
    document.getElementById("checklist").innerHTML = [
      checkItem("Account created & master resume uploaded", true),
      checkItem("Profile reviewed by your specialist", true),
      checkItem("Onboarding strategy call completed", onboarded),
      checkItem("Daily applications live", onboarded)
    ].join("");
    document.getElementById("onboard-panel").classList.toggle("hidden", onboarded && m.total > 0);

    // Application table (filterable by status)
    _apps = apps;
    renderAppTable();

    renderAnalytics(client, apps, m);
    renderKanban(client, apps);
    renderNotifications(client);
    renderReferral(client);
  }

  /* ---------- Application table (with status filter) ---------- */
  var _apps = [];
  function renderAppTable() {
    var filter = (document.getElementById("status-filter") || {}).value || "All";
    var list = filter === "All" ? _apps : _apps.filter(function (a) { return a.status === filter; });
    var rows = list.slice(0, 60).map(function (a) {
      return '<tr>' +
        '<td><div class="co-cell"><div class="co-badge">' + badge(a.company) + '</div>' +
          '<div><div style="font-weight:650">' + a.company + '</div>' +
          '<div class="muted" style="font-size:.82rem">' + a.role + '</div></div></div></td>' +
        '<td class="muted">' + a.location + '</td>' +
        '<td>' + matchChip(a.matchScore) + '</td>' +
        '<td>' + statusPill(a.status) + '</td>' +
        '<td class="muted" style="font-size:.85rem">' + dayLabel(a.day) + '</td>' +
        '<td><button class="btn btn-ghost btn-sm view-resume" data-id="' + a.id + '">Resume</button></td>' +
      '</tr>';
    }).join("");
    var emptyMsg = _apps.length === 0
      ? "No applications yet — your specialist launches your pipeline within 3–7 business days of onboarding."
      : "No applications with status “" + filter + "”.";
    document.getElementById("app-rows").innerHTML = rows ||
      '<tr><td colspan="6" class="muted center" style="padding:40px">' + emptyMsg + '</td></tr>';
    document.getElementById("app-count").textContent =
      (filter === "All" ? _apps.length + " total" : list.length + " of " + _apps.length);

    document.querySelectorAll(".view-resume").forEach(function (b) {
      b.addEventListener("click", function () {
        var app = _apps.filter(function (x) { return x.id === b.dataset.id; })[0];
        if (app) showResume(app);
      });
    });
  }

  /* ---------- Notifications ---------- */
  var _client = null;
  function renderNotifications(client) {
    _client = client;
    var notes = S.getNotifications(client.id);
    var unread = S.unreadCount(client.id);
    var badge = document.getElementById("bell-badge");
    badge.textContent = unread;
    badge.classList.toggle("hidden", unread === 0);
    document.getElementById("notif-list").innerHTML = notes.length ? notes.map(function (n) {
      return '<div class="notif-item notif-' + n.kind + '">' +
        '<div class="notif-ico">' + n.icon + '</div>' +
        '<div class="notif-body"><div class="notif-title">' + n.title + '</div>' +
        '<div class="notif-sub">' + n.sub + ' · ' + dayLabel(n.day) + '</div></div></div>';
    }).join("") : '<div class="muted center" style="padding:28px .5rem">No activity yet — check back after your first applications go out.</div>';
  }

  /* ---------- Referral ---------- */
  function renderReferral(client) {
    var r = S.getReferralStats(client.id);
    document.getElementById("ref-link").value = r.link;
    document.getElementById("ref-code").textContent = r.code;
    document.getElementById("ref-count").textContent = r.referredCount;
    document.getElementById("ref-months").textContent = r.monthsEarned;
  }

  /* ---------- Analytics ---------- */
  function renderAnalytics(client, apps, m) {
    if (!window.Charts) return;
    // Applications per day
    var byDay = {};
    apps.forEach(function (a) { byDay[a.day] = (byDay[a.day] || 0) + 1; });
    var days = Object.keys(byDay).map(Number).sort(function (a, b) { return a - b; });
    var daily = days.map(function (d) { return { label: "D" + d, value: byDay[d] }; });
    document.getElementById("chart-daily").innerHTML = daily.length
      ? window.Charts.line(daily, { h: 190 })
      : emptyChart();

    // Funnel
    var f = m.byStatus;
    var funnel = [
      { label: "Submitted", value: m.total },
      { label: "Viewed", value: f["Viewed"] + f["Screening Call"] + f["Interview"] + f["Offer"] },
      { label: "Screening", value: f["Screening Call"] + f["Interview"] + f["Offer"] },
      { label: "Interview", value: f["Interview"] + f["Offer"] },
      { label: "Offer", value: f["Offer"] }
    ];
    document.getElementById("chart-funnel").innerHTML = m.total ? window.Charts.funnel(funnel) : emptyChart();

    // Top companies
    var byCo = {};
    apps.forEach(function (a) { byCo[a.company] = (byCo[a.company] || 0) + 1; });
    var top = Object.keys(byCo).map(function (k) { return { label: k, value: byCo[k] }; })
      .sort(function (a, b) { return b.value - a.value; }).slice(0, 8);
    document.getElementById("chart-companies").innerHTML = top.length
      ? window.Charts.bar(top, { h: 210, w: 900, showVal: true })
      : emptyChart();
  }
  function emptyChart() {
    return '<div class="muted center" style="padding:40px .5rem">No data yet — applications start after onboarding.</div>';
  }

  /* ---------- Interview kanban ---------- */
  var KANBAN_COLS = ["Screening Call", "Interview", "Offer", "Rejected"];
  var COL_META = {
    "Screening Call": { cls: "pill-screening", label: "Screening" },
    "Interview": { cls: "pill-interview", label: "Interview" },
    "Offer": { cls: "pill-offer", label: "Offer 🎉" },
    "Rejected": { cls: "pill-rejected", label: "Closed" }
  };
  function renderKanban(client, apps) {
    var board = document.getElementById("kanban");
    var inPlay = apps.filter(function (a) { return KANBAN_COLS.indexOf(a.status) !== -1; });
    board.innerHTML = KANBAN_COLS.map(function (col) {
      var cards = inPlay.filter(function (a) { return a.status === col; });
      var meta = COL_META[col];
      var cardHtml = cards.map(function (a) {
        var idx = KANBAN_COLS.indexOf(a.status);
        return '<div class="kcard">' +
          '<div class="co-cell"><div class="co-badge">' + badge(a.company) + '</div>' +
          '<div><div style="font-weight:650;font-size:.9rem">' + a.company + '</div>' +
          '<div class="muted" style="font-size:.78rem">' + a.role + '</div></div></div>' +
          '<div class="kcard-foot">' +
            '<button class="kmove" data-id="' + a.id + '" data-dir="-1"' + (idx <= 0 ? ' disabled' : '') + '>←</button>' +
            '<span class="match-chip ' + (a.matchScore >= 88 ? 'match-hi' : 'match-mid') + '">' + a.matchScore + '%</span>' +
            '<button class="kmove" data-id="' + a.id + '" data-dir="1"' + (idx >= KANBAN_COLS.length - 2 ? ' disabled' : '') + '>→</button>' +
          '</div></div>';
      }).join("") || '<div class="kempty">Nothing here yet</div>';
      return '<div class="kcol">' +
        '<div class="kcol-head"><span class="pill dot ' + meta.cls + '">' + meta.label + '</span><span class="kcount">' + cards.length + '</span></div>' +
        '<div class="kcol-body">' + cardHtml + '</div></div>';
    }).join("");

    board.querySelectorAll(".kmove").forEach(function (b) {
      b.addEventListener("click", function () {
        var app = inPlay.filter(function (x) { return x.id === b.dataset.id; })[0];
        if (!app) return;
        var idx = KANBAN_COLS.indexOf(app.status) + parseInt(b.dataset.dir, 10);
        idx = Math.max(0, Math.min(KANBAN_COLS.length - 1, idx));
        S.updateStatus(app.id, KANBAN_COLS[idx]);
        window.toast("Moved to " + COL_META[KANBAN_COLS[idx]].label);
        render(client);
      });
    });
  }

  function kpi(label, n, sub, accent) {
    return '<div class="kpi' + (accent ? ' accent' : '') + '">' +
      '<div class="l">' + label + '</div><div class="n">' + n + '</div>' +
      '<div class="sub">' + sub + '</div></div>';
  }
  function checkItem(txt, done) {
    return '<div class="check-item' + (done ? ' done' : '') + '">' +
      '<div class="box">' + (done ? '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' : '') + '</div>' +
      '<div class="txt">' + txt + '</div></div>';
  }

  function showResume(app) {
    var r = app.resume;
    var modal = document.getElementById("resume-modal");
    document.getElementById("resume-content").innerHTML =
      '<div class="resume-doc">' +
        '<h3>' + (r.summary.split(" — ")[0]) + '</h3>' +
        '<div class="role">' + r.role + ' · tailored for ' + app.company + ' ' + matchChip(app.matchScore) + '</div>' +
        '<p class="muted" style="font-size:.92rem">' + r.summary + '</p>' +
        '<div class="kw">' + r.keywords.map(function (k) { return '<span>' + k + '</span>'; }).join("") + '</div>' +
        '<div style="font-weight:700;font-size:.85rem;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin:14px 0 6px">Highlights</div>' +
        '<ul>' + r.highlights.map(function (h) { return '<li>' + h + '</li>'; }).join("") + '</ul>' +
      '</div>';
    modal.classList.add("show");
  }

  function boot() {
    var sess = S.getSession();
    if (sess && sess.role === "client") {
      var client = S.getClient(sess.clientId);
      if (client) { showApp(client); return; }
    }
    els.gate.classList.remove("hidden");
  }
  function showApp(client) {
    els.gate.classList.add("hidden");
    els.app.classList.remove("hidden");
    render(client);
  }

  els.loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var client = S.getClientByEmail(els.email.value);
    if (!client) { window.toast("No account for that email — try the demo email or sign up"); return; }
    S.setSession({ role: "client", clientId: client.id });
    showApp(client);
  });

  document.getElementById("use-demo").addEventListener("click", function () {
    els.email.value = C.demoClientEmail || "aarav@student.example";
    els.loginForm.requestSubmit();
  });

  document.getElementById("logout").addEventListener("click", function () {
    S.clearSession(); location.reload();
  });

  // Status filter
  var statusFilter = document.getElementById("status-filter");
  if (statusFilter) statusFilter.addEventListener("change", renderAppTable);

  // Notifications dropdown
  var bell = document.getElementById("bell");
  var panel = document.getElementById("notif-panel");
  bell.addEventListener("click", function (e) {
    e.stopPropagation();
    panel.classList.toggle("open");
  });
  document.addEventListener("click", function (e) {
    if (!panel.contains(e.target) && e.target !== bell) panel.classList.remove("open");
  });
  document.getElementById("notif-read").addEventListener("click", function () {
    if (_client) { S.markAllRead(_client.id); renderNotifications(_client); window.toast("All caught up"); }
  });

  // Referral copy
  document.getElementById("ref-copy").addEventListener("click", function () {
    var input = document.getElementById("ref-link");
    input.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    if (navigator.clipboard) { navigator.clipboard.writeText(input.value).then(function () {}, function () {}); ok = true; }
    window.toast(ok ? "Referral link copied!" : "Copy failed — select and copy manually");
  });

  document.getElementById("resume-close").addEventListener("click", function () {
    document.getElementById("resume-modal").classList.remove("show");
  });
  document.getElementById("resume-modal").addEventListener("click", function (e) {
    if (e.target.id === "resume-modal") e.currentTarget.classList.remove("show");
  });

  boot();
})();
