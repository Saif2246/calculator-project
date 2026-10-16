
const display = document.getElementById("display");
const history = document.getElementById("history");

let expression = "";
let justCalculated = false;

function update() {
  display.value = expression || "0";
}

function calculate() {
  if (!expression) return;

  try {
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      throw new Error("Invalid expression");
    }

    const result = Function('"use strict"; return (' + expression + ')')();

    if (typeof result !== "number" || !Number.isFinite(result)) {
      throw new Error("Invalid result");
    }

    history.textContent = expression + " =";
    expression = String(Number(result.toPrecision(12)));
    justCalculated = true;
    update();
  } catch {
    history.textContent = "Invalid calculation";
    expression = "";
    update();
  }
}

document.querySelector(".keys").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;

  const { action, value } = button.dataset;

  if (action === "clear") {
    expression = "";
    history.textContent = "Ready to calculate";
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

  if (action === "calculate") {
    calculate();
    return;
  }

  if (action === "percent") {
    const match = expression.match(/(\d*\.?\d+)$/);
    if (match) {
      const number = Number(match[0]) / 100;
      expression = expression.slice(0, -match[0].length) + number;
      update();
    }
    return;
  }

  if (action === "sign") {
    const match = expression.match(/(\d*\.?\d+)$/);
    if (match) {
      const start = expression.length - match[0].length;
      expression = expression.slice(0, start) +
        String(-Number(match[0]));
      update();
    }
    return;
  }

  if (value !== undefined) {
    if (justCalculated && /[0-9.]/.test(value)) {
      expression = "";
    }
    justCalculated = false;

    if (value === ".") {
      const lastNumber = expression.split(/[+\-*/()]/).pop();
      if (lastNumber.includes(".")) return;
      if (!lastNumber) expression += "0";
    }

    expression += value;
    update();
  }
});

document.addEventListener("keydown", event => {
  if (/^[0-9.+\-*/()]$/.test(event.key)) {
    expression += event.key;
    justCalculated = false;
    update();
  } else if (event.key === "Enter") {
    calculate();
  } else if (event.key === "Backspace") {
    expression = expression.slice(0, -1);
    update();
  } else if (event.key === "Escape") {
    expression = "";
    update();
  }
});
