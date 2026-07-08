/* ============================================================
   OfferPilot — Admin / Ops console
   Passcode gate → client roster, run the daily application
   cycle, update application statuses, view aggregate metrics.
   ============================================================ */
(function () {
  "use strict";
  var C = window.OFFERPILOT_CONFIG || {};
  var S = window.Store;
  var selectedId = null;

  var gate = document.getElementById("gate");
  var app = document.getElementById("app");

  function statusPill(s) {
    var map = { "Submitted": "pill-submitted", "Viewed": "pill-viewed", "Screening Call": "pill-screening", "Interview": "pill-interview", "Offer": "pill-offer", "Rejected": "pill-rejected" };
    return '<span class="pill dot ' + (map[s] || "pill-submitted") + '">' + s + '</span>';
  }
  function badge(co) { return co.replace(/[^A-Za-z]/g, "").slice(0, 2); }

  function renderRoster() {
    var clients = S.getClients();
    var apps = S.getApplications();
    document.getElementById("stat-clients").textContent = clients.length;
    document.getElementById("stat-active").textContent = clients.filter(function (c) { return c.status === "Active"; }).length;
    document.getElementById("stat-apps").textContent = apps.length;
    var calls = apps.filter(function (a) { return ["Screening Call", "Interview", "Offer"].indexOf(a.status) !== -1; }).length;
    document.getElementById("stat-calls").textContent = calls;

    document.getElementById("roster").innerHTML = clients.map(function (c) {
      var m = S.metricsFor(c.id);
      var sel = c.id === selectedId ? ' style="background:var(--indigo-soft)"' : '';
      return '<tr class="client-row" data-id="' + c.id + '"' + sel + '>' +
        '<td><div class="co-cell"><div class="co-badge">' + badge(c.name) + '</div><div>' +
          '<div style="font-weight:650">' + c.name + '</div><div class="muted" style="font-size:.8rem">' + c.email + '</div></div></div></td>' +
        '<td class="muted">' + c.visa + '</td>' +
        '<td>' + (c.status === "Active" ? '<span class="pill pill-offer dot">Active</span>' : '<span class="pill pill-screening dot">Onboarding</span>') + '</td>' +
        '<td style="font-weight:700">' + m.total + '</td>' +
        '<td style="font-weight:700;color:var(--emerald-dark)">' + m.screeningCalls + '</td>' +
        '<td><button class="btn btn-ghost btn-sm run-cycle" data-id="' + c.id + '">Run daily cycle</button></td>' +
      '</tr>';
    }).join("");

    document.querySelectorAll(".client-row").forEach(function (r) {
      r.addEventListener("click", function (e) {
        if (e.target.closest(".run-cycle")) return;
        selectedId = r.dataset.id; renderRoster(); renderDetail();
      });
    });
    document.querySelectorAll(".run-cycle").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var n = S.runCycleForClient(b.dataset.id);
        window.toast("Ran daily cycle — " + n + " applications submitted");
        if (!selectedId) selectedId = b.dataset.id;
        renderRoster(); renderDetail();
      });
    });
  }

  function renderDetail() {
    var panel = document.getElementById("detail");
    if (!selectedId) { panel.classList.add("hidden"); return; }
    panel.classList.remove("hidden");
    var c = S.getClient(selectedId);
    var m = S.metricsFor(selectedId);
    var apps = S.getApplications(selectedId).slice().sort(function (a, b) { return b.day - a.day || b.matchScore - a.matchScore; });

    document.getElementById("detail-name").textContent = c.name;
    document.getElementById("detail-meta").textContent =
      c.university + " · " + c.location + " · targets: " + c.targetRoles.join(", ");
    document.getElementById("detail-kpis").innerHTML =
      '<div class="kpi k-indigo"><div class="l">Applications</div><div class="n">' + m.total + '</div><div class="sub">lifetime</div></div>' +
      '<div class="kpi k-sky"><div class="l">Responses</div><div class="n">' + m.responded + '</div><div class="sub">' + m.responseRate + '% rate</div></div>' +
      '<div class="kpi k-amber"><div class="l">Screening calls</div><div class="n">' + m.screeningCalls + '</div><div class="sub">incl. interviews</div></div>' +
      '<div class="kpi k-emerald"><div class="l">Offers</div><div class="n">' + m.offers + '</div><div class="sub">closed</div></div>';

    document.getElementById("detail-rows").innerHTML = apps.slice(0, 40).map(function (a) {
      var opts = S.STATUSES.map(function (s) {
        return '<option' + (s === a.status ? ' selected' : '') + '>' + s + '</option>';
      }).join("");
      return '<tr>' +
        '<td><div class="co-cell"><div class="co-badge">' + window.Brand.badgeInner(a.company) + '</div><div>' +
          '<div style="font-weight:650">' + a.company + '</div><div class="muted" style="font-size:.8rem">' + a.role + '</div></div></div></td>' +
        '<td><span class="match-chip ' + (a.matchScore >= 88 ? 'match-hi' : a.matchScore >= 78 ? 'match-mid' : 'match-lo') + '">' + a.matchScore + '%</span></td>' +
        '<td>' + statusPill(a.status) + '</td>' +
        '<td><select class="mini set-status" data-id="' + a.id + '">' + opts + '</select></td>' +
      '</tr>';
    }).join("");

    document.querySelectorAll(".set-status").forEach(function (sel) {
      sel.addEventListener("change", function () {
        S.updateStatus(sel.dataset.id, sel.value);
        window.toast("Status updated");
        renderRoster(); renderDetail();
      });
    });
  }

  // Gate
  document.getElementById("gate-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var val = document.getElementById("passcode").value.trim();
    if (val === (C.adminPasscode || "offerpilot")) {
      S.setSession({ role: "admin" });
      gate.classList.add("hidden"); app.classList.remove("hidden");
      renderRoster();
    } else { window.toast("Incorrect passcode"); }
  });

  document.getElementById("logout").addEventListener("click", function () {
    S.clearSession(); location.reload();
  });
  document.getElementById("reset-data").addEventListener("click", function () {
    S.reset(); selectedId = null; window.toast("Demo data reset"); renderRoster(); renderDetail();
  });
  document.getElementById("run-all").addEventListener("click", function () {
    var total = 0;
    S.getClients().forEach(function (c) { total += S.runCycleForClient(c.id); });
    window.toast("Ran cycle for all clients — " + total + " applications");
    renderRoster(); renderDetail();
  });

  // Auto-enter if already admin
  var sess = S.getSession();
  if (sess && sess.role === "admin") {
    gate.classList.add("hidden"); app.classList.remove("hidden"); renderRoster();
  }
})();
