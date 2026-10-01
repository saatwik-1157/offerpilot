/* ============================================================
   OfferPilot — 3D / motion layer
   Dependency-free. Everything here is decoration: if a feature
   is unsupported (no canvas, reduced motion) the page still
   works and simply renders a calm static frame.
     • Hero globe: a perspective-projected sphere of dots with
       arcs travelling between "job hubs", drag to spin.
     • Starfield: drifting depth-layered stars behind the hero.
     • Tilt: 3D tilt + spotlight on [data-tilt] cards.
     • Scroll progress bar.
   ============================================================ */
(function () {
  "use strict";

  var reduced = false;
  try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  function dpr() { return Math.min(window.devicePixelRatio || 1, 2); }

  /* Shared animation loop: one rAF drives every scene, and each scene
     is paused while it is off-screen or the tab is hidden. */
  var scenes = [];
  var running = false;
  function loop(t) {
    var any = false;
    for (var i = 0; i < scenes.length; i++) {
      if (scenes[i].visible) { scenes[i].frame(t); any = true; }
    }
    running = any && !document.hidden;
    if (running) requestAnimationFrame(loop);
  }
  function kick() { if (!running && !reduced && !document.hidden) { running = true; requestAnimationFrame(loop); } }
  document.addEventListener("visibilitychange", kick);

  function addScene(el, scene) {
    scene.visible = true;
    scenes.push(scene);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        scene.visible = entries[0].isIntersecting;
        kick();
      }).observe(el);
    }
    scene.frame(0);           // always paint one frame (static for reduced motion)
    kick();
  }

  function fitCanvas(canvas) {
    var r = canvas.getBoundingClientRect();
    var s = dpr();
    canvas.width = Math.max(1, Math.round(r.width * s));
    canvas.height = Math.max(1, Math.round(r.height * s));
    var ctx = canvas.getContext("2d");
    ctx.setTransform(s, 0, 0, s, 0, 0);
    return { w: r.width, h: r.height, ctx: ctx };
  }

  /* Re-fit whenever the canvas's laid-out size changes. Scripts can run
     before layout settles (fonts, late CSS), so a one-off measure at init
     may see 0×0. */
  function onResize(canvas, cb) {
    if ("ResizeObserver" in window) {
      var last = "";
      new ResizeObserver(function (entries) {
        var cr = entries[0].contentRect, key = Math.round(cr.width) + "x" + Math.round(cr.height);
        if (key !== last) { last = key; cb(); }
      }).observe(canvas);
    } else {
      window.addEventListener("resize", cb);
    }
  }

  /* ---------------- Hero globe ---------------- */
  function globe(canvas) {
    if (!canvas.getContext) return;
    var view = fitCanvas(canvas);
    var N = window.innerWidth < 700 ? 520 : 900;
    var pts = [];
    // Fibonacci sphere: evenly spread points.
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var rad = Math.sqrt(1 - y * y);
      var th = golden * i;
      pts.push([Math.cos(th) * rad, y, Math.sin(th) * rad]);
    }
    // "Job hubs" (lat, lon) — US tech cities + a few global ones.
    var hubs = [
      [37.4, -122.1], [47.6, -122.3], [40.7, -74.0], [30.3, -97.7], [42.4, -71.1],
      [33.4, -111.9], [41.9, -87.6], [39.7, -105.0], [51.5, -0.1], [12.97, 77.6],
      [1.35, 103.8], [35.7, 139.7]
    ].map(function (ll) {
      var lat = ll[0] * Math.PI / 180, lon = ll[1] * Math.PI / 180;
      return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
    });
    var arcs = [];
    function newArc() {
      var a = Math.floor(Math.random() * hubs.length), b;
      do { b = Math.floor(Math.random() * hubs.length); } while (b === a);
      return { a: hubs[a], b: hubs[b], t: 0, speed: 0.004 + Math.random() * 0.006 };
    }
    for (var k = 0; k < 7; k++) { var arc = newArc(); arc.t = Math.random(); arcs.push(arc); }

    var rotY = 1.9, rotX = -0.32, velY = 0.0022, drag = null, mouseX = 0, mouseY = 0;

    function rotate(p) {
      var cy = Math.cos(rotY), sy = Math.sin(rotY), cx = Math.cos(rotX), sx = Math.sin(rotX);
      var x = p[0] * cy - p[2] * sy, z = p[0] * sy + p[2] * cy;
      var y = p[1] * cx - z * sx; z = p[1] * sx + z * cx;
      return [x, y, z];
    }
    function project(p, R, cx, cy) {
      var persp = 2.6 / (2.6 - p[2]);
      return [cx + p[0] * R * persp, cy - p[1] * R * persp, persp];
    }
    function slerp(a, b, t) {
      var d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      var om = Math.acos(d), so = Math.sin(om) || 1e-6;
      var wa = Math.sin((1 - t) * om) / so, wb = Math.sin(t * om) / so;
      var lift = 1 + Math.sin(Math.PI * t) * 0.22 * om;   // arcs rise off the surface
      return [(a[0] * wa + b[0] * wb) * lift, (a[1] * wa + b[1] * wb) * lift, (a[2] * wa + b[2] * wb) * lift];
    }

    function frame() {
      var ctx = view.ctx, w = view.w, h = view.h;
      ctx.clearRect(0, 0, w, h);
      var R = Math.min(w, h) * 0.40, cx = w / 2 + mouseX * 10, cy = h / 2 + mouseY * 10;

      if (!drag) rotY += velY;
      rotX += ((-0.32 + mouseY * 0.15) - rotX) * 0.04;

      // Atmosphere glow
      var g = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.35);
      g.addColorStop(0, "rgba(99,102,241,0.30)");
      g.addColorStop(0.55, "rgba(124,58,237,0.12)");
      g.addColorStop(1, "rgba(16,185,129,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2); ctx.fill();

      // Sphere body
      var body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      body.addColorStop(0, "rgba(67,56,202,0.55)");
      body.addColorStop(1, "rgba(11,16,32,0.85)");
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      // Orbit ring (tilted ellipse), back half
      function ring(front) {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.38);
        ctx.strokeStyle = "rgba(165,180,252," + (front ? 0.55 : 0.18) + ")";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, R * 1.42, R * 0.34, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
        ctx.stroke();
        // satellite
        var sa = (rotY * 1.7) % (Math.PI * 2);
        var onFront = Math.sin(sa) > 0;
        if (onFront === front) {
          ctx.fillStyle = "#6EE7B7"; ctx.shadowColor = "#10B981"; ctx.shadowBlur = 14;
          ctx.beginPath(); ctx.arc(Math.cos(sa) * R * 1.42, Math.sin(sa) * R * 0.34, 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
      ring(false);

      // Dots
      for (var i = 0; i < pts.length; i++) {
        var p = rotate(pts[i]);
        if (p[2] < -0.15) continue;
        var s = project(p, R, cx, cy);
        var a = 0.15 + (p[2] + 0.15) * 0.65;
        ctx.fillStyle = "rgba(199,210,254," + a.toFixed(3) + ")";
        ctx.fillRect(s[0], s[1], 1.6 * s[2], 1.6 * s[2]);
      }

      // Arcs with travelling pulses
      for (var j = 0; j < arcs.length; j++) {
        var A = arcs[j];
        A.t += reduced ? 0 : A.speed;
        if (A.t > 1.35) { arcs[j] = newArc(); continue; }
        var head = Math.min(A.t, 1), tail = Math.max(0, A.t - 0.35);
        ctx.beginPath();
        var started = false, lastVis = false, hx = 0, hy = 0;
        for (var q = 0; q <= 24; q++) {
          var tt = tail + (head - tail) * (q / 24);
          var rp = rotate(slerp(A.a, A.b, tt));
          var sp = project(rp, R, cx, cy);
          var vis = rp[2] > -0.05;
          if (vis && (!started || !lastVis)) { ctx.moveTo(sp[0], sp[1]); started = true; }
          else if (vis) ctx.lineTo(sp[0], sp[1]);
          lastVis = vis; hx = sp[0]; hy = sp[1];
        }
        var grad = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
        grad.addColorStop(0, "rgba(110,231,183,0.9)"); grad.addColorStop(1, "rgba(165,180,252,0.9)");
        ctx.strokeStyle = grad; ctx.lineWidth = 1.6; ctx.stroke();
        if (A.t <= 1 && lastVis) {
          ctx.fillStyle = "#fff"; ctx.shadowColor = "#6EE7B7"; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.arc(hx, hy, 2.6, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        }
      }

      // Hubs
      for (var m = 0; m < hubs.length; m++) {
        var hp = rotate(hubs[m]);
        if (hp[2] < 0) continue;
        var hs = project(hp, R, cx, cy);
        ctx.fillStyle = "rgba(16,185,129,0.25)";
        ctx.beginPath(); ctx.arc(hs[0], hs[1], 6 * hs[2], 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#6EE7B7";
        ctx.beginPath(); ctx.arc(hs[0], hs[1], 2.4 * hs[2], 0, Math.PI * 2); ctx.fill();
      }
      ring(true);
    }

    // Drag to spin, parallax on hover.
    canvas.addEventListener("pointerdown", function (e) {
      drag = { x: e.clientX, rot: rotY }; canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width - 0.5;
      mouseY = (e.clientY - r.top) / r.height - 0.5;
      if (drag) { rotY = drag.rot + (e.clientX - drag.x) * 0.008; if (reduced) frame(); }
    });
    function endDrag() { drag = null; }
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("pointerleave", function () { mouseX = 0; mouseY = 0; });
    onResize(canvas, function () { view = fitCanvas(canvas); frame(); });

    addScene(canvas, { frame: frame });
  }

  /* ---------------- Starfield ---------------- */
  function starfield(canvas) {
    if (!canvas.getContext) return;
    var view = fitCanvas(canvas);
    var stars = [];
    function seed() {
      stars = [];
      var count = Math.round(view.w * view.h / 5200);
      for (var i = 0; i < count; i++) {
        stars.push({ x: Math.random() * view.w, y: Math.random() * view.h, z: Math.random(), tw: Math.random() * 6.28 });
      }
    }
    seed();
    var scrollY = 0;
    window.addEventListener("scroll", function () { scrollY = window.scrollY; }, { passive: true });
    function frame(t) {
      var ctx = view.ctx;
      ctx.clearRect(0, 0, view.w, view.h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        if (!reduced) { s.x -= 0.05 + s.z * 0.25; if (s.x < -2) s.x = view.w + 2; }
        var y = (s.y - scrollY * s.z * 0.25 + view.h) % view.h;
        var a = 0.25 + s.z * 0.6 + Math.sin(t / 700 + s.tw) * 0.15;
        ctx.fillStyle = "rgba(226,232,255," + Math.max(0, a).toFixed(3) + ")";
        var size = 0.6 + s.z * 1.4;
        ctx.fillRect(s.x, y, size, size);
      }
    }
    onResize(canvas, function () { view = fitCanvas(canvas); seed(); frame(0); });
    addScene(canvas, { frame: frame });
  }

  /* ---------------- 3D tilt + spotlight ----------------
     Delegated from the document, so cards rendered later (dashboard KPIs)
     tilt too. Opt in with [data-tilt="maxDegrees"]; .kpi tiles are opted in. */
  var TILT_SEL = "[data-tilt], .kpi";
  function tiltDelegate() {
    var current = null, raf = 0;
    function reset(el) {
      el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg");
      el.classList.remove("tilting");
    }
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var el = e.target.closest && e.target.closest(TILT_SEL);
      if (current && current !== el) { reset(current); current = null; }
      if (!el) return;
      current = el;
      el.classList.add("tilt");
      var max = parseFloat(el.getAttribute("data-tilt")) || 8;
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        el.style.setProperty("--rx", ((0.5 - py) * max).toFixed(2) + "deg");
        el.style.setProperty("--ry", ((px - 0.5) * max).toFixed(2) + "deg");
        el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        el.classList.add("tilting");
      });
    }, { passive: true });
    document.addEventListener("pointerleave", function () { if (current) { reset(current); current = null; } });
  }

  /* ---------------- Scroll progress ---------------- */
  function progressBar() {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0).toFixed(4) + ")";
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function init() {
    document.querySelectorAll("canvas[data-fx='globe']").forEach(globe);
    document.querySelectorAll("canvas[data-fx='stars']").forEach(starfield);
    if (!reduced && window.matchMedia && window.matchMedia("(hover: hover)").matches) {
      document.querySelectorAll(TILT_SEL).forEach(function (el) { el.classList.add("tilt"); });
      tiltDelegate();
    }
    // Resume stack: tap to fan out (touch screens have no hover).
    document.querySelectorAll(".rez-stage").forEach(function (stage) {
      var stack = stage.querySelector(".rez-stack");
      if (stack) stage.addEventListener("click", function () { stack.classList.toggle("open"); });
    });
    progressBar();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
