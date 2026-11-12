// ---------------------------------------------------------------------------
//  uml.js -- code with classes, drawn as a class diagram
//
//  Run by tests/run.py where node is installed.  The reader is lifted out of
//  flowchart/ui/js/18-from-code.js and the drawing out of 19-uml.js, so what
//  is checked is what the page does with Options' "Draw as: Class diagram":
//  each program is read, and every class has to come out with the lines it
//  should -- who may use each field and method (- + # ~), its kind, what a
//  method takes and hands back -- and the lines between the classes; then
//  it is drawn, and the drawing has to be one (every box on the paper, none
//  over another, each class below the one it is built on), and written as
//  Mermaid's classDiagram.
//
//      node tests/uml.js          prints what passed, or what did not
// ---------------------------------------------------------------------------
var fs = require("fs"), path = require("path");

function part(name) {
  return fs.readFileSync(path.join(__dirname, "..", "flowchart", "ui", "js", name), "utf8");
}
var TXT = {};
function say(key, fill) {                             // eslint-disable-line no-unused-vars
  var out = TXT[key] || key;
  for (var name in (fill || {})) { out = out.split("{" + name + "}").join(fill[name]); }
  return out;
}
function el() { return null; }                        // eslint-disable-line no-unused-vars
eval(part("18-from-code.js"));                        // eslint-disable-line no-eval
eval(part("19-uml.js"));                              // eslint-disable-line no-eval

// Each program, and what its diagram says: each class's name (with its kind
// where it is not a plain class) and its lines, fields first, then the lines
// between the classes.
var CASES = [
  { name: "the Car assignment, Python", lang: "python", code: [
      "class Car:",
      "    def __init__(self, year, make):",
      "        self.__year = year",
      "        self.__make = make",
      "        self.__speed = 0",
      "",
      "    def getYear(self):",
      "        return self.__year",
      "",
      "    def getMake(self):",
      "        return self.__make",
      "",
      "    def getSpeed(self):",
      "        return self.__speed",
      "",
      "    def accelerate(self):",
      "        self.__speed = self.__speed + 5",
      "",
      "    def brake(self):",
      "        self.__speed = self.__speed - 5",
      "        if self.__speed < 0:",
      "            self.__speed = 0",
      "",
      "",
      "def main():",
      "    myCar = Car(2014, \"Mitsubishi\")",
      "    choice = \"\"",
      "    while choice != \"3\":",
      "        print(\"Speed:\", myCar.getSpeed())",
      "        choice = input(\"Choice: \")",
      "        if choice == \"1\":",
      "            myCar.accelerate()",
      "        elif choice == \"2\":",
      "            myCar.brake()",
      "",
      "",
      "main()"].join("\n"),
    classes: {
      Car: ["- __year : int", "- __make : str", "- __speed : int",
            "+ __init__(year : int, make : str)", "+ getYear() : int", "+ getMake() : str",
            "+ getSpeed() : int", "+ accelerate()", "+ brake()"]
    },
    links: [],
    mermaid: ["classDiagram", "    class Car {", "        -int __year", "        +__init__(int year, str make)",
              "        +getYear() int", "        +brake()"] },

  { name: "Python: built on an abstract class, a list of them held, a property", lang: "python", code: [
      "from abc import ABC, abstractmethod",
      "",
      "class Shape(ABC):",
      "    count = 0",
      "",
      "    def __init__(self, name):",
      "        self._name = name",
      "        Shape.count += 1",
      "",
      "    @abstractmethod",
      "    def area(self):",
      "        pass",
      "",
      "    @property",
      "    def name(self):",
      "        return self._name",
      "",
      "    @staticmethod",
      "    def made():",
      "        return Shape.count",
      "",
      "class Square(Shape):",
      "    def __init__(self, side):",
      "        super().__init__(\"square\")",
      "        self.side = side",
      "",
      "    def area(self):",
      "        return self.side * self.side",
      "",
      "class Drawing:",
      "    def __init__(self):",
      "        self.shapes = []",
      "",
      "    def add(self, s):",
      "        self.shapes.append(s)",
      "",
      "    def total(self):",
      "        return sum(s.area() for s in self.shapes)",
      "",
      "d = Drawing()",
      "d.add(Square(2.5))",
      "d.add(Square(3))",
      "print(d.total(), Shape.made())"].join("\n"),
    classes: {
      "Shape (abstract)": ["+ count : int {static}", "# _name : str", "+ name : str",
                           "+ __init__(name : str)", "+ area() {abstract}", "+ made() : int {static}"],
      Square: ["+ side : float", "+ __init__(side : float)", "+ area() : float"],
      Drawing: ["+ shapes : list[Square]", "+ __init__()", "+ add(s : Square)", "+ total() : float"]
    },
    links: ["Square extends Shape", "Drawing has Square (shapes, many)"] },

  { name: "Java: an interface, an abstract class, two built on it, a list of them", lang: "java", code: [
      "import java.util.ArrayList;",
      "import java.util.List;",
      "",
      "interface Describable {",
      "    String describe();",
      "}",
      "",
      "abstract class Shape implements Describable {",
      "    protected String name;",
      "    private static int count = 0;",
      "",
      "    public Shape(String name) {",
      "        this.name = name;",
      "        count++;",
      "    }",
      "",
      "    public abstract double area();",
      "",
      "    public String describe() {",
      "        return name + \" with area \" + area();",
      "    }",
      "",
      "    public static int getCount() {",
      "        return count;",
      "    }",
      "}",
      "",
      "class Circle extends Shape {",
      "    private double radius;",
      "",
      "    public Circle(double radius) {",
      "        super(\"Circle\");",
      "        this.radius = radius;",
      "    }",
      "",
      "    @Override",
      "    public double area() {",
      "        return Math.PI * radius * radius;",
      "    }",
      "}",
      "",
      "class Rectangle extends Shape {",
      "    private double width, height;",
      "",
      "    Rectangle(double width, double height) {",
      "        super(\"Rectangle\");",
      "        this.width = width;",
      "        this.height = height;",
      "    }",
      "",
      "    public double area() {",
      "        return width * height;",
      "    }",
      "}",
      "",
      "class Drawing {",
      "    private List<Shape> shapes = new ArrayList<>();",
      "    private Shape biggest;",
      "",
      "    public void add(Shape s) {",
      "        shapes.add(s);",
      "        if (biggest == null || s.area() > biggest.area()) {",
      "            biggest = s;",
      "        }",
      "    }",
      "}",
      "",
      "public class Shapes {",
      "    public static void main(String[] args) {",
      "        Drawing d = new Drawing();",
      "        d.add(new Circle(1.5));",
      "        d.add(new Rectangle(2, 3));",
      "        System.out.println(Shape.getCount());",
      "    }",
      "}"].join("\n"),
    classes: {
      "Describable (interface)": ["+ describe() : String {abstract}"],
      "Shape (abstract)": ["# name : String", "- count : int {static}", "+ Shape(name : String)",
                           "+ area() : double {abstract}", "+ describe() : String", "+ getCount() : int {static}"],
      Circle: ["- radius : double", "+ Circle(radius : double)", "+ area() : double"],
      Rectangle: ["- width : double", "- height : double", "~ Rectangle(width : double, height : double)",
                  "+ area() : double"],
      Drawing: ["- shapes : List<Shape>", "- biggest : Shape", "+ add(s : Shape) : void"]
    },
    links: ["Shape implements Describable", "Circle extends Shape", "Rectangle extends Shape",
            "Drawing has Shape (shapes, many)", "Drawing has Shape (biggest)"],
    mermaid: ["    class Describable {", "        <<interface>>", "        +describe()* String",
              "        -int count$", "        +getCount()$ int", "    Describable <|.. Shape", "    Shape <|-- Circle",
              "        -List~Shape~ shapes", "    Drawing --> \"*\" Shape : shapes", "    Drawing --> Shape : biggest"] },

  { name: "Java: the Car assignment, its demo class left out", lang: "java", code: [
      "import java.util.Scanner;",
      "",
      "class Car {",
      "    private int yearModel;",
      "    private String make;",
      "    private int speed;",
      "",
      "    public Car(int year, String m) {",
      "        yearModel = year;",
      "        make = m;",
      "        speed = 0;",
      "    }",
      "",
      "    public int getYearModel() { return yearModel; }",
      "    public String getMake() { return make; }",
      "    public int getSpeed() { return speed; }",
      "    public void accelerate() { speed += 5; }",
      "    public void brake() { if (speed >= 5) { speed -= 5; } else { speed = 0; } }",
      "}",
      "",
      "public class CarDemo {",
      "    public static void main(String[] args) {",
      "        Car c = new Car(2014, \"Mitsubishi\");",
      "        c.accelerate();",
      "        System.out.println(c.getSpeed());",
      "    }",
      "}"].join("\n"),
    classes: {
      Car: ["- yearModel : int", "- make : String", "- speed : int", "+ Car(year : int, m : String)",
            "+ getYearModel() : int", "+ getMake() : String", "+ getSpeed() : int", "+ accelerate() : void",
            "+ brake() : void"]
    },
    links: [] },

  { name: "C#: properties, internal and protected, an interface, built on", lang: "csharp", code: [
      "using System;",
      "using System.Collections.Generic;",
      "",
      "public interface IAccount",
      "{",
      "    void Deposit(decimal amount);",
      "}",
      "",
      "public class Account : IAccount",
      "{",
      "    public string Owner { get; set; }",
      "    private decimal balance;",
      "    internal int id;",
      "    protected List<string> history = new List<string>();",
      "",
      "    public Account(string owner)",
      "    {",
      "        Owner = owner;",
      "        balance = 0;",
      "    }",
      "",
      "    public decimal Balance",
      "    {",
      "        get { return balance; }",
      "    }",
      "",
      "    public void Deposit(decimal amount)",
      "    {",
      "        balance += amount;",
      "        history.Add(\"in \" + amount);",
      "    }",
      "}",
      "",
      "public class Savings : Account",
      "{",
      "    double rate = 0.02;",
      "",
      "    public Savings(string owner) : base(owner) { }",
      "}",
      "",
      "class Program",
      "{",
      "    static void Main()",
      "    {",
      "        var a = new Savings(\"Ann\");",
      "        a.Deposit(50);",
      "        Console.WriteLine(a.Balance);",
      "    }",
      "}"].join("\n"),
    classes: {
      "IAccount (interface)": ["+ Deposit(amount : decimal) : void {abstract}"],
      Account: ["+ Owner : string", "- balance : decimal", "~ id : int", "# history : List<string>",
                "+ Balance : decimal", "+ Account(owner : string)", "+ Deposit(amount : decimal) : void"],
      Savings: ["- rate : double", "+ Savings(owner : string)"]
    },
    links: ["Account implements IAccount", "Savings extends Account"] },

  { name: "C++: public: and private:, methods made outside the class, = 0", lang: "cpp", code: [
      "#include <iostream>",
      "#include <string>",
      "#include <vector>",
      "using namespace std;",
      "",
      "class Engine {",
      "public:",
      "    int power;",
      "    Engine(int p) : power(p) {}",
      "};",
      "",
      "class Car {",
      "    int year;",
      "    Engine* engine;",
      "    vector<string> owners;",
      "public:",
      "    Car(int y);",
      "    int getYear() const;",
      "    void honk() { cout << \"beep\" << endl; }",
      "    virtual double value() = 0;",
      "protected:",
      "    static int made;",
      "};",
      "",
      "int Car::made = 0;",
      "",
      "Car::Car(int y) {",
      "    year = y;",
      "    engine = new Engine(100);",
      "}",
      "",
      "int Car::getYear() const { return year; }",
      "",
      "struct Point {",
      "    double x, y;",
      "};",
      "",
      "int main() {",
      "    Point p = {1, 2};",
      "    cout << p.x << endl;",
      "    return 0;",
      "}"].join("\n"),
    classes: {
      Engine: ["+ power : int", "+ Engine(p : int)"],
      "Car (abstract)": ["- year : int", "- engine : Engine*", "- owners : vector<string>", "# made : int {static}",
                         "+ Car(y : int)", "+ getYear() : int", "+ honk() : void", "+ value() : double {abstract}"],
      "Point (struct)": ["+ x : double", "+ y : double"]
    },
    links: ["Car has Engine (engine)"],
    mermaid: ["        -Engine* engine", "        -vector~string~ owners", "        +value()* double",
              "    Car --> Engine : engine"] },

  { name: "JavaScript: #private, a getter, static, built on", lang: "javascript", code: [
      "class Animal {",
      "  #name;",
      "  constructor(name, legs) {",
      "    this.#name = name;",
      "    this.legs = legs;",
      "  }",
      "  get name() { return this.#name; }",
      "  speak() { return this.#name + \" makes a sound\"; }",
      "  static kingdom() { return \"Animalia\"; }",
      "}",
      "",
      "class Dog extends Animal {",
      "  constructor(name) {",
      "    super(name, 4);",
      "  }",
      "  speak() { return this.name + \" barks\"; }",
      "}",
      "",
      "const d = new Dog(\"Rex\");",
      "console.log(d.speak(), Animal.kingdom());"].join("\n"),
    classes: {
      Animal: ["- #name", "+ legs : number", "+ name", "+ constructor(name, legs : number)",
               "+ speak() : string", "+ kingdom() : string {static}"],
      Dog: ["+ constructor(name)", "+ speak() : string"]
    },
    links: ["Dog extends Animal"] },

  { name: "TypeScript: private and readonly said in the constructor, an abstract method", lang: "typescript", code: [
      "abstract class Account {",
      "  protected balance: number = 0;",
      "  constructor(private owner: string, public readonly id: number) {}",
      "  abstract fee(): number;",
      "  deposit(amount: number): void { this.balance += amount; }",
      "}",
      "",
      "class Checking extends Account {",
      "  fee(): number { return 2; }",
      "}",
      "",
      "const c = new Checking(\"Ann\", 7);",
      "c.deposit(10);",
      "console.log(c.fee());"].join("\n"),
    classes: {
      "Account (abstract)": ["# balance : number", "- owner : string", "+ id : number",
                             "+ constructor(owner : string, id : number)", "+ fee() : number {abstract}",
                             "+ deposit(amount : number) : void"],
      Checking: ["+ fee() : number"]
    },
    links: ["Checking extends Account"] },

  { name: "Python: an error of its own, built on Exception", lang: "python", code: [
      "class TooFast(Exception):",
      "    pass",
      "",
      "def check(speed):",
      "    if speed > 100:",
      "        raise TooFast(\"slow down\")",
      "    return speed",
      "",
      "try:",
      "    check(120)",
      "except TooFast as e:",
      "    print(\"Caught:\", e)"].join("\n"),
    classes: { TooFast: [] },
    links: ["TooFast extends Exception"] },

  { name: "no classes at all", lang: "python", code: "total = 0\nfor i in range(3):\n    total += i\nprint(total)\n",
    classes: {}, links: [] }
];

var bad = [], good = [];
function expect(what, ok, detail) {
  if (ok) { good.push(what); } else { bad.push(what + (detail ? ": " + detail : "")); }
}

// One class's lines as the box shows them, said shortly: fields and
// methods, {static} and {abstract} where the box underlines or slants them.
function linesOf(c) {
  var out = (c.values || []).slice();
  (c.fields || []).forEach(function (f) { out.push(umlMember(f, false) + (f.statik ? " {static}" : "")); });
  (c.methods || []).forEach(function (m) {
    out.push(umlMember(m, true) + (m.statik ? " {static}" : "") + (m.abstract ? " {abstract}" : ""));
  });
  return out;
}
function titleOf(c) {
  var kind = c.kind !== "class" ? c.kind : c.abstract ? "abstract" : "";
  return c.name + (kind ? " (" + kind + ")" : "");
}
function linkSaid(l) {
  return l.from + " " + l.kind + " " + l.to + (l.kind === "has" ? " (" + l.label + (l.many ? ", many" : "") + ")" : "");
}

CASES.forEach(function (one) {
  var got;
  try { got = codeToPseudo(one.code, one.lang); }
  catch (e) { expect(one.name, false, "did not read: " + e.message + " (line " + e.line + ")"); return; }
  var model = got.uml || { classes: [], links: [] };
  // it reads, and runs, with nothing said about it
  expect(one.name + ": read with no notes", !got.notes.length,
         got.notes.map(function (n) { return n.text; }).join("; "));
  var names = model.classes.map(titleOf);
  var want = Object.keys(one.classes);
  expect(one.name + ": the classes", JSON.stringify(names) === JSON.stringify(want),
         JSON.stringify(names) + " wanted " + JSON.stringify(want));
  model.classes.forEach(function (c) {
    var w = one.classes[titleOf(c)];
    if (!w) { return; }
    var lines = linesOf(c);
    expect(one.name + ": " + c.name + "'s lines", JSON.stringify(lines) === JSON.stringify(w),
           "\n      got    " + JSON.stringify(lines) + "\n      wanted " + JSON.stringify(w));
  });
  var links = model.links.map(linkSaid);
  expect(one.name + ": the lines between them", JSON.stringify(links) === JSON.stringify(one.links),
         JSON.stringify(links) + " wanted " + JSON.stringify(one.links));

  // ---- drawn
  var drawn = umlSvg(model, 1, { title: one.name, by: "A. Student" });
  var svg = drawn.svg;
  var opens = (svg.match(/<g[ >]/g) || []).length, shuts = (svg.match(/<\/g>/g) || []).length;
  expect(one.name + ": an SVG, every group shut", /^<svg [^>]*viewBox="0 0 \d+ \d+"/.test(svg) &&
         /<\/svg>$/.test(svg) && opens === shuts && !/NaN|undefined/.test(svg),
         svg.slice(0, 120));
  var boxes = drawn.laid.boxes;
  var top = 36;                                     // under the title
  boxes.forEach(function (b) {
    expect(one.name + ": " + b.name + " on the paper",
           b.x >= 0 && b.y >= 0 && b.x + b.w <= drawn.w && b.y + b.h + top <= drawn.h,
           [b.x, b.y, b.w, b.h, drawn.w, drawn.h].join(" "));
    expect(one.name + ": " + b.name + " named in the drawing", svg.indexOf(">" + umlEsc(b.name) + "<") >= 0);
    boxes.forEach(function (o) {
      if (o === b) { return; }
      var apart = b.x + b.w <= o.x || o.x + o.w <= b.x || b.y + b.h <= o.y || o.y + o.h <= b.y;
      expect(one.name + ": " + b.name + " clear of " + o.name, apart);
    });
    if (b.up) {
      expect(one.name + ": " + b.name + " under " + b.up.name, b.y >= b.up.y + b.up.h + 30);
    }
  });
  // every line of every box is in the drawing, as it is written
  model.classes.forEach(function (c) {
    (c.fields || []).concat(c.methods || []).forEach(function (m) {
      var said = umlMember(m, (c.methods || []).indexOf(m) >= 0);
      expect(one.name + ": " + c.name + " shows " + said, svg.indexOf(">" + umlEsc(said) + "<") >= 0);
    });
  });
  // and as Mermaid
  var mm = umlMermaid(model);
  (one.mermaid || ["classDiagram"]).forEach(function (line) {
    expect(one.name + ": Mermaid says " + line.trim(), mm.split("\n").indexOf(line) >= 0, "\n" + mm);
  });
});

if (bad.length) {
  bad.forEach(function (b) { console.log("FAIL " + b); });
  console.log(bad.length + " of " + (bad.length + good.length) + " checks failed");
  process.exit(1);
}
console.log(CASES.length + " programs in " + new Set(CASES.map(function (c) { return c.lang; })).size +
            " languages, " + good.length + " checks: each class's lines, the lines between them, the drawing and its Mermaid");
