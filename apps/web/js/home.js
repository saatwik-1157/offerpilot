/* ============================================================
   OfferPilot — Home page widgets
   • Simulated live dashboard ([data-demo-dashboard])
   • Contact form (#contact-form): sends via the forms integration
     when a key is set in config.js, otherwise opens an email draft.
   ============================================================ */
(function () {
  "use strict";
  var C = window.OFFERPILOT_CONFIG || {};

  /* ---------------- Simulated dashboard ---------------- */
  var COMPANIES = [
    ["Google", "Software Engineer II"], ["Stripe", "Backend Engineer"], ["Snowflake", "Data Engineer"],
    ["Databricks", "Software Engineer"], ["Adobe", "Frontend Engineer"], ["Uber", "Data Scientist"],
    ["Salesforce", "Product Analyst"], ["Nvidia", "ML Engineer"], ["Microsoft", "SDE"], ["Meta", "Data Engineer"],
    ["Amazon", "SDE, Early Career"], ["Apple", "Software Engineer"]
  ];
  var STAGES = [
    { label: "Submitted", cls: "s-sub" }, { label: "Viewed", cls: "s-view" },
    { label: "Screening", cls: "s-screen" }, { label: "Interview", cls: "s-int" }, { label: "Offer", cls: "s-offer" }
  ];

  function demo(root) {
    var feed = root.querySelector(".demo-feed"), chart = root.querySelector(".demo-chart");
    var k = {}; root.querySelectorAll("[data-k]").forEach(function (el) { k[el.dataset.k] = el; });
    var totals = { apps: 0, resp: 0, calls: 0, offers: 0 };
    var bars = [];
    for (var i = 0; i < 14; i++) {
      var b = document.createElement("span");
      b.style.height = "4%";
      chart.appendChild(b); bars.push(b);
    }
    var reduced = false;
    try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    var n = 0, timer = null;

    function set(key, v) { totals[key] = v; k[key].textContent = v.toLocaleString("en-US"); }
    function tick() {
      n++;
      var co = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
      var li = document.createElement("li");
      var match = 84 + Math.floor(Math.random() * 14);
      li.innerHTML = '<span class="co">' + co[0] + '</span><span class="ro">' + co[1] + '</span>' +
        '<span class="mt">' + match + '%</span><span class="st s-sub">Submitted</span>';
      feed.prepend(li);
      while (feed.children.length > 6) feed.lastElementChild.remove();
      set("apps", totals.apps + 1);
      // Advance some earlier rows along the funnel.
      Array.prototype.forEach.call(feed.children, function (row, idx) {
        if (idx === 0 || Math.random() > 0.35) return;
        var st = row.querySelector(".st");
        var cur = STAGES.findIndex(function (s) { return st.classList.contains(s.cls); });
        if (cur < 0 || cur >= STAGES.length - 1) return;
        if (cur >= 2 && Math.random() > 0.4) return;           // later stages are rarer
        var next = STAGES[cur + 1];
        st.className = "st " + next.cls; st.textContent = next.label;
        row.classList.remove("bump"); void row.offsetWidth; row.classList.add("bump");
        if (cur === 0) set("resp", totals.resp + 1);
        if (next.label === "Screening") set("calls", totals.calls + 1);
        if (next.label === "Offer") set("offers", totals.offers + 1);
      });
      // Daily bars: shift left, newest on the right.
      var last = bars.shift(); chart.appendChild(last); bars.push(last);
      bars.forEach(function (b, idx) {
        if (idx === bars.length - 1) b.style.height = (45 + Math.random() * 55).toFixed(0) + "%";
      });
    }
    function start() {
      if (timer) return;
      if (reduced) { for (var j = 0; j < 14; j++) tick(); return; }
      timer = setInterval(tick, 1300);
    }
    function stop() { clearInterval(timer); timer = null; }

    // Seed so it never looks empty, then run only while visible.
    for (var s = 0; s < 14; s++) tick();
    set("apps", 128); set("resp", 41); set("calls", 9); set("offers", 1);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { if (e[0].isIntersecting) start(); else stop(); }).observe(root);
    } else start();
  }

  /* ---------------- Contact form ---------------- */
  function contact(form) {
    var status = document.getElementById("contact-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), email = form.email.value.trim(), msg = form.message.value.trim();
      if (!name || !msg) { status.textContent = "Please add your name and a message."; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = "Please enter a valid email address."; form.email.focus(); return; }
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true; status.textContent = "Sending…";
      var payload = { source: "contact", topic: form.topic.value, subject: "[" + form.topic.value + "] Message from " + name, name: name, email: email, message: msg };
      (window.Cloud ? window.Cloud.sendMessage(payload) : Promise.resolve({ demo: true })).then(function (r) {
        btn.disabled = false;
        if (r && r.demo) {
          // No form key yet: open the visitor's email app with everything filled in.
          location.href = "mailto:" + (C.email || "") + "?subject=" + encodeURIComponent(payload.subject) +
            "&body=" + encodeURIComponent(msg + "\n\n— " + name + " (" + email + ")");
          status.textContent = "Your email app is opening with the message ready to send.";
        } else if (r && r.error) {
          status.textContent = "That didn't send. Please email " + (C.email || "us") + " directly.";
        } else {
          status.textContent = "✓ Thanks " + name + ", we'll reply to " + email + " within one business day.";
          form.reset();
          if (window.toast) window.toast("Message sent");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-demo-dashboard]").forEach(demo);
    var f = document.getElementById("contact-form");
    if (f) contact(f);
    var hours = document.getElementById("contact-hours");
    if (hours && C.contactHours) hours.textContent = C.contactHours;
    var chatBtn = document.getElementById("contact-chat");
    if (chatBtn) chatBtn.addEventListener("click", function () { if (window.OfferPilotChat) window.OfferPilotChat.open(); });
  });
})();
