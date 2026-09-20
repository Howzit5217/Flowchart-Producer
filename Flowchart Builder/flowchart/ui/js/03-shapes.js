// ---------------------------------------------------------------------------
//  03-shapes.js -- every shape, full size and in miniature
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  function shapeArt(kind, cx, cy, w, h, fill) {
    var l = cx - w / 2, r = cx + w / 2, t = cy - h / 2, b = cy + h / 2;
    var lean = Math.min(12, w / 4), paint = fill || "#ffffff";
    var box = 'fill="' + paint + '"';
    function poly(pts) { return '<polygon points="' + pts.join(" ") + '" ' + box + '/>'; }
    function P(x, y) { return round(x) + "," + round(y); }
    function round(v) { return Math.round(v * 10) / 10; }
    switch (kind) {
      case "oval": case "circle":
        return '<ellipse cx="' + round(cx) + '" cy="' + round(cy) + '" rx="' +
               round(w / 2) + '" ry="' + round(h / 2) + '" ' + box + '/>';
      case "rect": case "sub": {
        var art = '<rect x="' + round(l) + '" y="' + round(t) + '" width="' +
                  round(w) + '" height="' + round(h) + '" rx="3" ' + box + '/>';
        if (kind === "sub") {
          art += '<line x1="' + round(l + 6) + '" y1="' + round(t) + '" x2="' +
                 round(l + 6) + '" y2="' + round(b) + '"/><line x1="' +
                 round(r - 6) + '" y1="' + round(t) + '" x2="' + round(r - 6) +
                 '" y2="' + round(b) + '"/>';
        }
        return art;
      }
      case "roundrect":
        return '<rect x="' + round(l) + '" y="' + round(t) + '" width="' + round(w) +
               '" height="' + round(h) + '" rx="' + round(Math.min(14, h / 2.4)) +
               '" ' + box + '/>';
      case "io": return poly([P(l + lean, t), P(r, t), P(r - lean, b), P(l, b)]);
      case "io_back": return poly([P(l, t), P(r - lean, t), P(r, b), P(l + lean, b)]);
      case "trap": return poly([P(l + lean, t), P(r - lean, t), P(r, b), P(l, b)]);
      case "hex": return poly([P(l + lean, t), P(r - lean, t), P(r, cy),
                               P(r - lean, b), P(l + lean, b), P(l, cy)]);
      case "manual": {
        var slope = Math.min(11, h * 0.28);
        return poly([P(l, t + slope), P(r, t), P(r, b), P(l, b)]);
      }
      case "card": {
        var nick = Math.min(14, h * 0.34);
        return poly([P(l + nick, t), P(r, t), P(r, b), P(l, b), P(l, t + nick)]);
      }
      case "note": {
        var fold = Math.min(14, h * 0.34);
        return '<path d="M' + P(l, t) + "H" + round(r - fold) + "L" + P(r, t + fold) +
               "V" + round(b) + "H" + round(l) + 'Z" ' + box + '/>' +
               '<path class="trim" d="M' + P(r - fold, t) + "V" + round(t + fold) +
               "H" + round(r) + '" fill="none"/>';
      }
      case "doc": {
        var wave = Math.min(10, h * 0.18);
        return '<path d="M' + P(l, t) + "H" + round(r) + "V" + round(b - wave) +
               "C" + P(r - w * 0.25, b - wave * 2.2) + " " + P(r - w * 0.4, b + wave * 0.9) +
               " " + P(cx, b - wave * 0.2) +
               "C" + P(l + w * 0.32, b - wave * 1.6) + " " + P(l + w * 0.18, b + wave * 0.7) +
               " " + P(l, b - wave) + 'Z" ' + box + '/>';
      }
      case "docs": {
        var step = Math.min(5, h * 0.12), art = "";
        [2, 1].forEach(function (back) {
          art += '<rect x="' + round(l + back * step) + '" y="' + round(t) +
                 '" width="' + round(w - back * step) + '" height="' +
                 round(h - back * step * 2) + '" rx="2" ' + box + '/>';
        });
        return art + shapeArt("doc", cx - step, cy + step, w - 2 * step, h - 2 * step, paint);
      }
      case "store": {
        var lip = Math.min(11, h * 0.24);
        return '<path d="M' + P(l, t + lip) + "V" + round(b - lip) +
               "A" + round(w / 2) + "," + round(lip) + " 0 0 0 " + P(r, b - lip) +
               "V" + round(t + lip) + "A" + round(w / 2) + "," + round(lip) +
               " 0 0 0 " + P(l, t + lip) + 'Z" ' + box + '/>' +
               '<path class="trim" d="M' + P(l, t + lip) + "A" + round(w / 2) + "," +
               round(lip) + " 0 0 0 " + P(r, t + lip) + '" fill="none"/>';
      }
      case "delay": {
        var bulge = Math.min(h / 2, w / 2);
        return '<path d="M' + P(l, t) + "H" + round(r - bulge) + "A" + round(bulge) +
               "," + round(h / 2) + " 0 0 1 " + P(r - bulge, b) + "H" + round(l) +
               'Z" ' + box + '/>';
      }
      case "screen": {
        var bow = Math.min(16, w * 0.16);
        return '<path d="M' + P(l + bow, t) + "H" + round(r - bow) +
               "A" + round(h / 2) + "," + round(h / 2) + " 0 0 1 " + P(r - bow, b) +
               "H" + round(l + bow) + "C" + P(l, cy + h * 0.28) + " " +
               P(l, cy - h * 0.28) + " " + P(l + bow, t) + 'Z" ' + box + '/>';
      }
      case "offpage":                     // carries on somewhere else
        return poly([P(l, t), P(r, t), P(r, b - Math.min(18, h * 0.42)),
                     P(cx, b), P(l, b - Math.min(18, h * 0.42))]);
      case "loop": {                      // a loop's limit: For, mostly
        var cut = Math.min(14, h * 0.34, w / 5);
        return poly([P(l + cut, t), P(r - cut, t), P(r, t + cut), P(r, b),
                     P(l, b), P(l, t + cut)]);
      }
      case "parallel": {                  // things happening side by side
        var bar = Math.max(2.5, Math.min(5, h * 0.11));
        return '<rect x="' + round(l) + '" y="' + round(t) + '" width="' + round(w) +
               '" height="' + round(h) + '" rx="2" ' + box + '/>' +
               '<path class="trim" d="M' + P(l, t + bar * 2) + "H" + round(r) +
               "M" + P(l, b - bar * 2) + "H" + round(r) + '" fill="none"/>';
      }
      case "stored": {                    // held somewhere inside
        var rule = Math.min(11, w * 0.14);
        return '<rect x="' + round(l) + '" y="' + round(t) + '" width="' + round(w) +
               '" height="' + round(h) + '" rx="2" ' + box + '/>' +
               '<path class="trim" d="M' + P(l + rule, t) + "V" + round(b) +
               "M" + P(l, t + rule) + "H" + round(r) + '" fill="none"/>';
      }
      case "cloud": {
        // Drawn so that it touches its box at the middle of all four sides,
        // which is where a line joining it expects to meet it.
        var qw = w / 2, qh = h / 2;
        return '<path d="M' + P(l, cy) +
               "C" + P(l, cy - qh * 0.75) + " " + P(cx - qw * 0.72, t - qh * 0.18) +
               " " + P(cx - qw * 0.34, t + qh * 0.16) +
               "C" + P(cx - qw * 0.1, t - qh * 0.2) + " " + P(cx + qw * 0.34, t - qh * 0.2) +
               " " + P(cx + qw * 0.42, t + qh * 0.2) +
               "C" + P(cx + qw * 0.85, t + qh * 0.02) + " " + P(r, cy - qh * 0.7) +
               " " + P(r, cy) +
               "C" + P(r, cy + qh * 0.72) + " " + P(cx + qw * 0.5, b) + " " + P(cx, b) +
               "C" + P(cx - qw * 0.55, b) + " " + P(l, cy + qh * 0.75) + " " + P(l, cy) +
               'Z" ' + box + '/>';
      }
      case "text":                       // words on their own, no outline
        // Nothing is drawn but something has to be there to take hold of,
        // so the words sit on a pane of clear glass.
        return '<rect class="ghost" x="' + round(l) + '" y="' + round(t) +
               '" width="' + round(w) + '" height="' + round(h) +
               '" fill="none" pointer-events="all"/>';
      case "actor": {                    // somebody, rather than something
        var head = Math.min(h * 0.17, w * 0.17);
        var neck = t + head * 2;
        var hip = t + h * 0.62;
        return '<circle cx="' + round(cx) + '" cy="' + round(t + head) + '" r="' +
               round(head) + '" ' + box + '/>' +
               '<path class="trim" d="M' + P(cx, neck) + "V" + round(hip) +
               "M" + P(cx - w * 0.22, neck + h * 0.12) + "H" + round(cx + w * 0.22) +
               "M" + P(cx, hip) + "L" + P(cx - w * 0.2, b) +
               "M" + P(cx, hip) + "L" + P(cx + w * 0.2, b) + '" fill="none"/>';
      }
      case "callout": {                  // something said about it
        var tail = Math.min(16, h * 0.28);
        var sill = b - tail;
        var rnd = Math.min(10, h / 4);
        return '<path d="M' + P(l + rnd, t) + "H" + round(r - rnd) +
               "Q" + P(r, t) + " " + P(r, t + rnd) + "V" + round(sill - rnd) +
               "Q" + P(r, sill) + " " + P(r - rnd, sill) +
               "H" + round(l + w * 0.34) + "L" + P(l + w * 0.2, b) +
               "L" + P(l + w * 0.24, sill) + "H" + round(l + rnd) +
               "Q" + P(l, sill) + " " + P(l, sill - rnd) + "V" + round(t + rnd) +
               "Q" + P(l, t) + " " + P(l + rnd, t) + 'Z" ' + box + '/>';
      }
      case "cube": {
        var lip = Math.min(14, h * 0.26, w * 0.14);
        return '<path d="M' + P(l, t + lip) + "L" + P(l + lip, t) + "H" + round(r) +
               "V" + round(b - lip) + "L" + P(r - lip, b) + "H" + round(l) +
               'Z" ' + box + '/>' +
               '<path class="trim" d="M' + P(l, t + lip) + "H" + round(r - lip) +
               "V" + round(b) + "M" + P(r - lip, t + lip) + "L" + P(r, t) +
               '" fill="none"/>';
      }
      case "step": {                     // one step of several, in a row
        var notch = Math.min(22, w * 0.16);
        return poly([P(l, t), P(r - notch, t), P(r, cy), P(r - notch, b),
                     P(l, b), P(l + notch, cy)]);
      }
      case "table": {
        var head = Math.min(16, h * 0.3);
        return '<rect x="' + round(l) + '" y="' + round(t) + '" width="' + round(w) +
               '" height="' + round(h) + '" rx="2" ' + box + '/>' +
               '<path class="trim" d="M' + P(l, t + head) + "H" + round(r) +
               "M" + P(l + w / 3, t + head) + "V" + round(b) +
               "M" + P(l + w * 2 / 3, t + head) + "V" + round(b) + '" fill="none"/>';
      }
      case "arrow": {
        var head = Math.min(26, w * 0.3), wing = h * 0.26;
        return poly([P(l, t + wing), P(r - head, t + wing), P(r - head, t), P(r, cy),
                     P(r - head, b), P(r - head, b - wing), P(l, b - wing)]);
      }
      default: return poly([P(cx, t), P(r, cy), P(cx, b), P(l, cy)]);
    }
  }

  function keyMark(kind) {               // the same shape, in miniature
    // Text draws no outline -- that is the whole point of it on the paper,
    // where it is words and nothing else -- so in miniature it came out as
    // an empty square: a button in the row with all the others that nobody
    // could see, and no way to tell it apart from a gap.  Here it is shown
    // as what it holds instead.
    var art = kind === "text"
            ? '<path d="M3.5 4.5h17M3.5 8.5h13M3.5 12.5h8"/>'
            : shapeArt(kind, 12, 8.5, 21, 14);
    return '<span class="legendkey"><svg class="keymark" data-kind="' + kind +
           '" width="24" height="17" viewBox="0 0 24 17" stroke="#10151b" ' +
           'stroke-width="1.2" fill="none">' + art + "</svg></span>";
  }

