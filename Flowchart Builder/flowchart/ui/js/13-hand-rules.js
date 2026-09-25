// ---------------------------------------------------------------------------
//  13-hand-rules.js -- the shape for each kind of step, kept to by hand
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // The rules are the "Shape for each kind" card (drawRoles, 09-build.js):
  // which shape a Start or End, a Process, an Input or Output, a Decision,
  // a Loop and a call to a module are drawn as.  The pseudocode side always
  // keeps to them.  Drawing by hand, any of thirty shapes can be anything,
  // so the drawing is read here the way pseudocode is read -- by its words,
  // and by where its arrows go -- and a shape drawn as something other than
  // its kind's shape wears a small amber mark offering the right one.  The
  // offer can be taken, or turned down; a shape turned down is not asked
  // about again unless it comes to read as some other kind of step.

  function ruleShape(role) { return geom[role] || role; }

  // A shape that asks a question: a diamond always, and whatever the rules
  // draw a Decision or a Loop as -- unless that is also the shape they give
  // some plainer step, when the shape alone cannot say which it is.
  function asksKind(kind) {
    if (kind === "diamond") { return true; }
    if (kind !== ruleShape("diamond") && kind !== ruleShape("hex")) { return false; }
    return ["oval", "rect", "io", "sub"].every(function (role) {
      return ruleShape(role) !== kind;
    });
  }

  // A shape a flow starts or stops at: an oval always, and whatever the
  // rules draw a Start or End as, on the same terms.
  function endsKind(kind) {
    if (kind === "oval") { return true; }
    if (kind !== ruleShape("oval")) { return false; }
    return ["rect", "io", "diamond", "hex", "sub"].every(function (role) {
      return ruleShape(role) !== kind;
    });
  }

  // The rules' shapes, one row each for the menus that add a step -- the +
  // beside a picked shape, a step put into an arrow, the paper's own menu.
  // Two kinds the rules draw alike are one row, named for both.
  function ruleChoices(skip) {
    var rows = [], at = {};
    ROLES.forEach(function (role) {
      if (skip && skip.indexOf(role) >= 0) { return; }
      var kind = ruleShape(role), name = TXT["key_" + role] || role;
      if (at[kind]) { at[kind].name += " · " + name; return; }
      rows.push(at[kind] = { kind: kind, role: role, name: name });
    });
    return rows;
  }

  // ------------------------------------------------ what kind of step it is --
  // The pseudocode's own words for these (parse/keywords.py), so a shape is
  // read the way the same words typed on that side would be; and the page's
  // own Start and End, which is what a new oval says in any language.
  var RW_START = /^((start|begin)(\s+program)?|main)$/i;
  var RW_END = /^(end|stop|halt|end\s+program|exit\s+program)$|^return\b/i;
  var RW_CALL = /^call\b/i;
  var RW_IO = new RegExp("^(display|print|output|write|echo|println|printf|puts|" +
                         "writeline|input|read|get|enter|scan|prompt|accept|readline)\\b", "i");
  // A question: If or While in front, a comparison, or a question mark.
  var RW_ASK = /^(if|while|until|else\s*if|elseif)\b|\?$|[<>]|!=|==/i;
  // Kinds that are a note beside the flow as often as a step in it.
  var NOTE_KINDS = { text: true, note: true, callout: true };

  // One of ROLES, or null where nothing about the shape says.  Two ways out
  // make a question whatever the words are.  Then the words, where they are
  // the pseudocode's for something; then a Start or End shape where the
  // flow does start or stop, which is one whatever it says ("Begin the
  // sort"); and plain words make a Process -- once an arrow meets the
  // shape, since a shape on its own may be a note rather than a step.
  function stepRole(n, outs, ins) {
    if (outs > 1) { return "diamond"; }
    var words = String(n.text || "").replace(/\s+/g, " ").trim();
    if (!words || (NOTE_KINDS[n.kind] && !outs && !ins)) { return null; }
    var low = words.toLowerCase();
    if (RW_START.test(words) || RW_END.test(words) ||
        low === String(TXT.start || "").toLowerCase() ||
        low === String(TXT.end || "").toLowerCase()) { return "oval"; }
    if (RW_CALL.test(words)) { return "sub"; }
    if (RW_IO.test(words)) { return "io"; }
    if (RW_ASK.test(words)) { return "diamond"; }
    if (!outs && !ins) { return null; }
    if (endsKind(n.kind) && (!ins || !outs)) { return "oval"; }
    return "rect";
  }

  // What the rules would have it be, where that is not what it is: the
  // kind of step, and the shape.  A question the flow comes back round to
  // is a loop, and may wear the Loop's shape as well as the Decision's.
  function ruleWant(n, outs, ins) {
    var role = stepRole(n, outs, ins);
    if (!role) { return null; }
    var want = ruleShape(role);
    if (n.kind === want || n.asIs === want) { return null; }
    if (role === "diamond" && n.kind === ruleShape("hex") && outs > 1 &&
        outOf(n.id).some(function (l) { return canReach(l.to, n.id); })) {
      return null;
    }
    return { role: role, want: want };
  }

  function ruleHintFor(n) {
    return n ? ruleWant(n, outOf(n.id).length, intoOf(n.id).length) : null;
  }

  // Every shape's at once, for drawHand: one pass over the arrows rather
  // than two for each shape.
  function ruleHints() {
    var outs = {}, ins = {}, hints = {};
    if (!byHand) { return hints; }
    hand.links.forEach(function (l) {
      outs[l.from] = (outs[l.from] || 0) + 1;
      ins[l.to] = (ins[l.to] || 0) + 1;
    });
    hand.nodes.forEach(function (n) {
      var hint = ruleWant(n, outs[n.id] || 0, ins[n.id] || 0);
      if (hint) { hints[n.id] = hint; }
    });
    return hints;
  }

  function ruleSays(hint) {
    return say("hr_says", { role: TXT["key_" + hint.role] || hint.role,
                            shape: kindName(hint.want) });
  }

  // ------------------------------------------------------- the amber mark --
  // Off the shape's top right corner, clear of the corner it is resized by,
  // and above everything else on the paper (drawHand puts it last).
  function ruleMark(n, at, about, hint) {
    if (!hint || joining) { return ""; }
    var r = COARSE ? 10 : 8, off = COARSE ? 15 : 11;
    var x = at.x + about.w / 2 + off;
    var y = Math.max(r + 1, at.y - about.h / 2 - off);
    var s = r * 0.58, k = s * 0.27;
    return '<g class="rule-dot" data-hint="' + n.id + '" transform="translate(' +
           x.toFixed(1) + "," + y.toFixed(1) + ')">' +
           "<title>" + escaped(TXT.hr_tip || "") + "</title>" +
           '<circle r="' + r + '" fill="#d98a04" stroke="#ffffff" stroke-width="1.5"/>' +
           '<path d="M0,' + -s + "L" + k + "," + -k + "L" + s + ",0L" + k + "," + k +
           "L0," + s + "L" + -k + "," + k + "L" + -s + ",0L" + -k + "," + -k +
           'Z" fill="#ffffff" stroke="none"/></g>';
  }

  // Pressed: the shape is picked, as the right button picks it, and the
  // offer is made beside the mark.
  function ruleMenu(id, x, y) {
    var n = nodeById(id), hint = ruleHintFor(n);
    if (!hint) { return; }
    picked = id; chosen = null; many = []; joining = false;
    drawHand(); drawHandPanel();
    var said = document.createElement("p");
    said.className = "rule-says";
    said.textContent = ruleSays(hint);
    openMenu(x, y, [
      { head: TXT.hr_head },
      { bit: said },
      { mark: keyMark(hint.want), name: say("hr_change", { shape: kindName(hint.want) }),
        go: function () { takeRule(id); } },
      { name: TXT.hr_keep, go: function () { keepAsIs(id); } }
    ], "rule-menu");
  }

  // Taken: the shape becomes the rules' one, and is sized again for it the
  // next time it is drawn (unless it was given a size of its own).
  function takeRule(id) {
    var n = nodeById(id), hint = ruleHintFor(n);
    if (!hint || !byHand) { return; }
    keepUndo();
    n.kind = hint.want;
    delete n.asIs;
    if (n.kind === "circle") { n.h = n.w; }
    drawHand(); drawHandPanel(); showReport();
  }

  // Turned down: this shape is left as it is, and not asked about this
  // shape again.  Asked about another, it is asked.
  function keepAsIs(id) {
    var n = nodeById(id), hint = ruleHintFor(n);
    if (!hint || !byHand) { return; }
    keepUndo();
    n.asIs = hint.want;
    drawHand(); drawHandPanel();
  }

  // The same offer in the panel, for the picked shape: said, and both ways
  // of answering it, under the shape's name.
  function ruleTip(box, node) {
    var hint = ruleHintFor(node);
    if (!hint) { return; }
    var tip = document.createElement("div");
    tip.className = "rule-tip";
    var said = document.createElement("p");
    said.textContent = ruleSays(hint);
    tip.appendChild(said);
    var go = document.createElement("div");
    go.className = "rule-tip-go";
    var take = document.createElement("button");
    take.type = "button";
    take.className = "btn small take";
    take.innerHTML = keyMark(hint.want) + "<span></span>";
    take.lastChild.textContent = say("hr_change", { shape: kindName(hint.want) });
    take.onclick = function () { takeRule(node.id); };
    var keep = document.createElement("button");
    keep.type = "button";
    keep.className = "btn small";
    keep.textContent = TXT.hr_keep;
    keep.onclick = function () { keepAsIs(node.id); };
    go.appendChild(take);
    go.appendChild(keep);
    tip.appendChild(go);
    box.appendChild(tip);
  }

  // Taken before the paper sees it, as the + is (13-hand-more.js): a press
  // on the mark is not the start of a drag, nor a click on the paper.
  function ruleDotAt(ev) {
    return byHand && ev.target && ev.target.closest
           ? ev.target.closest("#chart .rule-dot") : null;
  }
  document.addEventListener("pointerdown", function (ev) {
    if (ruleDotAt(ev)) { ev.stopPropagation(); }
  }, true);
  document.addEventListener("click", function (ev) {
    var dot = ruleDotAt(ev);
    if (!dot) { return; }
    ev.stopPropagation();
    ev.preventDefault();
    ruleMenu(+dot.dataset.hint, ev.clientX, ev.clientY);
  }, true);
