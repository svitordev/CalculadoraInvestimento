import { generateReturnsArray } from "./src/investmentGoals";
import { Chart } from "chart.js/auto";
import { createTable } from "./src/table";

const finalMoneyChart = document.getElementById("final-money-distribution");
const progressionChart = document.getElementById("progression");
// const calculateButton = document.getElementById("calculate-results");
const clearFormButton = document.getElementById("clear-form");
const form = document.getElementById("investiment-form");
const tableId = document.getElementById("results-table");

let doughnutChartReference = {};
let progressionChartReference = {};

const columnsArray = [
  { columnLabel: "Mês", accessor: "month" },
  {
    columnLabel: "Total investido",
    accessor: "investedAmount",
    format: (numberInfo) => formatCurrencyToTable(numberInfo),
  },
  {
    columnLabel: "Rendimento mensal",
    accessor: "interestReturns",
    format: (numberInfo) => formatCurrencyToTable(numberInfo),
  },
  {
    columnLabel: "Rendimento total",
    accessor: "totalInterestReturns",
    format: (numberInfo) => formatCurrencyToTable(numberInfo),
  },
  {
    columnLabel: "Valor total",
    accessor: "totalAmount",
    format: (numberInfo) => formatCurrencyToTable(numberInfo),
  },
];

function formatCurrencyToTable(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function formatCurrencyToGraph(value) {
  return value.toFixed(2);
}
function renderProgression(event) {
  event.preventDefault();
  if (document.querySelector(".error")) {
    return;
  }
  resetCharts();

  // const startingAmount = Number(form['startingAmount'].value) = pelo name do input;
  const startingAmount = Number(
    document.getElementById("starting-amount").value.replace(",", ".")
  );
  const additionalContribution = Number(
    document.getElementById("additional-contribution").value.replace(",", ".")
  );
  const timeAmount = Number(document.getElementById("time-amount").value);
  const timeAmountPeriod = document.getElementById("time-amount-period").value;
  const returnRate = Number(
    document.getElementById("return-rate").value.replace(",", ".")
  );
  const returnRatePeriod = document.getElementById("evaluation-period").value;
  const taxRate = Number(
    document.getElementById("tax-rate").value.replace(",", ".")
  );

  const returnsArray = generateReturnsArray(
    startingAmount,
    timeAmount,
    timeAmountPeriod,
    additionalContribution,
    returnRate,
    returnRatePeriod
  );

  const finalObject = returnsArray[returnsArray.length - 1];

  doughnutChartReference = new Chart(finalMoneyChart, {
    type: "doughnut",
    data: {
      labels: ["Total investido", "Rendimento", "Imposto"],
      datasets: [
        {
          data: [
            formatCurrencyToGraph(finalObject.investedAmount),
            formatCurrencyToGraph(
              finalObject.totalInterestReturns * (1 - taxRate / 100)
            ),
            formatCurrencyToGraph(
              finalObject.totalInterestReturns * (taxRate / 100)
            ),
          ],
          backgroundColor: ["#004e92", "#093637", "#93291E"],
          hoverOffset: 4,
        },
      ],
    },
  });
  progressionChartReference = new Chart(progressionChart, {
    type: "bar",
    data: {
      labels: returnsArray.map((investimentObject) => investimentObject.month),
      datasets: [
        {
          label: "Total Investido",
          data: returnsArray.map((investimentObject) =>
            formatCurrencyToGraph(investimentObject.investedAmount)
          ),
          backgroundColor: "#004e92",
        },
        {
          label: "Retorno de Investimento",
          data: returnsArray.map((investimentObject) =>
            formatCurrencyToGraph(investimentObject.interestReturns)
          ),
          backgroundColor: "#093637",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    },
  });

  createTable(columnsArray, returnsArray, tableId);
}

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}
function resetCharts() {
  if (
    !isObjectEmpty(doughnutChartReference) &&
    !isObjectEmpty(progressionChartReference)
  ) {
    doughnutChartReference.destroy();
    progressionChartReference.destroy();
  }
}

function clearForm() {
  form["starting-amount"].value = "";
  form["additional-contribution"].value = "";
  form["time-amount"].value = "";
  form["return-rate"].value = "";
  form["tax-rate"].value = "";

  resetCharts();

  const errorInputContainers = document.querySelectorAll(".error");
  for (const errorInputContainer of errorInputContainers) {
    errorInputContainer.classList.remove("error");
    errorInputContainer.parentElement.querySelector("span").remove();
  }
}
function validateInput(event) {
  if (event.target.value === "") {
    return;
  }

  const { parentElement } = event.target;
  const grandParent = event.target.parentElement.parentElement;
  const inputValue = event.target.value.replace(",", ".");

  if (
    !parentElement.classList.contains("error") &&
    (isNaN(inputValue) || Number(inputValue) <= 0)
  ) {
    const errorTextElement = document.createElement("span");
    errorTextElement.classList.add("text-red-500");
    errorTextElement.innerText = "Insira um valor numérico e maior que zero";

    parentElement.classList.add("error");
    grandParent.appendChild(errorTextElement);
  } else if (
    parentElement.classList.contains("error") &&
    (!isNaN(inputValue) || !Number(inputValue) <= 0)
  ) {
    parentElement.classList.remove("error");
    grandParent.querySelector("span").remove();
  }
}

for (const formElement of form) {
  if (formElement.tagName === "INPUT" && formElement.hasAttribute("name")) {
    formElement.addEventListener("blur", validateInput);
  }
}

const mainEl = document.querySelector('main');
const carouselEl = document.getElementById('carousel');
const nextButton = document.getElementById('slide-arrow-next');
const previousButton = document.getElementById('slide-arrow-previous');

nextButton.addEventListener('click',()=>{
  carouselEl.scrollLeft += mainEl.clientWidth;
})
previousButton.addEventListener('click',()=>{
  carouselEl.scrollLeft -= mainEl.clientWidth;
})
form.addEventListener("submit", renderProgression);
// calculateButton.addEventListener('click', renderProgression)
clearFormButton.addEventListener("click", clearForm);
