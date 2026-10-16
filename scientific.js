
const display = document.getElementById("display");
const history = document.getElementById("history");
const angleButton = document.getElementById("angle");

let expression = "";
let degreeMode = true;
let lastAnswer = 0;
let justCalculated = false;

function update() {
  display.value = expression || "0";
}

function factorial(n) {
  if (!Number.isInteger(n) || n < 0 || n > 170) {
    throw new Error("Invalid factorial");
  }

  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function evaluate(source) {
  let exp = source
    .replace(/π/g, "Math.PI")
    .replace(/\be\b/g, "Math.E")
    .replace(/Ans/g, `(${lastAnswer})`)
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/\^/g, "**")
    .replace(/(\d|\))\s*(Math\.PI|Math\.E|\()/g, "$1*$2");

  exp = exp.replace(
    /(sin|cos|tan|sqrt|log|ln)\(/g,
    (_, fn) => {
      const functions = {
        sin: "Math.sin",
        cos: "Math.cos",
        tan: "Math.tan",
        sqrt: "Math.sqrt",
        log: "Math.log10",
        ln: "Math.log"
      };
      return functions[fn] + "(";
    }
  );

  exp = exp.replace(/Math\.(sin|cos|tan)\(([^()]*)\)/g, (_, fn, arg) => {
    const value = Number(Function('"use strict"; return (' + arg + ')')());
    const radians = degreeMode ? value * Math.PI / 180 : value;
    return `Math.${fn}(${radians})`;
  });

  if (!/^[0-9+\-*/().\sA-Za-z]*$/.test(exp)) {
    throw new Error("Invalid expression");
  }

  if (/[^0-9+\-*/().\s]/.test(exp.replace(/Math\.(PI|E|sin|cos|tan|sqrt|log10|log)/g, ""))) {
    throw new Error("Invalid expression");
  }

  const result = Function('"use strict"; return (' + exp + ')')();

  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("Invalid result");
  }

  return Number(result.toPrecision(12));
}

function calculate() {
  if (!expression) return;

  try {
    const result = evaluate(expression);
    history.textContent = expression + " =";
    lastAnswer = result;
    expression = String(result);
    justCalculated = true;
    update();
  } catch {
    history.textContent = "Invalid calculation";
    expression = "";
    update();
  }
}

function insert(value) {
  if (justCalculated && /[0-9πe]/.test(value)) expression = "";
  justCalculated = false;
  expression += value;
  update();
}

document.querySelector(".keys").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;

  const { value, action, fn } = button.dataset;

  if (action === "clear") {
    expression = "";
    history.textContent = "Scientific mode";
    justCalculated = false;
    update();
    return;
  }

  if (action === "delete") {
    expression = expression.slice(0, -1);
    justCalculated = false;
    update();
    return;
  }

  if (action === "calculate") return calculate();

  if (fn) {
    const match = expression.match(/(\d*\.?\d+)$/);

    if (match && /^(sin|cos|tan|sqrt|log|ln)$/.test(fn)) {
      expression = expression.slice(0, -match[0].length) +
        fn + "(" + match[0] + ")";
    } else {
      expression += fn + "(";
    }

    justCalculated = false;
    update();
    return;
  }

  switch (action) {
    case "open": insert("("); return;
    case "close": insert(")"); return;
    case "square": insert("^2"); return;
    case "power": insert("^"); return;
    case "pi": insert("π"); return;
    case "e": insert("e"); return;
    case "ans": insert("Ans"); return;
    case "percent": {
      const match = expression.match(/(\d*\.?\d+)$/);
      if (match) {
        expression = expression.slice(0, -match[0].length) +
          "(" + match[0] + "/100)";
        update();
      }
      return;
    }
    case "sign": {
      const match = expression.match(/(\d*\.?\d+)$/);
      if (match) {
        expression = expression.slice(0, -match[0].length) +
          "(-" + match[0] + ")";
        update();
      }
      return;
    }
    case "reciprocal":
      expression = "1/(" + expression + ")";
      update();
      return;
  }

  if (value !== undefined) {
    if (value === ".") {
      const last = expression.split(/[+\-*/^()]/).pop();
      if (last.includes(".")) return;
      if (!last) expression += "0";
    }

    insert(value);
  }
});

angleButton.addEventListener("click", () => {
  degreeMode = !degreeMode;
  angleButton.textContent = degreeMode ? "DEG" : "RAD";
});

document.addEventListener("keydown", event => {
  if (/^[0-9.+\-*/^()]$/.test(event.key)) insert(event.key);
  else if (event.key === "Enter") calculate();
  else if (event.key === "Backspace") {
    expression = expression.slice(0, -1);
    update();
  } else if (event.key === "Escape") {
    expression = "";
    update();
  }
});
