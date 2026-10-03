// ---------------------------------------------------------------------------
//  40-web.js -- a program that opens a website opens it here, in the run's
//  own tape: a small browser, its address over it, to make bigger or to
//  open in a tab of its own
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "Update the Flowchart running things so if there
  // is a way that it opens a site like a browser the website can do that
  // internally too in the run area")
  //
  // Written in pseudocode -- Open "https://…", Go to, Visit, Browse -- or in
  // a language's own way: Python's webbrowser.open(…), JavaScript's
  // window.open(…), C#'s Process.Start(…), Java's Desktop…browse(…), C++'s
  // system("start …"), Kotlin's and Swift's.  The runner (14-run.js) did
  // not know any of them: "could not do this line".  Now the page opens in
  // the tape, where the program's words are.  Some sites will not be shown
  // inside another page (they say so to the browser, and it shows a blank
  // or an error); the button beside the address opens it in a tab of its
  // own, and in the desktop app (native/) every site opens in place.
  var WEB_SAID = /^\s*(?:open|browse(?:\s+to)?|visit|go\s+to|navigate\s+to|launch|show)\s+(?:the\s+)?(?:website|web\s*site|site|web\s*page|page|url|link|browser(?:\s+(?:at|to|on))?)?\s*(?:at|to)?\s*(.+?)\s*;?\s*$/i;
  var WEB_CALL = /(?:webbrowser\.open(?:_new(?:_tab)?)?|window\.open|window\.location(?:\.href)?\s*=|location\.assign|open_url|openUrl|OpenURL|launchUrl|Process\.Start|browse|ShellExecute(?:A|W)?|UIApplication\.shared\.open|NSWorkspace\.shared\.open|startActivity|xdg-open|system)\s*\(?\s*(.+?)\)?\s*;?\s*$/i;
  function webLooksLikeUrl(s) {
    return /^(?:https?:\/\/?|www\.)\S+$/i.test(s) || /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(s);
  }
  // The address a step asks for: a word that is an address, or a string
  // with one in it -- or else what its expression comes to, when it is run.
  function webAsked(item) {
    var text = String(item.text || "").trim();
    if (!text) { return null; }
    var said = WEB_SAID.exec(text), m;
    if (said) {
      var rest = said[1].replace(/^\((.*)\)$/, "$1").trim();
      var bare = rest.replace(/^["'`](.*)["'`]$/, "$1");
      if (webLooksLikeUrl(bare)) { return { url: bare }; }
      // Open site_name: what the name holds -- but only a name, or a string
      if (/^["'\x60]/.test(rest) ||/^[A-Za-z_][\w.]*$/.test(rest)) { return { expr: rest }; }
      return null;
    }
    if ((m = WEB_CALL.exec(text))) {
      // the first address written in it, wherever it is: inside new URI(…),
      // a ProcessStartInfo, "start https://…" for a shell
      var lit = /["'`]((?:https?:\/\/|www\.)[^"'`\s]+)["'`]?/i.exec(m[1]) || /((?:https?:\/\/|www\.)[^\s"'`)]+)/i.exec(m[1]);
      if (lit) { return { url: lit[1] }; }
      var arg = m[1].replace(/^new\s+URI\s*\(/i, "").replace(/^URI\.create\s*\(/i, "").replace(/^Uri\.parse\s*\(/i, "")
                    .replace(/^URL\s*\(\s*string\s*:\s*/i, "").replace(/\)+$/, "").split(",")[0].trim();
      if (/^[A-Za-z_][\w.]*$/.test(arg) && !/^(true|false|null|none)$/i.test(arg)) { return { expr: arg }; }
    }
    return null;
  }
  function webAddress(raw) {
    var s = String(raw === undefined || raw === null ? "" : raw).trim().replace(/^["'`](.*)["'`]$/, "$1");
    s = s.replace(/^(https?:)\/(?!\/)/i, "$1//");      // (a reading that lost one of its slashes)
    if (/^www\./i.test(s) || (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(s) && !/^https?:/i.test(s))) { s = "https://" + s; }
    return /^https?:\/\/[^\s]+$/i.test(s) ? s : null;
  }
  var WEB_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.2"/><path d="M2.8 10h14.4M10 2.8c2 2 3 4.4 3 7.2s-1 5.2-3 7.2c-2-2-3-4.4-3-7.2s1-5.2 3-7.2z"/></svg>';
  var WEB_BIG = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 3.5h4.5V8M8 16.5H3.5V12M16.5 3.5 11 9M3.5 16.5 9 11"/></svg>';
  var WEB_OUT = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M11.5 3.5h5v5M16.5 3.5 9 11M14 11.5v4.2a.8.8 0 0 1-.8.8H4.3a.8.8 0 0 1-.8-.8V6.8a.8.8 0 0 1 .8-.8H8.5"/></svg>';
  // The page, in the tape.
  function webShow(url) {
    var box = el("#tape");
    if (!box) { return; }
    var card = document.createElement("div");
    card.className = "said web-card";
    card.innerHTML = '<div class="web-bar"><span class="web-ico">' + WEB_ICON + '</span><span class="web-url"></span>' +
                     '<button type="button" class="web-btn web-big">' + WEB_BIG + '</button>' +
                     '<a class="web-btn web-out" target="_blank" rel="noopener noreferrer">' + WEB_OUT + '</a></div>' +
                     '<div class="web-view"><iframe class="web-frame" referrerpolicy="no-referrer" ' +
                     'sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"></iframe>' +
                     '<div class="web-wait"></div></div><div class="web-note"></div>';
    var frame = el(".web-frame", card), bar = el(".web-url", card), big = el(".web-big", card), out = el(".web-out", card);
    bar.textContent = url.replace(/^https?:\/\//i, "");
    bar.title = url;
    out.href = url;
    out.title = TXT.wb_out; out.setAttribute("aria-label", TXT.wb_out);
    big.title = TXT.wb_big; big.setAttribute("aria-label", TXT.wb_big);
    el(".web-wait", card).textContent = TXT.wb_loading;
    el(".web-note", card).textContent = typeof NATIVE_APP !== "undefined" && NATIVE_APP ? "" : TXT.wb_note;
    frame.title = url;
    frame.addEventListener("load", function () { card.classList.add("loaded"); });
    // a site that never answers: said so, and the tab offered
    setTimeout(function () { if (!card.classList.contains("loaded")) { card.classList.add("slow"); el(".web-wait", card).textContent = TXT.wb_slow; } }, 9000);
    big.onclick = function () {
      var on = !card.classList.contains("big");
      card.classList.toggle("big", on);
      big.title = on ? TXT.wb_small : TXT.wb_big;
      big.setAttribute("aria-pressed", on ? "true" : "false");
    };
    card.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && card.classList.contains("big")) { big.click(); ev.stopPropagation(); } });
    frame.src = url;
    box.appendChild(card);
    if (typeof tapeToEnd === "function") { tapeToEnd(); }
    return card;
  }
  // A step that opens a website: opened, not "could not do this line".
  if (typeof doStep === "function") {
    var doStepNoWeb = doStep;
    doStep = async function (item, where, back) {
      var asked = !back && item && item.op !== "display" && item.op !== "input" ? webAsked(item) : null;
      if (!asked) { return doStepNoWeb.apply(this, arguments); }
      var raw = asked.url;
      if (raw === undefined) {
        try { raw = await value(asked.expr, where); } catch (e) { return doStepNoWeb.apply(this, arguments); }
      }
      var url = webAddress(raw);
      if (!url) {
        // (Open door, in a story: a name that holds no address is not a website)
        if (asked.url === undefined) { return doStepNoWeb.apply(this, arguments); }
        if (!quiet) { talk(say("wb_bad", { what: String(raw) }), "bad"); }
        return;
      }
      if (!quiet) {
        talk(say("wb_opened", { url: url.replace(/^https?:\/\//i, "") }), "note");
        webShow(url);
      }
    };
  }
