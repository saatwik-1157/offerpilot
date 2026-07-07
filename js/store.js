/* ============================================================
   OfferPilot — Data Store (localStorage "demo mode" backend)
   One namespaced key holds the whole world: clients + applications.
   Swap these functions for Supabase/REST calls to go live.
   ============================================================ */
(function () {
  "use strict";
  var KEY = "offerpilot.db.v1";
  var SESSION = "offerpilot.session.v1";

  var STATUSES = [
    "Submitted", "Viewed", "Screening Call", "Interview", "Offer", "Rejected"
  ];

  /* ---------- Seed data ---------- */
  function seed() {
    var clients = [
      {
        id: "c1",
        name: "Aarav Mehta",
        email: "aarav@student.example",
        university: "Arizona State University",
        visa: "F-1 STEM OPT",
        optExpiry: "2026-11-14",
        location: "Tempe, AZ",
        targetRoles: ["Software Engineer", "DevOps Engineer"],
        skills: ["Java", "Python", "React", "AWS", "Docker", "SQL", "Kubernetes", "CI/CD"],
        plan: "OfferPilot Monthly",
        status: "Active",
        joined: "2026-05-02",
        onboarded: true
      },
      {
        id: "c2",
        name: "Sofia Reyes",
        email: "sofia@student.example",
        university: "University of Texas at Dallas",
        visa: "F-1 OPT",
        optExpiry: "2026-09-30",
        location: "Dallas, TX",
        targetRoles: ["Data Analyst", "Business Analyst"],
        skills: ["SQL", "Python", "Tableau", "Power BI", "Excel", "ETL", "Statistics"],
        plan: "OfferPilot Monthly",
        status: "Active",
        joined: "2026-05-20",
        onboarded: true
      },
      {
        id: "c3",
        name: "Wei Chen",
        email: "wei@student.example",
        university: "Carnegie Mellon University",
        visa: "F-1 STEM OPT",
        optExpiry: "2027-02-01",
        location: "Pittsburgh, PA",
        targetRoles: ["Data Scientist", "Software Engineer"],
        skills: ["Python", "Machine Learning", "PyTorch", "SQL", "NLP", "Spark", "TensorFlow"],
        plan: "OfferPilot Monthly",
        status: "Onboarding",
        joined: "2026-07-01",
        onboarded: false
      }
    ];

    clients.forEach(function (c) { c.referralCode = genCode(c.name); });

    var db = { clients: clients, applications: [], lastDay: 0, referrals: [] };

    // A couple of seeded referrals so the referral card isn't empty in the demo.
    db.referrals.push({ code: clients[0].referralCode, name: "Priya S.", joined: "2026-06-11" });
    db.referrals.push({ code: clients[0].referralCode, name: "Kenji T.", joined: "2026-06-28" });

    // Pre-generate a few days of history for onboarded clients so the
    // dashboard looks alive on first load.
    clients.forEach(function (c) {
      if (!c.onboarded) return;
      for (var d = 1; d <= 6; d++) {
        var apps = window.RezForge.runDailyCycle(c, d);
        apps.forEach(function (a, idx) {
          db.applications.push(buildApp(c, a, d, idx));
        });
      }
    });
    db.lastDay = 6;
    save(db);
    return db;
  }

  var appCounter = 0;
  function buildApp(client, a, day, idx) {
    // Distribute statuses realistically: most Submitted/Viewed, some progress.
    var roll = (a.matchScore + idx * 7 + day * 13) % 100;
    var status = "Submitted";
    if (roll > 92) status = "Screening Call";
    else if (roll > 86) status = "Interview";
    else if (roll > 84) status = "Offer";
    else if (roll > 70) status = "Viewed";
    else if (roll > 62 && roll < 66) status = "Rejected";

    return {
      id: "a" + (++appCounter) + "_" + client.id + "_" + day + "_" + idx,
      clientId: client.id,
      company: a.company,
      role: a.role,
      location: a.location,
      matchScore: a.matchScore,
      status: status,
      day: day,
      dateOffset: day, // days ago-ish, resolved to label in UI
      resume: a.resume
    };
  }

  /* ---------- Persistence ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return seed();
      return JSON.parse(raw);
    } catch (e) { return seed(); }
  }
  function save(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
  }
  function reset() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(SESSION);
    localStorage.removeItem(READS);
    appCounter = 0;
    return seed();
  }

  /* ---------- Queries ---------- */
  function getClients() { return load().clients; }
  function getClient(id) {
    return load().clients.filter(function (c) { return c.id === id; })[0] || null;
  }
  function getClientByEmail(email) {
    email = (email || "").trim().toLowerCase();
    return load().clients.filter(function (c) {
      return c.email.toLowerCase() === email;
    })[0] || null;
  }
  function getApplications(clientId) {
    var apps = load().applications;
    return clientId ? apps.filter(function (a) { return a.clientId === clientId; }) : apps;
  }

  function metricsFor(clientId) {
    var apps = getApplications(clientId);
    var by = {};
    STATUSES.forEach(function (s) { by[s] = 0; });
    apps.forEach(function (a) { by[a.status] = (by[a.status] || 0) + 1; });
    var responded = by["Viewed"] + by["Screening Call"] + by["Interview"] + by["Offer"] + by["Rejected"];
    var positive = by["Screening Call"] + by["Interview"] + by["Offer"];
    return {
      total: apps.length,
      byStatus: by,
      responded: responded,
      screeningCalls: by["Screening Call"] + by["Interview"] + by["Offer"],
      interviews: by["Interview"] + by["Offer"],
      offers: by["Offer"],
      responseRate: apps.length ? Math.round((responded / apps.length) * 100) : 0,
      positiveRate: apps.length ? Math.round((positive / apps.length) * 100) : 0
    };
  }

  /* ---------- Mutations ---------- */
  function addClient(data) {
    var db = load();
    var id = "c" + (db.clients.length + 1) + "_" + Math.abs(hashStr(data.email || data.name));
    var client = {
      id: id,
      name: data.name || "New Client",
      email: data.email || "",
      university: data.university || "",
      visa: data.visa || "F-1 OPT",
      optExpiry: data.optExpiry || "",
      location: data.location || "",
      targetRoles: data.targetRoles && data.targetRoles.length ? data.targetRoles : ["Software Engineer"],
      skills: data.skills && data.skills.length ? data.skills : ["Python", "SQL"],
      plan: data.plan || "OfferPilot Monthly",
      status: "Onboarding",
      joined: data.joined || "2026-07-07",
      onboarded: false,
      referralCode: genCode((data.name || "New Client") + (data.email || "")),
      referredBy: data.ref || null
    };
    db.clients.push(client);
    // Credit the referrer, if the code is valid.
    if (data.ref) {
      var referrer = db.clients.filter(function (c) { return c.referralCode === data.ref; })[0];
      if (referrer) db.referrals.push({ code: data.ref, name: client.name, joined: client.joined });
    }
    save(db);
    return client;
  }

  function genCode(name) {
    var base = (name.split(" ")[0] || "PILOT").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) || "PILOT";
    var n = (Math.abs(hashStr(name)) % 9000) + 1000;
    return base + "-" + n;
  }

  /* ---------- Notifications (synthesized from application events) ---------- */
  var READS = "offerpilot.reads.v1";
  function readSet(clientId) {
    try { return (JSON.parse(localStorage.getItem(READS)) || {})[clientId] || []; }
    catch (e) { return []; }
  }
  function getNotifications(clientId) {
    var apps = getApplications(clientId);
    var rank = { "Offer": 4, "Interview": 3, "Screening Call": 2, "Viewed": 1 };
    var events = [];
    apps.forEach(function (a) {
      var kind = null, icon = "", title = "", sub = a.role;
      if (a.status === "Offer") { kind = "offer"; icon = "🎉"; title = "Offer from " + a.company + "!"; }
      else if (a.status === "Interview") { kind = "interview"; icon = "🎯"; title = "Interview scheduled — " + a.company; }
      else if (a.status === "Screening Call") { kind = "call"; icon = "📞"; title = "Screening call — " + a.company; }
      else if (a.status === "Viewed") { kind = "viewed"; icon = "👀"; title = a.company + " viewed your application"; }
      if (kind) events.push({ id: a.id + ":" + a.status, kind: kind, icon: icon, title: title, sub: sub, day: a.day, r: rank[a.status] });
    });
    events.sort(function (x, y) { return y.day - x.day || y.r - x.r; });
    return events.slice(0, 20);
  }
  function unreadCount(clientId) {
    var read = readSet(clientId);
    return getNotifications(clientId).filter(function (n) { return read.indexOf(n.id) === -1; }).length;
  }
  function markAllRead(clientId) {
    var all;
    try { all = JSON.parse(localStorage.getItem(READS)) || {}; } catch (e) { all = {}; }
    all[clientId] = getNotifications(clientId).map(function (n) { return n.id; });
    localStorage.setItem(READS, JSON.stringify(all));
  }
  function isRead(clientId, id) { return readSet(clientId).indexOf(id) !== -1; }

  /* ---------- Referrals ---------- */
  function getReferralStats(clientId) {
    var db = load();
    var c = getClient(clientId);
    var mine = db.referrals.filter(function (r) { return r.code === c.referralCode; });
    var base = (window.OFFERPILOT_CONFIG && window.OFFERPILOT_CONFIG.siteUrl) || "";
    return {
      code: c.referralCode,
      link: (base || "https://offerpilot.example") + "/signup.html?ref=" + c.referralCode,
      referred: mine,
      referredCount: mine.length,
      monthsEarned: mine.length
    };
  }

  function markOnboarded(clientId) {
    var db = load();
    db.clients.forEach(function (c) {
      if (c.id === clientId) { c.onboarded = true; c.status = "Active"; }
    });
    save(db);
  }

  function runCycleForClient(clientId) {
    var db = load();
    var client = db.clients.filter(function (c) { return c.id === clientId; })[0];
    if (!client) return 0;
    var day = (db.lastDay || 0) + 1;
    var apps = window.RezForge.runDailyCycle(client, day);
    var startCount = db.applications.length;
    apps.forEach(function (a, idx) {
      db.applications.unshift(buildApp(client, a, day, idx));
    });
    db.lastDay = day;
    if (!client.onboarded) { client.onboarded = true; client.status = "Active"; }
    save(db);
    return db.applications.length - startCount;
  }

  function updateStatus(appId, status) {
    var db = load();
    db.applications.forEach(function (a) {
      if (a.id === appId) a.status = status;
    });
    save(db);
  }

  function hashStr(str) {
    var h = 0; str = str || "";
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return h;
  }

  /* ---------- Sessions ---------- */
  function setSession(obj) { localStorage.setItem(SESSION, JSON.stringify(obj)); }
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION)); } catch (e) { return null; }
  }
  function clearSession() { localStorage.removeItem(SESSION); }

  window.Store = {
    STATUSES: STATUSES,
    getClients: getClients,
    getClient: getClient,
    getClientByEmail: getClientByEmail,
    getApplications: getApplications,
    metricsFor: metricsFor,
    addClient: addClient,
    markOnboarded: markOnboarded,
    runCycleForClient: runCycleForClient,
    updateStatus: updateStatus,
    getNotifications: getNotifications,
    unreadCount: unreadCount,
    markAllRead: markAllRead,
    getReferralStats: getReferralStats,
    reset: reset,
    setSession: setSession,
    getSession: getSession,
    clearSession: clearSession
  };
})();
