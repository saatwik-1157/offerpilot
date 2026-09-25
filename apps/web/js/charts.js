/* ============================================================
   OfferPilot — Tiny SVG chart helpers (no dependencies)
   Each returns an SVG string. Colors come from the design system.
   ============================================================ */
(function () {
  "use strict";
  var INK = "#4F46E5", INK2 = "#7C3AED", GREEN = "#10B981", GRID = "#E4E7F0", MUTE = "#8A93A6";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  /* Vertical bar chart. data: [{label, value}] */
  function bar(data, opts) {
    opts = opts || {};
    var w = opts.w || 520, h = opts.h || 200, pad = 30, gap = 10;
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }).concat([1]));
    var innerH = h - pad - 22;
    var bw = (w - pad) / data.length - gap;
    var bars = data.map(function (d, i) {
      var bh = Math.round((d.value / max) * innerH);
      var x = pad + i * ((w - pad) / data.length) + gap / 2;
      var y = pad + (innerH - bh);
      return '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh +
        '" rx="5" fill="url(#bg)"><title>' + esc(d.label) + ': ' + d.value + '</title></rect>' +
        '<text x="' + (x + bw / 2) + '" y="' + (h - 6) + '" text-anchor="middle" font-size="10" fill="' + MUTE + '">' + esc(d.label) + '</text>' +
        (opts.showVal ? '<text x="' + (x + bw / 2) + '" y="' + (y - 5) + '" text-anchor="middle" font-size="10" font-weight="700" fill="' + INK + '">' + d.value + '</text>' : '');
    }).join("");
    return svg(w, h, defs() + gridlines(w, h, pad, innerH) + bars);
  }

  /* Line/area chart. points: [{label, value}] */
  function line(points, opts) {
    opts = opts || {};
    var w = opts.w || 520, h = opts.h || 200, pad = 30;
    var max = Math.max.apply(null, points.map(function (p) { return p.value; }).concat([1]));
    var innerH = h - pad - 22, innerW = w - pad - 8;
    var step = points.length > 1 ? innerW / (points.length - 1) : 0;
    var coords = points.map(function (p, i) {
      var x = pad + i * step;
      var y = pad + (innerH - (p.value / max) * innerH);
      return [x, y];
    });
    var path = coords.map(function (c, i) { return (i ? "L" : "M") + c[0] + " " + c[1]; }).join(" ");
    var area = path + " L" + coords[coords.length - 1][0] + " " + (pad + innerH) + " L" + coords[0][0] + " " + (pad + innerH) + " Z";
    var dots = coords.map(function (c, i) {
      return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3.5" fill="#fff" stroke="' + INK + '" stroke-width="2"><title>' + esc(points[i].label) + ': ' + points[i].value + '</title></circle>';
    }).join("");
    var labels = points.map(function (p, i) {
      if (points.length > 8 && i % 2) return "";
      return '<text x="' + (pad + i * step) + '" y="' + (h - 6) + '" text-anchor="middle" font-size="10" fill="' + MUTE + '">' + esc(p.label) + '</text>';
    }).join("");
    return svg(w, h, defs() + gridlines(w, h, pad, innerH) +
      '<path d="' + area + '" fill="url(#area)" opacity="0.5"/>' +
      '<path d="' + path + '" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      dots + labels);
  }

  /* Horizontal funnel. stages: [{label, value}] */
  function funnel(stages) {
    var w = 520, rowH = 46, gap = 10, h = stages.length * (rowH + gap);
    var max = Math.max.apply(null, stages.map(function (s) { return s.value; }).concat([1]));
    var colors = [INK, "#6366F1", INK2, "#B45309", GREEN];
    var rows = stages.map(function (s, i) {
      var bw = Math.max(60, Math.round((s.value / max) * (w - 140)));
      var y = i * (rowH + gap);
      var c = colors[i % colors.length];
      return '<rect x="0" y="' + y + '" width="' + bw + '" height="' + rowH + '" rx="8" fill="' + c + '" opacity="' + (0.55 + 0.09 * i) + '"/>' +
        '<text x="14" y="' + (y + rowH / 2 + 4) + '" font-size="12.5" font-weight="700" fill="#fff">' + esc(s.label) + '</text>' +
        '<text x="' + (bw + 12) + '" y="' + (y + rowH / 2 + 4) + '" font-size="13" font-weight="800" fill="' + INK + '">' + s.value + '</text>';
    }).join("");
    return svg(w, h, rows);
  }

  function gridlines(w, h, pad, innerH) {
    var lines = "";
    for (var i = 0; i <= 4; i++) {
      var y = pad + (innerH / 4) * i;
      lines += '<line x1="' + pad + '" y1="' + y + '" x2="' + (w - 4) + '" y2="' + y + '" stroke="' + GRID + '" stroke-width="1"/>';
    }
    return lines;
  }
  function defs() {
    return '<defs>' +
      '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6366F1"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>' +
      '<linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6366F1" stop-opacity="0.35"/><stop offset="1" stop-color="#6366F1" stop-opacity="0"/></linearGradient>' +
      '</defs>';
  }
  function svg(w, h, inner) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img">' + inner + '</svg>';
  }

  window.Charts = { bar: bar, line: line, funnel: funnel };
})();
