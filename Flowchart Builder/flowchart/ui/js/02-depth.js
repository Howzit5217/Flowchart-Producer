// ---------------------------------------------------------------------------
//  02-depth.js -- shading and shadows: colors with some depth to them
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // A flat fill reads as a sticker; the same color a little lighter where
  // the light falls on it and a little darker where it does not, with a
  // shadow on the paper under it, reads as a thing (asked for, 2026-10-01:
  // "color things too so there is some dimension").  So Depth, a switch on
  // the Style side beside the grid's: every shape's fill becomes a gradient
  // of its own color -- worked out for each color in use, and kept in the
  // drawing's own <defs> so a saved SVG keeps it -- and every shape casts a
  // soft shadow.  It is draw.io's Gradient and Shadow, for the whole chart
  // at once, and in whatever colors the palette or the shapes were given.
  // Off, nothing changes.  On a chart too big for shadows to be quick, the
  // shading is kept and the shadows are let go.
  var DEPTH_SHADOWS = 800;               // shapes, past which no shadows

  function depthWanted() { return !!style.depth; }

  // A color, as six hex digits, from #rgb, #rrggbb or rgb(r, g, b).
  function depthHex(color) {
    var c = String(color || "").trim();
    var m = /^#([\da-f])([\da-f])([\da-f])$/i.exec(c);
    if (m) { return (m[1] + m[1] + m[2] + m[2] + m[3] + m[3]).toLowerCase(); }
    m = /^#([\da-f]{6})/i.exec(c);
    if (m) { return m[1].toLowerCase(); }
    m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(c);
    if (m) {
      return [m[1], m[2], m[3]].map(function (v) {
        return ("0" + Math.max(0, Math.min(255, +v)).toString(16)).slice(-2);
      }).join("");
    }
    return null;
  }

  function depthTint(hex, toward, k) {     // hex k of the way to white (1) or black (0)
    return "#" + [0, 2, 4].map(function (i) {
      var v = parseInt(hex.slice(i, i + 2), 16);
      v = Math.round(v + ((toward ? 255 : 0) - v) * k);
      return ("0" + v.toString(16)).slice(-2);
    }).join("");
  }

  // The fill for a part of a shape in this color, with Depth on: a
  // gradient from a lighter top to a darker foot, made once per color in
  // each drawing.
  function depthFill(color) {
    var hex = depthHex(color);
    if (!hex || !chart) { return color; }
    var id = "dp-" + hex;
    if (!chart._depthDefs || chart._depthDefs.svg !== chart) { chart._depthDefs = { svg: chart, made: {} }; }
    if (!chart._depthDefs.made[id]) {
      var NS = "http://www.w3.org/2000/svg";
      var defs = chart.querySelector("defs.depth-defs");
      if (!defs) {
        defs = document.createElementNS(NS, "defs");
        defs.setAttribute("class", "depth-defs");
        chart.insertBefore(defs, chart.firstChild);
      }
      var grad = document.createElementNS(NS, "linearGradient");
      grad.setAttribute("id", id);
      grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0");
      grad.setAttribute("x2", "0.35"); grad.setAttribute("y2", "1");
      [["0", depthTint(hex, true, 0.42)], ["0.5", "#" + hex], ["1", depthTint(hex, false, 0.2)]]
        .forEach(function (stop) {
          var s = document.createElementNS(NS, "stop");
          s.setAttribute("offset", stop[0]);
          s.setAttribute("stop-color", stop[1]);
          grad.appendChild(s);
        });
      defs.appendChild(grad);
      chart._depthDefs.made[id] = true;
    }
    return "url(#" + id + ")";
  }

  // The switch, and the chart wearing the shadows, kept in step with the
  // style -- put back by Undo, a reset or a palette, it shows what it is.
  function depthDress(count) {
    var on = depthWanted(), box = el("#depth-on");
    if (box && box.checked !== on) { box.checked = on; }
    if (chart && chart.classList) { chart.classList.toggle("depth", on && count <= DEPTH_SHADOWS); }
    return on;
  }

  if (el("#depth-on")) {
    el("#depth-on").onchange = function () {
      if (typeof keepUndo === "function") { keepUndo(); }
      if (this.checked) { style.depth = true; } else { delete style.depth; }
      paint();
      keep();
    };
  }
