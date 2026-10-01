/* ============================================================
   OfferPilot — Help chat bubble
   A self-contained assistant that answers the common questions
   from the FAQ/pricing data instantly (no network, no keys).
   Anything it can't answer is handed to a human: it opens the
   contact form (or an email draft) with the conversation attached.
   ============================================================ */
(function () {
  "use strict";
  var C = window.OFFERPILOT_CONFIG || {};
  var plans = C.plans || {};
  var email = C.email || "hello@offerpilot.example";

  function planLine() {
    return Object.keys(plans).map(function (n) {
      return n + " $" + plans[n].monthly + "/mo (" + plans[n].perDay + ")";
    }).join(" · ");
  }

  // Ordered: first rule whose keywords match wins.
  var RULES = [
    { k: ["price", "cost", "how much", "plan", "pricing", "fee", "expensive", "cheap"],
      a: function () { return "Plans: " + planLine() + ". Annual billing gives 2 months free, and there's never a cut of your salary. Code " + (C.featuredPromo || "LAUNCH50") + " takes 50% off your first month."; },
      chips: ["Apply a promo code", "What's included in Pro?"] },
    { k: ["promo", "code", "discount", "coupon", "offer", "deal"],
      a: function () { return "Use " + (C.featuredPromo || "LAUNCH50") + " at checkout for 50% off month one. It's applied automatically if you click below."; },
      link: { href: "signup.html?plan=Pro&promo=" + (C.featuredPromo || "LAUNCH50"), label: "Claim 50% off →" } },
    { k: ["pro", "included", "include", "elite", "starter", "difference"],
      a: function () { return "Starter: 15 tailored applications a day. Pro: 25–35 a day, a dedicated specialist and visa-aware targeting. Elite: everything in Pro plus a priority queue, LinkedIn optimization and 2 mock interviews a month."; },
      link: { href: "index.html#pricing", label: "Compare plans →" } },
    { k: ["legal", "allowed", "opt", "f-1", "f1", "visa", "status", "stem"],
      a: function () { return "Yes. You're the applicant on every application; we prepare and submit on your behalf, like an assistant would. We're not immigration advisors, so check status questions with your DSO. The free Runway tool shows how many unemployment days you have left."; },
      link: { href: "runway.html", label: "Open the Runway tool →" } },
    { k: ["refund", "cancel", "money back", "unsubscribe"],
      a: function () { return "Cancel any time from your dashboard and we refund the unused days of your billing period. If we can't serve your profile before we start, you get a full refund."; },
      link: { href: "legal.html#refund", label: "Refund policy →" } },
    { k: ["how", "work", "start", "process", "steps", "onboard"],
      a: function () { return "1) Sign up and upload your resume. 2) We review your profile. 3) A 30-minute onboarding call. 4) Within 3–7 business days, tailored applications start going out daily and you track them live."; },
      link: { href: "signup.html", label: "Get started →" } },
    { k: ["resume", "rezforge", "tailor", "ats", "cv"],
      a: function () { return "RezForge™ rebuilds your resume for each job around the keywords that posting screens for, scores the match, and your specialist reviews it before it goes out."; } },
    { k: ["guarantee", "job", "hired", "offer", "result", "success"],
      a: function () { return "No one can honestly guarantee a job. We guarantee volume and quality: up to 1,000 tailored applications a month to roles you match. The interviews are yours to win."; } },
    { k: ["referral", "refer", "friend", "invite"],
      a: function () { return "Every member gets a referral link in their dashboard. Your friend gets 50% off month one and you get a free month, with no cap."; } },
    { k: ["contact", "email", "phone", "call", "human", "talk", "person", "support", "agent"],
      a: function () { return "You can reach the team at " + email + (C.phone ? " or " + C.phone : "") + ". Or leave a message here and we'll reply by email."; },
      human: true },
    { k: ["hi", "hello", "hey", "yo"],
      a: function () { return "Hi! Ask me about pricing, how it works, OPT rules, refunds, or promo codes."; } }
  ];

  function answer(q) {
    var t = " " + q.toLowerCase().replace(/[^a-z0-9\- ]/g, " ").replace(/\s+/g, " ") + " ";
    for (var i = 0; i < RULES.length; i++) {
      for (var j = 0; j < RULES[i].k.length; j++) {
        // Whole words only ("pro" must not match "process"); allow a plural "s".
        if (t.indexOf(" " + RULES[i].k[j] + " ") !== -1 || t.indexOf(" " + RULES[i].k[j] + "s ") !== -1) return RULES[i];
      }
    }
    return null;
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function build() {
    if (document.body.dataset.chat === "off") return;
    var log = [];
    var wrap = document.createElement("div");
    wrap.className = "chat";
    wrap.innerHTML =
      '<button type="button" class="chat-fab" aria-expanded="false" aria-controls="chat-panel" aria-label="Open help chat">' +
        '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
        '<span class="chat-badge" aria-hidden="true">1</span>' +
      '</button>' +
      '<section class="chat-panel" id="chat-panel" role="dialog" aria-label="OfferPilot help" hidden>' +
        '<header class="chat-head"><div class="chat-av" aria-hidden="true">OP</div><div><b>OfferPilot help</b><small><span class="chat-online"></span>Usually replies instantly</small></div>' +
          '<button type="button" class="chat-x" aria-label="Close chat">×</button></header>' +
        '<div class="chat-body" aria-live="polite"></div>' +
        '<div class="chat-chips"></div>' +
        '<form class="chat-form"><input type="text" placeholder="Ask a question…" aria-label="Your question" maxlength="300" autocomplete="off"><button type="submit" aria-label="Send">➤</button></form>' +
      '</section>';
    document.body.appendChild(wrap);

    var fab = wrap.querySelector(".chat-fab"), panel = wrap.querySelector(".chat-panel"),
        body = wrap.querySelector(".chat-body"), chips = wrap.querySelector(".chat-chips"),
        form = wrap.querySelector(".chat-form"), input = form.querySelector("input");

    function scroll() { body.scrollTop = body.scrollHeight; }
    function bubble(who, html) {
      var d = document.createElement("div");
      d.className = "msg " + who;
      d.innerHTML = html;
      body.appendChild(d); scroll();
      return d;
    }
    function setChips(list) {
      chips.innerHTML = "";
      list.forEach(function (c) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = c;
        b.addEventListener("click", function () { ask(c); });
        chips.appendChild(b);
      });
    }
    function humanForm() {
      var d = bubble("bot", '<form class="chat-lead"><p>Leave your email and a human will reply.</p>' +
        '<input type="email" required placeholder="you@student.edu" aria-label="Your email">' +
        '<button type="submit" class="btn btn-primary btn-sm">Send to the team</button></form>');
      d.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();
        var from = e.target.querySelector("input").value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) { e.target.querySelector("input").focus(); return; }
        var transcript = log.map(function (l) { return l.who + ": " + l.text; }).join("\n");
        e.target.querySelector("button").disabled = true;
        var send = window.Cloud
          ? window.Cloud.sendMessage({ source: "chat", subject: "Chat handoff from " + from, email: from, message: transcript })
          : Promise.resolve({ demo: true });
        send.then(function (r) {
          if (r && r.demo) {
            // No form key configured: hand off through the visitor's mail app.
            location.href = "mailto:" + email + "?subject=" + encodeURIComponent("Question from " + from) +
              "&body=" + encodeURIComponent(transcript + "\n\nReply to: " + from);
            bubble("bot", "Your email app should open with the conversation attached. Just hit send.");
          } else if (r && r.error) {
            bubble("bot", "That didn't go through. Email us directly at <a href=\"mailto:" + esc(email) + "\">" + esc(email) + "</a>.");
          } else {
            bubble("bot", "✓ Sent! We'll reply to " + esc(from) + " shortly.");
          }
        });
      });
    }
    function ask(q) {
      q = q.trim(); if (!q) return;
      bubble("me", esc(q)); log.push({ who: "Visitor", text: q });
      if (/promo code/i.test(q)) q = "promo";
      var typing = bubble("bot typing", "<span></span><span></span><span></span>");
      setTimeout(function () {
        typing.remove();
        var r = answer(q);
        var text = r ? r.a() : "I'm not sure about that one. Want me to pass it to the team?";
        var html = esc(text);
        if (r && r.link) html += '<br><a class="msg-link" href="' + r.link.href + '">' + esc(r.link.label) + "</a>";
        bubble("bot", html); log.push({ who: "Assistant", text: text });
        if (!r || r.human) humanForm();
        setChips(r && r.chips ? r.chips : ["Pricing", "Is this legal on OPT?", "Refunds", "Talk to a human"]);
      }, 450);
    }
    function open(state) {
      panel.hidden = !state;
      fab.setAttribute("aria-expanded", String(state));
      fab.classList.toggle("open", state);
      wrap.querySelector(".chat-badge").style.display = "none";
      if (state) {
        if (!body.children.length) {
          bubble("bot", "Hi 👋 I'm the OfferPilot assistant. Ask me anything about plans, OPT, refunds or how it works.");
          setChips(["Pricing", "How does it work?", "Is this legal on OPT?", "Talk to a human"]);
        }
        input.focus();
      } else fab.focus();
    }
    fab.addEventListener("click", function () { open(panel.hidden); });
    wrap.querySelector(".chat-x").addEventListener("click", function () { open(false); });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") open(false); });
    form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); input.value = ""; });
    window.OfferPilotChat = { open: function () { open(true); }, ask: function (q) { open(true); ask(q); } };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
