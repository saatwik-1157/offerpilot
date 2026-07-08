/* ============================================================
   RezForge™ — Mock AI Matching + Resume Engine
   Deterministic (seeded) so demos are reproducible. No network.
   Given a candidate profile + a job, it:
     • scores the match (0–100)
     • generates a role-tailored resume summary + highlight bullets
   And it can synthesize a realistic "daily application cycle".
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Reference data ---------- */
  var COMPANIES = [
    "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix", "Nvidia",
    "Salesforce", "Adobe", "Uber", "Airbnb", "Stripe", "Snowflake", "Databricks",
    "Atlassian", "Oracle", "IBM", "Intel", "Qualcomm", "Cisco", "PayPal",
    "Block", "Coinbase", "DoorDash", "Lyft", "Pinterest", "Reddit", "Dropbox",
    "Twilio", "Datadog", "MongoDB", "Palantir", "ServiceNow", "Workday",
    "Capital One", "JPMorgan", "Goldman Sachs", "Visa", "Mastercard", "Walmart Labs",
    "Roblox", "Unity", "Zoom", "Okta", "Cloudflare", "HashiCorp", "Confluent"
  ];

  var LOCATIONS = [
    "San Francisco, CA", "Seattle, WA", "New York, NY", "Austin, TX",
    "Boston, MA", "Remote (US)", "Sunnyvale, CA", "Chicago, IL",
    "Denver, CO", "Atlanta, GA", "Bellevue, WA", "San Jose, CA"
  ];

  var ROLE_TEMPLATES = {
    "Software Engineer": {
      keywords: ["Java", "Python", "React", "AWS", "SQL", "Microservices", "REST", "Docker"],
      verbs: ["Built", "Shipped", "Scaled", "Optimized", "Automated"],
      objects: [
        "a distributed service handling 12M requests/day",
        "a React dashboard that cut support tickets 30%",
        "CI/CD pipelines reducing deploy time from 40m to 6m",
        "an event-driven pipeline processing 4TB/day"
      ]
    },
    "Data Analyst": {
      keywords: ["SQL", "Python", "Tableau", "Power BI", "Excel", "ETL", "Statistics", "A/B Testing"],
      verbs: ["Analyzed", "Modeled", "Automated", "Forecasted", "Visualized"],
      objects: [
        "a churn model that improved retention 8%",
        "executive dashboards used by 200+ stakeholders",
        "an ETL job cutting reporting time from days to hours",
        "an A/B test framework driving a 5% conversion lift"
      ]
    },
    "Data Scientist": {
      keywords: ["Python", "Machine Learning", "TensorFlow", "PyTorch", "SQL", "NLP", "Statistics", "Spark"],
      verbs: ["Trained", "Deployed", "Engineered", "Researched", "Productionized"],
      objects: [
        "a demand-forecasting model reducing waste 15%",
        "an NLP classifier at 94% F1 in production",
        "a recommendation engine lifting CTR 11%",
        "feature pipelines on Spark over 1B+ rows"
      ]
    },
    "Product Manager": {
      keywords: ["Roadmapping", "SQL", "A/B Testing", "Figma", "Agile", "Analytics", "Stakeholder Mgmt"],
      verbs: ["Launched", "Drove", "Defined", "Prioritized", "Grew"],
      objects: [
        "a 0→1 feature reaching 100k MAU in 6 months",
        "a roadmap that grew activation 22%",
        "cross-functional delivery across 4 teams",
        "pricing experiments adding $1.2M ARR"
      ]
    },
    "DevOps Engineer": {
      keywords: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Docker", "Linux", "Python", "Monitoring"],
      verbs: ["Automated", "Migrated", "Hardened", "Provisioned", "Reduced"],
      objects: [
        "infra-as-code cutting provisioning from days to minutes",
        "a Kubernetes migration improving uptime to 99.98%",
        "cloud spend by 34% via right-sizing",
        "observability with alerting that halved MTTR"
      ]
    },
    "Business Analyst": {
      keywords: ["SQL", "Excel", "Tableau", "Requirements", "Process Mapping", "Stakeholder Mgmt", "JIRA"],
      verbs: ["Mapped", "Streamlined", "Documented", "Quantified", "Aligned"],
      objects: [
        "a process redesign saving 300 hours/quarter",
        "requirements for a $2M platform migration",
        "KPIs adopted org-wide across 5 departments",
        "a reporting suite replacing manual spreadsheets"
      ]
    }
  };

  var ROLE_SUFFIX = ["", " I", " II", " (New Grad)", ", Associate", ", Early Career"];

  /* ---------- Seeded pseudo-random (deterministic) ---------- */
  function rng(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }
  function hash(str) {
    var h = 5381, i = str.length;
    while (i) h = (h * 33) ^ str.charCodeAt(--i);
    return h >>> 0;
  }
  function pick(arr, r) { return arr[Math.floor(r() * arr.length)]; }

  /* ---------- Match scoring ---------- */
  // Overlap between candidate skills and role keywords, plus a small
  // seeded jitter so scores look organic. Range ~62–98.
  function scoreMatch(profile, role, seedStr) {
    var tmpl = ROLE_TEMPLATES[role] || ROLE_TEMPLATES["Software Engineer"];
    var skills = (profile.skills || []).map(function (s) { return s.toLowerCase(); });
    var hits = 0;
    tmpl.keywords.forEach(function (k) {
      if (skills.indexOf(k.toLowerCase()) !== -1) hits++;
    });
    var base = 62 + Math.round((hits / tmpl.keywords.length) * 30);
    var r = rng(hash(seedStr));
    var jitter = Math.round((r() - 0.4) * 10);
    return Math.max(58, Math.min(98, base + jitter));
  }

  /* ---------- Resume generation ---------- */
  function generateResume(profile, job) {
    var tmpl = ROLE_TEMPLATES[job.role] || ROLE_TEMPLATES["Software Engineer"];
    var r = rng(hash(job.company + job.role + (profile.name || "")));
    var focusSkills = tmpl.keywords.slice(0, 4).join(", ");

    var summary =
      (profile.name ? profile.name.split(" ")[0] + " — " : "") +
      job.role + " candidate targeting " + job.company +
      ". F-1/OPT authorized. Strengths tailored to this role: " + focusSkills + ".";

    var highlights = [];
    for (var i = 0; i < 3; i++) {
      highlights.push(pick(tmpl.verbs, r) + " " + pick(tmpl.objects, r) + ".");
    }
    // Dedupe
    highlights = highlights.filter(function (v, i, a) { return a.indexOf(v) === i; });
    while (highlights.length < 3) {
      highlights.push(pick(tmpl.verbs, r) + " " + pick(tmpl.objects, r) + ".");
      highlights = highlights.filter(function (v, i, a) { return a.indexOf(v) === i; });
    }

    return {
      role: job.role,
      company: job.company,
      keywords: tmpl.keywords.slice(0, 6),
      summary: summary,
      highlights: highlights
    };
  }

  /* ---------- Daily application cycle ---------- */
  // Synthesizes 25–35 tailored applications for a candidate.
  function runDailyCycle(profile, dayIndex) {
    var seedBase = hash((profile.email || profile.name || "demo") + "#" + dayIndex);
    var r = rng(seedBase);
    var count = 25 + Math.floor(r() * 11); // 25–35
    var roles = (profile.targetRoles && profile.targetRoles.length)
      ? profile.targetRoles : ["Software Engineer"];
    var apps = [];
    for (var i = 0; i < count; i++) {
      var company = pick(COMPANIES, r);
      var role = pick(roles, r) + pick(ROLE_SUFFIX, r);
      var baseRole = role.split(/ I| II| \(| ,|,/)[0].trim();
      var seedStr = company + baseRole + i + dayIndex;
      var job = {
        company: company,
        role: role,
        baseRole: baseRole,
        location: pick(LOCATIONS, r)
      };
      apps.push({
        company: company,
        role: role,
        location: job.location,
        matchScore: scoreMatch(profile, baseRole, seedStr),
        resume: generateResume(profile, { company: company, role: baseRole })
      });
    }
    // Highest-match first (that's the pitch: "carefully selected")
    apps.sort(function (a, b) { return b.matchScore - a.matchScore; });
    return apps;
  }

  /* ---------- Live resume tailoring (real Claude via proxy) ----------
     Calls the RezForge server (server/rezforge-server.mjs) when
     config.rezforgeEndpoint is set; otherwise returns the deterministic
     mock. Always resolves — falls back to the mock on any error so the
     dashboard never breaks. */
  function generateResumeLive(profile, job) {
    var cfg = window.OFFERPILOT_CONFIG || {};
    var mock = function () { return generateResume(profile, job); };
    if (!cfg.rezforgeEndpoint) {
      return Promise.resolve(Object.assign(mock(), { live: false }));
    }
    return fetch(cfg.rezforgeEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: profile, job: job })
    }).then(function (r) {
      if (!r.ok) throw new Error("status " + r.status);
      return r.json();
    }).then(function (data) {
      if (!data || !data.summary) throw new Error("bad payload");
      return {
        role: job.role,
        company: job.company,
        summary: data.summary,
        highlights: data.highlights || [],
        keywords: data.keywords || [],
        live: true
      };
    }).catch(function () {
      return Object.assign(mock(), { live: false });
    });
  }

  /* ---------- Company logos ---------- */
  var COMPANY_DOMAINS = {
    "Google": "google.com", "Amazon": "amazon.com", "Microsoft": "microsoft.com", "Meta": "meta.com",
    "Apple": "apple.com", "Netflix": "netflix.com", "Nvidia": "nvidia.com", "Salesforce": "salesforce.com",
    "Adobe": "adobe.com", "Uber": "uber.com", "Airbnb": "airbnb.com", "Stripe": "stripe.com",
    "Snowflake": "snowflake.com", "Databricks": "databricks.com", "Atlassian": "atlassian.com", "Oracle": "oracle.com",
    "IBM": "ibm.com", "Intel": "intel.com", "Qualcomm": "qualcomm.com", "Cisco": "cisco.com", "PayPal": "paypal.com",
    "Block": "block.xyz", "Coinbase": "coinbase.com", "DoorDash": "doordash.com", "Lyft": "lyft.com",
    "Pinterest": "pinterest.com", "Reddit": "reddit.com", "Dropbox": "dropbox.com", "Twilio": "twilio.com",
    "Datadog": "datadoghq.com", "MongoDB": "mongodb.com", "Palantir": "palantir.com", "ServiceNow": "servicenow.com",
    "Workday": "workday.com", "Capital One": "capitalone.com", "JPMorgan": "jpmorganchase.com",
    "Goldman Sachs": "goldmansachs.com", "Visa": "visa.com", "Mastercard": "mastercard.com",
    "Walmart Labs": "walmart.com", "Roblox": "roblox.com", "Unity": "unity.com", "Zoom": "zoom.us",
    "Okta": "okta.com", "Cloudflare": "cloudflare.com", "HashiCorp": "hashicorp.com", "Confluent": "confluent.io"
  };
  function domainFor(company) {
    return COMPANY_DOMAINS[company] || (String(company).toLowerCase().replace(/[^a-z0-9]/g, "") + ".com");
  }
  function monogram(company) { return String(company).replace(/[^A-Za-z]/g, "").slice(0, 2); }
  function logoUrl(company) {
    return "https://www.google.com/s2/favicons?domain=" + domainFor(company) + "&sz=64";
  }
  // Inner markup for a .co-badge: monogram underneath, logo image on top.
  // If the logo fails to load (offline, missing), the img hides and the
  // monogram shows through — so badges always render something sensible.
  function badgeInner(company) {
    return '<span class="mono">' + monogram(company) + '</span>' +
      '<img class="co-logo" src="' + logoUrl(company) + '" alt="" loading="lazy" ' +
      'onerror="this.style.display=\'none\'">';
  }
  window.Brand = {
    domainFor: domainFor,
    monogram: monogram,
    logoUrl: logoUrl,
    badgeInner: badgeInner
  };

  window.RezForge = {
    COMPANIES: COMPANIES,
    ROLES: Object.keys(ROLE_TEMPLATES),
    LOCATIONS: LOCATIONS,
    scoreMatch: scoreMatch,
    generateResume: generateResume,
    generateResumeLive: generateResumeLive,
    runDailyCycle: runDailyCycle
  };
})();
