const input = document.querySelector("#country");
const btn = document.querySelector("#btn");

const countryName = document.querySelectorAll(".countryName");
const con = document.querySelector("#confirmed");
const dea = document.querySelector("#deaths");
const rec = document.querySelector("#recovered");
const dropdownItems = document.querySelector(".dropdown-items");
const error = document.querySelector("#error");
let myChart = document.getElementById("myChart");

let covidChart = null;

const API_BASE = "https://disease.sh/v3/covid-19";

function normalizeCountry(country) {
  if (!country) return "all";

  const value = country.trim();

  if (value.toLowerCase() === "global" || value.toLowerCase() === "world") {
    return "all";
  }

  if (value.toLowerCase() === "macedonia") {
    return "North Macedonia";
  }

  return value;
}

function showCountries() {
  dropdownItems.style.display =
    dropdownItems.style.display === "none" ? "block" : "none";
}

async function fetchCovidData(country) {
  const normalizedCountry = normalizeCountry(country);

  const url =
    normalizedCountry === "all"
      ? `${API_BASE}/all`
      : `${API_BASE}/countries/${encodeURIComponent(normalizedCountry)}?strict=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Country not found or API unavailable");
  }

  const data = await response.json();

  return {
    country: normalizedCountry === "all" ? "Global" : data.country,
    confirmed: data.cases ?? 0,
    deaths: data.deaths ?? 0,
    recovered: data.recovered ?? 0
  };
}

function showData(confirmed, deaths, recovered, country) {
  con.innerHTML = confirmed.toLocaleString();
  dea.innerHTML = deaths.toLocaleString();
  rec.innerHTML = recovered.toLocaleString();

  for (let i = 0; i < countryName.length; i++) {
    countryName[i].innerHTML = country;
  }
}

function renderChart(data) {
  if (covidChart) {
    covidChart.destroy();
  }

  covidChart = new Chart(myChart, {
    type: "bar",
    data: {
      labels: [data.country],
      datasets: [
        {
          label: "Confirmed Cases",
          data: [data.confirmed],
          backgroundColor: "#ff980085",
          borderWidth: 2,
          borderColor: "#ff9800"
        },
        {
          label: "Recovered Cases",
          data: [data.recovered],
          backgroundColor: "#23bf2373",
          borderWidth: 2,
          borderColor: "#23bf23"
        },
        {
          label: "Deaths",
          data: [data.deaths],
          backgroundColor: "#ff161669",
          borderWidth: 2,
          borderColor: "#ff1616"
        }
      ]
    }
  });
}

async function getData(country) {
  try {
    error.textContent = "";

    const data = await fetchCovidData(country);

    showData(data.confirmed, data.deaths, data.recovered, data.country);
    renderChart(data);

    const checkbox = document.getElementById("checkboxSpeech");
    if (checkbox && checkbox.checked === true) {
      robotSpeak(data.country, data.confirmed, data.recovered, data.deaths);
    }
  } catch (err) {
    error.textContent = "Could not load data. Check the country name.";
    console.error(err);
  }
}

async function countryList() {
  try {
    const response = await fetch(`${API_BASE}/countries`);
    const countries = await response.json();

    countries.forEach(item => {
      const countryTag = document.createElement("a");
      const countrySpan = document.createElement("span");

      countrySpan.textContent = item.country;
      countryTag.appendChild(countrySpan);
      dropdownItems.appendChild(countryTag);

      countryTag.addEventListener("click", function () {
        input.value = item.country;
        showCountries();
      });
    });
  } catch (err) {
    console.error("Could not load country list", err);
  }
}

function robotSpeak(country, confirmed, recovered, deaths) {
  const words = [
    country,
    "Confirmed Cases",
    confirmed,
    "Recovered Cases",
    recovered,
    "Death Cases",
    deaths
  ];

  words.forEach(word => {
    const msg = new SpeechSynthesisUtterance(String(word));
    speechSynthesis.speak(msg);
  });
}

function filterButtons() {
  if (dropdownItems.style.display === "none") {
    showCountries();
  }

  const filterValue = input.value.toUpperCase();
  const countries = document.querySelectorAll(".dropdown-items a");

  countries.forEach(country => {
    const span = country.getElementsByTagName("span")[0];

    if (span.innerHTML.toUpperCase().indexOf(filterValue) > -1) {
      country.style.display = "";
    } else {
      country.style.display = "none";
    }
  });
}

btn.addEventListener("click", function () {
  if (input.value.trim() === "") {
    error.textContent = "No country specified!";
    return;
  }

  getData(input.value);
});

countryList();
getData("global");
