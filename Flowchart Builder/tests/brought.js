// ---------------------------------------------------------------------------
//  brought.js -- flowcharts brought in from elsewhere, read back
//
//  Run by tests/run.py where node is installed.  The readers are lifted
//  straight out of flowchart/ui/js/19-diagrams.js, 19-picture.js and
//  19-import.js, so what is checked is the code the page runs: a file from
//  each program the page opens -- draw.io (written out and packed), Excalidraw,
//  Visio, yEd, Graphviz, PlantUML, a Lucidchart CSV, Flowgorithm -- read into
//  shapes and arrows; and pictures of flowcharts, drawn here in the styles the
//  websites draw them in, looked at the way the page looks at a picture.
//  (Reading the words in a picture needs a browser and is not checked here.)
//
//      node tests/brought.js          prints what passed, or what did not
// ---------------------------------------------------------------------------
var fs = require("fs"), path = require("path"), zlib = require("zlib");

function part(name) {
  return fs.readFileSync(path.join(__dirname, "..", "flowchart", "ui", "js", name), "utf8");
}

// The page around the readers: only what they ask of it.
var TXT = { start: "Start", end: "End", yes: "True", no: "False", yes_plain: "Yes",
            no_plain: "No" };
function say(key, fill) {                             // eslint-disable-line no-unused-vars
  var out = TXT[key] || key;
  for (var name in (fill || {})) { out = out.split("{" + name + "}").join(fill[name]); }
  return out;
}
function el() { return null; }                        // eslint-disable-line no-unused-vars
function all() { return []; }                         // eslint-disable-line no-unused-vars
var LANG = "en";                                      // eslint-disable-line no-unused-vars
var HAND_GRID = 5;                                    // eslint-disable-line no-unused-vars
var ROOM = { oval: 1, rect: 1, roundrect: 1, io: 1, io_back: 1, diamond: 1, hex: 1,
             sub: 1, trap: 1, manual: 1, doc: 1, docs: 1, note: 1, card: 1, loop: 1,
             store: 1, stored: 1, delay: 1, screen: 1, circle: 1, offpage: 1,
             parallel: 1, cloud: 1, arrow: 1, text: 1, actor: 1, callout: 1, cube: 1,
             step: 1, table: 1 };
function decideNow() { return "tf"; }                 // eslint-disable-line no-unused-vars
function endsKind(k) { return k === "oval" || k === "circle"; }   // eslint-disable-line no-unused-vars

eval(part("19-mermaid.js"));                          // eslint-disable-line no-eval
eval(part("19-diagrams.js"));                         // eslint-disable-line no-eval
eval(part("19-picture.js"));                          // eslint-disable-line no-eval

var bad = [], good = [];
function expect(what, ok, detail) {
  if (ok) { good.push(what); } else { bad.push(what + (detail ? ": " + detail : "")); }
}

// A graph said shortly: its shapes as kind "words", its arrows as a -> b.
function shortly(g) {
  var byKey = {};
  g.nodes.forEach(function (n) { byKey[n.key] = n; });
  return {
    shapes: g.nodes.map(function (n) { return n.kind + ' "' + flatWords(n.text) + '"'; }),
    arrows: g.links.map(function (l) {
      return flatWords(byKey[l.from].text) + " -> " + flatWords(byKey[l.to].text) +
             (l.label ? " [" + flatWords(l.label) + "]" : "");
    })
  };
}
function same(a, b) { return JSON.stringify(a.slice().sort()) === JSON.stringify(b.slice().sort()); }

// ============================================================ the files ==
var jobs = [];

// ---- draw.io, written out
var DRAWIO = [
  '<mxfile host="app.diagrams.net"><diagram id="d1" name="Page-1"><mxGraphModel dx="800" dy="600" background="#FFFFFF">',
  '<root><mxCell id="0"/><mxCell id="1" parent="0"/>',
  '<mxCell id="a" value="Start" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="100" y="20" width="120" height="50" as="geometry"/></mxCell>',
  '<mxCell id="b" value="&lt;div&gt;Input&lt;/div&gt;&lt;div&gt;age&lt;/div&gt;" style="shape=parallelogram;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="100" y="110" width="120" height="50" as="geometry"/></mxCell>',
  '<mxCell id="c" value="age &amp;gt;= 18?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="100" y="200" width="120" height="80" as="geometry"/></mxCell>',
  '<mxCell id="d" value="Display &quot;Adult&quot;" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="300" y="210" width="120" height="60" as="geometry"/></mxCell>',
  '<mxCell id="e" value="End" style="shape=mxgraph.flowchart.terminator;whiteSpace=wrap;html=1;" vertex="1" parent="1"><mxGeometry x="100" y="330" width="120" height="50" as="geometry"/></mxCell>',
  '<mxCell id="f" value="" style="endArrow=classic;html=1;" edge="1" parent="1" source="a" target="b"><mxGeometry relative="1" as="geometry"/></mxCell>',
  '<mxCell id="g" style="edgeStyle=orthogonalEdgeStyle;" edge="1" parent="1" source="b" target="c"><mxGeometry relative="1" as="geometry"/></mxCell>',
  '<mxCell id="h" value="Yes" style="endArrow=classic;strokeColor=#FF0000;" edge="1" parent="1" source="c" target="d"><mxGeometry relative="1" as="geometry"/></mxCell>',
  '<mxCell id="i" style="endArrow=classic;" edge="1" parent="1" source="c" target="e"><mxGeometry relative="1" as="geometry"/></mxCell>',
  '<mxCell id="i2" value="No" style="edgeLabel;html=1;" vertex="1" connectable="0" parent="i"><mxGeometry x="-0.2" relative="1" as="geometry"/></mxCell>',
  '<mxCell id="j" style="endArrow=classic;" edge="1" parent="1" source="d" target="e"><mxGeometry relative="1" as="geometry"/></mxCell>',
  '</root></mxGraphModel></diagram></mxfile>'].join("");
jobs.push(graphOf("drawio", DRAWIO).then(function (g) {
  var s = shortly(graphCleaned(g));
  expect("draw.io: shapes", same(s.shapes, ['oval "Start"', 'io "Input age"', 'diamond "age >= 18?"',
                                           'rect "Display "Adult""', 'oval "End"']), JSON.stringify(s.shapes));
  expect("draw.io: arrows", same(s.arrows, ["Start -> Input age", "Input age -> age >= 18?",
                                           "age >= 18? -> Display \"Adult\" [Yes]", "age >= 18? -> End [No]",
                                           "Display \"Adult\" -> End"]), JSON.stringify(s.arrows));
  var dia = g.nodes.filter(function (n) { return n.kind === "diamond"; })[0];
  expect("draw.io: colors and bold", dia.look.fill === "#fff2cc" && dia.look.line === "#d6b656" && dia.look.bold);
  expect("draw.io: arrow color", g.ink === "#ff0000" || g.ink === "", g.ink);
}));

// ---- draw.io, packed the way it saves by default
var model = /<mxGraphModel[\s\S]*<\/mxGraphModel>/.exec(DRAWIO)[0];
var packed = zlib.deflateRawSync(Buffer.from(encodeURIComponent(model))).toString("base64");
jobs.push(graphOf("drawio", '<mxfile><diagram id="x" name="P">' + packed + "</diagram></mxfile>").then(function (g) {
  expect("draw.io packed: read", g && g.nodes.length === 5 && g.links.length === 5,
         g ? g.nodes.length + " shapes " + g.links.length + " arrows" : "nothing");
}));

// ---- Excalidraw
var EXCALI = JSON.stringify({ type: "excalidraw", version: 2, appState: { viewBackgroundColor: "#ffffff" }, elements: [
  { id: "r1", type: "rectangle", x: 0, y: 0, width: 160, height: 60, strokeColor: "#1971c2", backgroundColor: "#a5d8ff", strokeWidth: 2, roundness: { type: 3 }, boundElements: [{ id: "t1", type: "text" }] },
  { id: "t1", type: "text", x: 20, y: 20, width: 120, height: 25, text: "Get the\nnumber", originalText: "Get the\nnumber", containerId: "r1", fontFamily: 1, strokeColor: "#1e1e1e" },
  { id: "d1", type: "diamond", x: 0, y: 120, width: 160, height: 90, strokeColor: "#e03131", backgroundColor: "transparent", strokeWidth: 4 },
  { id: "t2", type: "text", x: 40, y: 150, width: 80, height: 25, text: "Even?", containerId: "d1", fontFamily: 1 },
  { id: "e1", type: "ellipse", x: 0, y: 280, width: 160, height: 60, strokeColor: "#1e1e1e", backgroundColor: "#b2f2bb", strokeWidth: 1, strokeStyle: "dashed" },
  { id: "t3", type: "text", x: 40, y: 300, width: 80, height: 25, text: "Done", containerId: "e1", fontFamily: 1 },
  { id: "a1", type: "arrow", x: 80, y: 60, width: 0, height: 60, points: [[0, 0], [0, 60]], startBinding: { elementId: "r1" }, endBinding: { elementId: "d1" }, endArrowhead: "arrow", strokeColor: "#1e1e1e" },
  { id: "a2", type: "arrow", x: 80, y: 210, width: 0, height: 70, points: [[0, 0], [0, 70]], startBinding: { elementId: "d1" }, endBinding: { elementId: "e1" }, endArrowhead: "arrow", strokeColor: "#1e1e1e" },
  { id: "t4", type: "text", x: 90, y: 235, width: 30, height: 20, text: "yes", fontFamily: 1 },
  { id: "x9", type: "rectangle", x: 999, y: 999, width: 5, height: 5, isDeleted: true }
] });
jobs.push(graphOf("excalidraw", EXCALI).then(function (g) {
  var c = graphCleaned(g), s = shortly(c);
  expect("Excalidraw: shapes", same(s.shapes, ['roundrect "Get the number"', 'diamond "Even?"', 'oval "Done"']),
         JSON.stringify(s.shapes));
  expect("Excalidraw: arrows, loose word on the arrow", same(s.arrows, ["Get the number -> Even?", "Even? -> Done [yes]"]),
         JSON.stringify(s.arrows));
  var d = g.nodes.filter(function (n) { return n.kind === "diamond"; })[0];
  var o = g.nodes.filter(function (n) { return n.kind === "oval"; })[0];
  expect("Excalidraw: looks", d.look.line === "#e03131" && d.look.weight === "thick" && !d.look.fill &&
         o.look.dash && o.look.weight === "thin" && g.face === "hand", JSON.stringify([d.look, o.look, g.face]));
}));

// ---- Excalidraw inside a PNG: the scene, squeezed, in a tEXt note
function pngWith(notes) {
  function chunk(type, data) {
    var len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    var body = Buffer.concat([Buffer.from(type, "latin1"), data]);
    var crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32 ? zlib.crc32(body) >>> 0 : 0);
    return Buffer.concat([len, body, crc]);
  }
  var head = Buffer.alloc(13); head.writeUInt32BE(1, 0); head.writeUInt32BE(1, 4); head[8] = 8; head[9] = 2;
  var parts = [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", head)];
  Object.keys(notes).forEach(function (k) {
    parts.push(chunk("tEXt", Buffer.concat([Buffer.from(k, "latin1"), Buffer.from([0]), Buffer.from(notes[k], "latin1")])));
  });
  parts.push(chunk("IDAT", zlib.deflateSync(Buffer.from([0, 255, 255, 255]))), chunk("IEND", Buffer.alloc(0)));
  return new Uint8Array(Buffer.concat(parts));
}
var squeezed = zlib.deflateSync(Buffer.from(EXCALI, "utf8"));
var wrapper = JSON.stringify({ version: "1", encoding: "bstring", compressed: true,
                               encoded: squeezed.toString("latin1") });
jobs.push(pngNotes(pngWith({ "application/vnd.excalidraw+json": wrapper })).then(function (notes) {
  return excalidrawScene(notes["application/vnd.excalidraw+json"]);
}).then(function (scene) {
  expect("Excalidraw PNG: scene inside", scene && scene.elements.length === 10);
}));
jobs.push(pngNotes(pngWith({ mxfile: encodeURIComponent(DRAWIO) })).then(function (notes) {
  expect("draw.io PNG: drawing inside", decodeURIComponent(notes.mxfile) === DRAWIO);
}));

// ---- yEd GraphML
var GRAPHML = [
  '<?xml version="1.0" encoding="UTF-8"?><graphml xmlns:y="http://www.yworks.com/xml/graphml">',
  '<key for="node" id="d6" yfiles.type="nodegraphics"/><key for="edge" id="d10" yfiles.type="edgegraphics"/>',
  '<graph edgedefault="directed" id="G">',
  '<node id="n0"><data key="d6"><y:GenericNode configuration="com.yworks.flowchart.terminator"><y:Geometry height="40" width="90" x="0" y="0"/><y:Fill color="#E8EEF7"/><y:BorderStyle color="#000000" type="line" width="1.0"/><y:NodeLabel textColor="#000000">Begin</y:NodeLabel></y:GenericNode></data></node>',
  '<node id="n1"><data key="d6"><y:GenericNode configuration="com.yworks.flowchart.decision"><y:Geometry height="60" width="90" x="0" y="100"/><y:Fill color="#FFCC00"/><y:NodeLabel fontStyle="bold">OK?</y:NodeLabel></y:GenericNode></data></node>',
  '<node id="n2"><data key="d6"><y:ShapeNode><y:Geometry height="40" width="90" x="150" y="110"/><y:Shape type="roundrectangle"/><y:NodeLabel>Fix it</y:NodeLabel></y:ShapeNode></data></node>',
  '<edge id="e0" source="n0" target="n1"><data key="d10"><y:PolyLineEdge><y:Arrows source="none" target="standard"/></y:PolyLineEdge></data></edge>',
  '<edge id="e1" source="n1" target="n2"><data key="d10"><y:PolyLineEdge><y:LineStyle color="#3366FF"/><y:Arrows source="none" target="standard"/><y:EdgeLabel>no</y:EdgeLabel></y:PolyLineEdge></data></edge>',
  '</graph></graphml>'].join("");
jobs.push(graphOf("graphml", GRAPHML).then(function (g) {
  var s = shortly(graphCleaned(g));
  expect("yEd: shapes", same(s.shapes, ['oval "Begin"', 'diamond "OK?"', 'roundrect "Fix it"']), JSON.stringify(s.shapes));
  expect("yEd: arrows", same(s.arrows, ["Begin -> OK?", "OK? -> Fix it [no]"]), JSON.stringify(s.arrows));
  expect("yEd: placed and colored", g.placed && g.nodes[1].look.fill === "#ffcc00" && g.nodes[1].look.bold);
}));

// ---- Graphviz
var DOT = [
  "// a comment",
  "digraph Flow {",
  "  rankdir=TB; bgcolor=\"#fafafa\";",
  "  node [shape=box, style=\"rounded,filled\", fillcolor=lightyellow];",
  "  start [label=\"Start\", shape=ellipse];",
  "  ask [label=\"Input n\", shape=parallelogram];",
  "  q [label=<n &gt; 0<BR/>?>, shape=diamond, fillcolor=\"#ffcccc\", color=red];",
  "  pos [label=\"Display \\\"positive\\\"\"];",
  "  stop [shape=oval];",
  "  start -> ask -> q;",
  "  q -> pos [label=\"yes\"];",
  "  q -> stop [label=\"no\", color=blue];",
  "  pos -> stop;",
  "  { rank=same; pos }",
  "}"].join("\n");
jobs.push(graphOf("dot", DOT).then(function (g) {
  var s = shortly(graphCleaned(g));
  expect("Graphviz: shapes", same(s.shapes, ['oval "Start"', 'io "Input n"', 'diamond "n > 0 ?"',
                                            'roundrect "Display "positive""', 'oval "stop"']), JSON.stringify(s.shapes));
  expect("Graphviz: arrows", same(s.arrows, ["Start -> Input n", "Input n -> n > 0 ?", "n > 0 ? -> Display \"positive\" [yes]",
                                            "n > 0 ? -> stop [no]", "Display \"positive\" -> stop"]), JSON.stringify(s.arrows));
  var q = g.nodes.filter(function (n) { return n.kind === "diamond"; })[0];
  expect("Graphviz: colors", q.look.fill === "#ffcccc" && q.look.line === "#ff0000" && g.paper === "#fafafa",
         JSON.stringify(q.look) + " " + g.paper);
}));

// ---- PlantUML
var UML = [
  "@startuml", "title Guessing", "start", ":Pick a number;", "repeat", "  #lightblue:Input guess;",
  "  if (guess > number?) then (yes)", "    :Display \"Too high\";", "  elseif (guess < number?) then (yes)",
  "    :Display \"Too low\";", "  else (no)", "    :Display \"Right!\";", "  endif",
  "repeat while (guess <> number?) is (yes) not (no)", "stop", "@enduml"].join("\n");
jobs.push(graphOf("plantuml", UML).then(function (g) {
  var s = shortly(graphCleaned(g));
  expect("PlantUML: shapes", same(s.shapes, ['oval "Start"', 'rect "Pick a number"', 'io "Input guess"',
    'diamond "guess > number?"', 'diamond "guess < number?"', 'io "Display "Too high""', 'io "Display "Too low""',
    'io "Display "Right!""', 'diamond "guess <> number?"', 'oval "End"']), JSON.stringify(s.shapes));
  var want = ["Start -> Pick a number", "Pick a number -> Input guess", "Input guess -> guess > number?",
    "guess > number? -> Display \"Too high\" [yes]", "guess > number? -> guess < number? [No]",
    "guess < number? -> Display \"Too low\" [yes]", "guess < number? -> Display \"Right!\" [no]",
    "Display \"Too high\" -> guess <> number?", "Display \"Too low\" -> guess <> number?",
    "Display \"Right!\" -> guess <> number?", "guess <> number? -> Input guess [yes]", "guess <> number? -> End [no]"];
  expect("PlantUML: arrows", same(s.arrows, want), JSON.stringify(s.arrows));
  var guess = g.nodes.filter(function (n) { return n.text === "Input guess"; })[0];
  expect("PlantUML: a step's own color", guess && guess.look.fill === "#add8e6");
}));

// ---- Lucidchart CSV
var LUCID = [
  "Id,Name,Shape Library,Page ID,Contained By,Group,Line Source,Line Destination,Source Arrow,Destination Arrow,Status,Text Area 1,Text Area 2",
  "1,Page,,,,,,,,,,Page 1,",
  "2,Terminator,Flowchart Shapes,1,,,,,,,,Start,",
  "3,Process,Flowchart Shapes,1,,,,,,,,\"Set total = 0\",",
  "4,Decision,Flowchart Shapes,1,,,,,,,,More?,",
  "5,Line,,1,,,2,3,None,Arrow,,,",
  "6,Line,,1,,,3,4,None,Arrow,,,",
  "7,Line,,1,,,3,4,Arrow,None,,back,"].join("\r\n");
jobs.push(graphOf("lucid", LUCID).then(function (g) {
  var s = shortly(graphCleaned(g));
  expect("Lucidchart CSV", same(s.shapes, ['oval "Start"', 'rect "Set total = 0"', 'diamond "More?"']) &&
         same(s.arrows, ["Start -> Set total = 0", "Set total = 0 -> More?", "More? -> Set total = 0 [back]"]),
         JSON.stringify(s));
}));

// ---- Flowgorithm, as pseudocode
var FPRG = [
  '<?xml version="1.0"?><flowgorithm fileversion="3.0"><attributes><attribute name="name" value="Ages"/></attributes>',
  '<function name="Main" type="None" variable=""><parameters/><body>',
  '<declare name="age, i" type="Integer" array="False" size=""/>',
  '<output expression="&quot;How old &amp; tall?&quot;" newline="True"/>',
  '<input variable="age"/>',
  '<if expression="age &gt;= 18 &amp;&amp; age &lt; 65"><then><output expression="&quot;Adult&quot; &amp; age" newline="True"/></then><else/></if>',
  '<for variable="i" start="10" end="1" direction="dec" step="1"><output expression="i" newline="True"/></for>',
  '<while expression="age &gt; 0"><assign variable="age" expression="age - 10"/></while>',
  '<do expression="age &lt; 5"><assign variable="age" expression="age + 1"/></do>',
  '<call expression="Greet(age)"/>',
  '</body></function>',
  '<function name="Twice" type="Integer" variable="r"><parameters><parameter name="n" type="Integer" array="False"/></parameters><body><assign variable="r" expression="n * 2"/></body></function>',
  '<function name="Greet" type="None" variable=""><parameters><parameter name="who" type="Integer" array="False"/></parameters><body><output expression="who" newline="True"/></body></function>',
  '</flowgorithm>'].join("");
var fp = fprgPseudo(FPRG);
var FP_WANT = ["Start", "Declare Integer age", "Declare Integer i", "Display \"How old & tall?\"", "Input age",
  "If age >= 18 && age < 65 Then", "    Display \"Adult\" + age", "End If", "For i = 10 To 1 Step -1",
  "    Display i", "End For", "While age > 0", "    age = age - 10", "End While", "Do", "    age = age + 1",
  "Loop While age < 5", "Call Greet(age)", "Stop", "", "Function Integer Twice(Integer n)", "    r = n * 2",
  "    Return r", "End Function", "", "Module Greet(Integer who)", "    Display who", "End Module", ""].join("\n");
expect("Flowgorithm: written as pseudocode", fp === FP_WANT, "\n" + fp);

// ---- which is which, by what the file says
expect("told apart by what they say",
       drawnIn("x.txt", DRAWIO) === "drawio" && drawnIn("x.json", EXCALI) === "excalidraw" &&
       drawnIn("x.xml", GRAPHML) === "graphml" && drawnIn("x.txt", DOT) === "dot" &&
       drawnIn("x.txt", UML) === "plantuml" && drawnIn("x.csv", LUCID) === "lucid" &&
       drawnIn("x.xml", FPRG) === "flowgorithm" && drawnIn("x.txt", "graph TD\nA-->B") === "mermaid" &&
       drawnIn("x.md", "# Hi\n\n```mermaid\nflowchart LR\n  a --> b\n```\n") === "markdown" &&
       drawnIn("x.txt", "Start\nDisplay \"hi\"\nStop") === "" && drawnIn("notes.md", "# Notes") === "");

// ---- Visio: a .vsdx is a zip of XML
function zipped(files) {                     // stored and deflated, as a real zip mixes them
  var locals = [], dir = [], at = 0;
  Object.keys(files).forEach(function (name, k) {
    var raw = Buffer.from(files[name], "utf8"), squeeze = k % 2 === 0;
    var data = squeeze ? zlib.deflateRawSync(raw) : raw, nameB = Buffer.from(name);
    var h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(squeeze ? 8 : 0, 8);
    h.writeUInt32LE(data.length, 18); h.writeUInt32LE(raw.length, 22); h.writeUInt16LE(nameB.length, 26);
    var c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(squeeze ? 8 : 0, 10);
    c.writeUInt32LE(data.length, 20); c.writeUInt32LE(raw.length, 24); c.writeUInt16LE(nameB.length, 28);
    c.writeUInt32LE(at, 42);
    locals.push(h, nameB, data); dir.push(c, nameB);
    at += 30 + nameB.length + data.length;
  });
  var dirB = Buffer.concat(dir), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(Object.keys(files).length, 8);
  end.writeUInt16LE(Object.keys(files).length, 10); end.writeUInt32LE(dirB.length, 12); end.writeUInt32LE(at, 16);
  return new Uint8Array(Buffer.concat(locals.concat([dirB, end])));
}
var VSDX = zipped({
  "visio/masters/masters.xml": "<Masters><Master ID='2' NameU='Start/End'/><Master ID='3' NameU='Decision'/><Master ID='4' NameU='Process'/><Master ID='5' NameU='Dynamic connector'/></Masters>",
  "visio/pages/page1.xml": ["<PageContents><Shapes>",
    "<Shape ID='1' Master='2' Type='Shape'><Cell N='PinX' V='2'/><Cell N='PinY' V='8'/><Cell N='Width' V='1.5'/><Cell N='Height' V='0.5'/><Cell N='FillForegnd' V='#c6e0b4'/><Text>Begin</Text></Shape>",
    "<Shape ID='2' Master='3' Type='Shape'><Cell N='PinX' V='2'/><Cell N='PinY' V='6.5'/><Cell N='Width' V='1.5'/><Cell N='Height' V='1'/><Text>Ready?</Text></Shape>",
    "<Shape ID='3' Type='Shape'><Cell N='PinX' V='4'/><Cell N='PinY' V='6.5'/><Cell N='Width' V='1.5'/><Cell N='Height' V='0.75'/>",
    "<Section N='Geometry' IX='0'><Row T='MoveTo' IX='1'><Cell N='X' V='0.2'/><Cell N='Y' V='0'/></Row><Row T='LineTo' IX='2'><Cell N='X' V='1.5'/><Cell N='Y' V='0'/></Row>",
    "<Row T='LineTo' IX='3'><Cell N='X' V='1.3'/><Cell N='Y' V='0.75'/></Row><Row T='LineTo' IX='4'><Cell N='X' V='0'/><Cell N='Y' V='0.75'/></Row><Row T='LineTo' IX='5'><Cell N='X' V='0.2'/><Cell N='Y' V='0'/></Row></Section>",
    "<Text>Wait</Text></Shape>",
    "<Shape ID='4' Master='5' Type='Shape'><Cell N='BeginX' V='2'/><Cell N='BeginY' V='7.75'/><Cell N='EndX' V='2'/><Cell N='EndY' V='7'/><Cell N='EndArrow' V='13'/></Shape>",
    "<Shape ID='5' Master='5' Type='Shape'><Cell N='BeginX' V='2.75'/><Cell N='BeginY' V='6.5'/><Cell N='EndX' V='3.25'/><Cell N='EndY' V='6.5'/><Text>No</Text></Shape>",
    "</Shapes><Connects><Connect FromSheet='4' FromCell='BeginX' ToSheet='1'/><Connect FromSheet='4' FromCell='EndX' ToSheet='2'/>",
    "<Connect FromSheet='5' FromCell='BeginX' ToSheet='2'/><Connect FromSheet='5' FromCell='EndX' ToSheet='3'/></Connects></PageContents>"].join("")
});
if (typeof unzipList === "function") {
  jobs.push(visioGraph(VSDX).then(function (g) {
    var s = shortly(graphCleaned(g));
    expect("Visio: shapes", same(s.shapes, ['oval "Begin"', 'diamond "Ready?"', 'io "Wait"']), JSON.stringify(s.shapes));
    expect("Visio: arrows", same(s.arrows, ["Begin -> Ready?", "Ready? -> Wait [No]"]), JSON.stringify(s.arrows));
    expect("Visio: colors and places", g.nodes[0].look.fill === "#c6e0b4" && g.nodes[0].y < g.nodes[1].y);
  }));
}

// ========================================================== pictures ==
// A picture drawn here the way a website draws one: every edge smoothed, as
// a browser smooths it, by working out how much of each pixel a shape
// covers from sixteen points inside it.
function Picture(w, h, paper) {
  this.w = w; this.h = h;
  this.data = new Uint8ClampedArray(w * h * 4);
  for (var i = 0; i < w * h; i++) {
    this.data[i * 4] = paper[0]; this.data[i * 4 + 1] = paper[1];
    this.data[i * 4 + 2] = paper[2]; this.data[i * 4 + 3] = 255;
  }
}
// `inside(x, y)` for points; painted over its box in `color`
Picture.prototype.cover = function (box, inside, color) {
  var x0 = Math.max(0, Math.floor(box[0])), y0 = Math.max(0, Math.floor(box[1]));
  var x1 = Math.min(this.w - 1, Math.ceil(box[2])), y1 = Math.min(this.h - 1, Math.ceil(box[3]));
  for (var y = y0; y <= y1; y++) {
    for (var x = x0; x <= x1; x++) {
      var n = 0;
      for (var sy = 0; sy < 4; sy++) {
        for (var sx = 0; sx < 4; sx++) { if (inside(x + (sx + 0.5) / 4, y + (sy + 0.5) / 4)) { n++; } }
      }
      if (!n) { continue; }
      var a = n / 16, at = (y * this.w + x) * 4;
      for (var c = 0; c < 3; c++) { this.data[at + c] = Math.round(this.data[at + c] * (1 - a) + color[c] * a); }
    }
  }
};
function segGap(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
  var t = len ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len)) : 0;
  return Math.hypot(ax + t * dx - px, ay + t * dy - py);
}
function inPoly(pts, x, y) {
  var inside = false;
  for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    if ((pts[i][1] > y) !== (pts[j][1] > y) &&
        x < (pts[j][0] - pts[i][0]) * (y - pts[i][1]) / (pts[j][1] - pts[i][1]) + pts[i][0]) { inside = !inside; }
  }
  return inside;
}
function polyGap(pts, x, y) {
  var d = Infinity;
  for (var i = 0; i < pts.length; i++) {
    var a = pts[i], b = pts[(i + 1) % pts.length];
    d = Math.min(d, segGap(x, y, a[0], a[1], b[0], b[1]));
  }
  return d;
}
// A shape's outline, as a closed list of corners: ellipses and rounded
// corners walked round in small steps.
function outline(kind, cx, cy, w, h) {
  var l = cx - w / 2, r = cx + w / 2, t = cy - h / 2, b = cy + h / 2, pts = [], k, lean = w * 0.15;
  function arc(ax, ay, rx, ry, from, to) {
    for (k = 0; k <= 12; k++) {
      var an = from + (to - from) * k / 12;
      pts.push([ax + rx * Math.cos(an), ay + ry * Math.sin(an)]);
    }
  }
  switch (kind) {
    case "rect": case "sub": return [[l, t], [r, t], [r, b], [l, b]];
    case "diamond": return [[cx, t], [r, cy], [cx, b], [l, cy]];
    case "io": return [[l + lean, t], [r, t], [r - lean, b], [l, b]];
    case "hex": return [[l + lean, t], [r - lean, t], [r, cy], [r - lean, b], [l + lean, b], [l, cy]];
    case "oval":                              // a pill: half circles at each end
      arc(r - h / 2, cy, h / 2, h / 2, -Math.PI / 2, Math.PI / 2);
      arc(l + h / 2, cy, h / 2, h / 2, Math.PI / 2, 3 * Math.PI / 2);
      return pts;
    case "ellipse": arc(cx, cy, w / 2, h / 2, 0, 2 * Math.PI); pts.pop(); return pts;
    case "roundrect":
      var rr = Math.min(10, h / 4);
      arc(r - rr, t + rr, rr, rr, -Math.PI / 2, 0); arc(r - rr, b - rr, rr, rr, 0, Math.PI / 2);
      arc(l + rr, b - rr, rr, rr, Math.PI / 2, Math.PI); arc(l + rr, t + rr, rr, rr, Math.PI, 3 * Math.PI / 2);
      return pts;
  }
  return null;
}
// One shape: filled, bordered, a line of "words" across its middle (bars,
// the size and color of letters), and a bar down each side for a call.
Picture.prototype.shape = function (s, style) {
  var pts = outline(s.kind, s.x, s.y, s.w, s.h), lw = style.border;
  var box = [s.x - s.w / 2 - lw, s.y - s.h / 2 - lw, s.x + s.w / 2 + lw, s.y + s.h / 2 + lw];
  if (pts) { this.cover(box, function (x, y) { return inPoly(pts, x, y); }, s.fill || style.fill); }
  if (lw && pts) {
    this.cover(box, function (x, y) { return polyGap(pts, x, y) <= lw / 2; }, s.line || style.line);
    if (s.kind === "sub") {
      var l = s.x - s.w / 2 + 10, r = s.x + s.w / 2 - 10, t = s.y - s.h / 2, b = s.y + s.h / 2;
      this.cover(box, function (x, y) {
        return segGap(x, y, l, t, l, b) <= lw / 2 || segGap(x, y, r, t, r, b) <= lw / 2;
      }, s.line || style.line);
    }
  }
  if (s.kind === "store") {
    var lidH = s.h * 0.25, top = s.y - s.h / 2, foot = s.y + s.h / 2;
    var inCan = function (x, y) {
      var u = (x - s.x) / (s.w / 2);
      if (Math.abs(u) > 1) { return false; }
      var dip = Math.sqrt(1 - u * u) * lidH / 2;
      return y >= top + lidH / 2 - dip && y <= foot - lidH / 2 + dip;
    };
    var boxC = [s.x - s.w / 2 - lw, top - lw, s.x + s.w / 2 + lw, foot + lw];
    this.cover(boxC, inCan, style.fill);
    var edge = function (x, y) {
      var u = (x - s.x) / (s.w / 2), ew = s.w / 2, eh = lidH / 2;
      var e1 = Math.abs(Math.hypot((x - s.x) / ew, (y - (top + eh)) / eh) - 1) * Math.min(ew, eh);
      var lower = Math.abs(u) <= 1 && y > foot - eh ? Math.abs(Math.hypot((x - s.x) / ew, (y - (foot - eh)) / eh) - 1) * Math.min(ew, eh) : Infinity;
      var sides = Math.min(segGap(x, y, s.x - ew, top + eh, s.x - ew, foot - eh), segGap(x, y, s.x + ew, top + eh, s.x + ew, foot - eh));
      return Math.min(e1, lower, sides) <= lw / 2;
    };
    this.cover(boxC, edge, style.line);
  }
  if (s.words !== false) {
    var ink = style.words || style.line, n = Math.max(2, Math.round(s.w / 40)), y0 = s.y - 5, gw = 6;
    for (var i = 0; i < n; i++) {
      var gx = s.x - n * (gw + 3) / 2 + i * (gw + 3);
      this.cover([gx, y0, gx + gw, y0 + 10], function (x, y) {
        return (x - gx < 1.6 || y - y0 < 1.6 || y > y0 + 8.4);
      }, ink);
    }
  }
};
// An arrow: a line through `pts`, and at its end a head, filled or open.
Picture.prototype.arrow = function (pts, style, open) {
  var lw = style.lines || 1.5, color = style.arrows || style.line;
  var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  pts.forEach(function (p) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
  var a = pts[pts.length - 2], b = pts[pts.length - 1];
  var len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len;
  var hl = 10, hw = 5, baseX = b[0] - ux * hl, baseY = b[1] - uy * hl;
  var head = [[b[0], b[1]], [baseX - uy * hw, baseY + ux * hw], [baseX + uy * hw, baseY - ux * hw]];
  var shaft = pts.slice(0, -1).concat([[open ? b[0] : baseX, open ? b[1] : baseY]]);
  this.cover([x0 - 12, y0 - 12, x1 + 12, y1 + 12], function (x, y) {
    for (var i = 0; i + 1 < shaft.length; i++) {
      if (segGap(x, y, shaft[i][0], shaft[i][1], shaft[i + 1][0], shaft[i + 1][1]) <= lw / 2) { return true; }
    }
    if (open) {
      return segGap(x, y, head[0][0], head[0][1], head[1][0], head[1][1]) <= lw / 2 ||
             segGap(x, y, head[0][0], head[0][1], head[2][0], head[2][1]) <= lw / 2;
    }
    return inPoly(head, x, y);
  }, color);
};
// A word written beside an arrow: bars like letters, on a patch of its own
// color where the style puts one.
Picture.prototype.word = function (x, y, n, style) {
  if (style.labelBox) {
    this.cover([x - 4, y - 4, x + n * 9 + 2, y + 14], function () { return true; }, style.labelBox);
  }
  for (var i = 0; i < n; i++) {
    var gx = x + i * 9;
    this.cover([gx, y, gx + 6, y + 10], function (px, py) { return px - gx < 1.6 || py - y < 1.6; },
               style.words || style.line);
  }
};

// A flowchart: Start, a step, a question with two ways out, one of them
// back round to the step, and an End.
function chart(style, kinds) {
  kinds = kinds || {};
  var pic = new Picture(520, 560, style.paper);
  var S = [
    { key: "start", kind: kinds.start || "oval", x: 200, y: 50, w: 130, h: 44 },
    { key: "step", kind: kinds.step || "rect", x: 200, y: 150, w: 150, h: 56, fill: style.stepFill },
    { key: "ask", kind: "diamond", x: 200, y: 280, w: 170, h: 100, fill: style.askFill },
    { key: "tell", kind: kinds.tell || "io", x: 410, y: 280, w: 150, h: 56 },
    { key: "end", kind: kinds.end || "oval", x: 200, y: 420, w: 130, h: 44 }
  ];
  S.forEach(function (s) { pic.shape(s, style); });
  var b = style.border / 2 + 1;
  // where the tell's left side is, level with the question's point
  var side = S[3].kind === "io" ? 335 + S[3].w * 0.15 / 2 : 335;
  pic.arrow([[200, 72 + b], [200, 122 - b]], style);
  pic.arrow([[200, 178 + b], [200, 230 - b]], style, style.open);
  pic.arrow([[285 + b, 280], [side - b, 280]], style);
  pic.arrow([[200, 330 + b], [200, 398 - b]], style);
  // back round: from the tell up the right and into the step's right side
  pic.arrow([[410, 252 - b], [410, 150], [275 + b + 1, 150]], style);
  pic.word(292, 262, 3, style);                // Yes, over the arrow going right
  pic.word(210, 350, 2, style);                // No, beside the one going down
  return { pic: pic, shapes: S, want: [["start", "step"], ["step", "ask"], ["ask", "tell"],
                                       ["ask", "end"], ["tell", "step"]] };
}

function seenOf(one) {
  var seen = pictureRead({ width: one.pic.w, height: one.pic.h, data: one.pic.data });
  var found = seen.shapes.map(function (s) {
    var near = one.shapes.filter(function (t) { return Math.abs(t.x - s.cx) < 20 && Math.abs(t.y - s.cy) < 20; })[0];
    return { kind: s.kind, key: near ? near.key : "?", s: s };
  });
  var arrows = [];
  seen.nets.forEach(function (net) {
    net.links.forEach(function (l) { arrows.push(found[l.from].key + ">" + found[l.to].key); });
  });
  return { seen: seen, found: found, arrows: arrows };
}

function pictureCase(name, style, kinds, wantKinds, colors) {
  var one = chart(style, kinds), got = seenOf(one);
  var gotKinds = got.found.map(function (f) { return f.key + ":" + f.kind; });
  var want = one.shapes.map(function (s) { return s.key + ":" + (wantKinds[s.key] || s.kind); });
  expect("picture, " + name + ": shapes", same(gotKinds, want), JSON.stringify(gotKinds));
  var wantArrows = one.want.map(function (w) { return w[0] + ">" + w[1]; });
  expect("picture, " + name + ": arrows and which way", same(got.arrows, wantArrows), JSON.stringify(got.arrows));
  if (colors) { colors(got); }
  return got;
}

var BLACK = [0, 0, 0], WHITE = [255, 255, 255];
pictureCase("plain", { paper: WHITE, fill: WHITE, line: BLACK, border: 2 }, null, {});
pictureCase("thin lines, open heads", { paper: WHITE, fill: WHITE, line: [40, 40, 40], border: 1, lines: 1, open: true },
            null, {});
pictureCase("draw.io colors", {
  paper: WHITE, fill: [218, 232, 252], line: [108, 142, 191], border: 1.5, words: BLACK,
  askFill: [255, 242, 204], stepFill: [213, 232, 212], arrows: [51, 51, 51], lines: 1.2
}, { start: "roundrect", end: "roundrect" }, {}, function (got) {
  var ask = got.found.filter(function (f) { return f.key === "ask"; })[0];
  var hex = ask && hexRgb(ask.s.fill[0], ask.s.fill[1], ask.s.fill[2]);
  var line = ask && ask.s.line && hexRgb(ask.s.line[0], ask.s.line[1], ask.s.line[2]);
  expect("picture, draw.io colors: fill and border read", hex === "#fff2cc" && line && Math.abs(parseInt(line.slice(1, 3), 16) - 108) < 30,
         hex + " " + line);
  expect("picture, draw.io colors: arrows' color", got.seen.ink && Math.abs(got.seen.ink[0] - 51) < 30, JSON.stringify(got.seen.ink));
});
(function () {
  // Mermaid writes an arrow's words on a little grey box of their own.  The
  // boxes are seen as shapes; once their words are read they are the
  // arrows' words instead.
  var style = { paper: WHITE, fill: [236, 236, 255], line: [147, 112, 219], border: 1, words: [51, 51, 51],
                arrows: [51, 51, 51], lines: 2, labelBox: [232, 232, 232] };
  var one = chart(style, { start: "roundrect", end: "roundrect", tell: "hex" }), got = seenOf(one);
  var texts = got.seen.shapes.map(function (s, i) {
    var f = got.found[i];
    return f.key !== "?" ? f.key : s.cy < 280 ? "Yes" : "No";
  });
  var g = graphCleaned(pictureGraph(Object.assign(got.seen, { scale: 1 }), { texts: texts, labels: [] }));
  var s = shortly(g);
  expect("picture, Mermaid: shapes, the words' boxes gone",
         same(s.shapes, ['roundrect "start"', 'rect "step"', 'diamond "ask"', 'hex "tell"', 'roundrect "end"']),
         JSON.stringify(s.shapes));
  expect("picture, Mermaid: arrows, with their words",
         same(s.arrows, ["start -> step", "step -> ask", "ask -> tell [Yes]", "ask -> end [No]", "tell -> step"]),
         JSON.stringify(s.arrows));
})();
pictureCase("dark", { paper: [30, 30, 30], fill: [45, 45, 60], line: [220, 220, 220], border: 2, words: [240, 240, 240] },
            { tell: "rect" }, {}, function (got) {
  expect("picture, dark: paper read as dark", got.seen.paper[0] < 50);
});
pictureCase("filled, no borders", { paper: WHITE, fill: [66, 133, 244], line: [66, 133, 244], border: 0, words: WHITE,
                                    arrows: [90, 90, 90], lines: 2 }, { start: "ellipse", end: "ellipse" },
            { start: "oval", end: "oval" });
pictureCase("the rarer shapes", { paper: WHITE, fill: WHITE, line: BLACK, border: 1.5 },
            { step: "sub", tell: "hex", start: "roundrect", end: "store" }, {});

Promise.all(jobs).then(function () {
  if (bad.length) {
    console.error(bad.join("\n"));
    console.error(bad.length + " of " + (bad.length + good.length) + " failed");
    process.exit(1);
  }
  console.log(good.length + " brought in right");
}, function (e) {
  console.error(e && e.stack || e);
  process.exit(1);
});
