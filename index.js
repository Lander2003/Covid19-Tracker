const input = document.querySelector("#country");
const btn = document.querySelector("#btn");

const countryName = document.querySelectorAll(".countryName");
const con = document.querySelector("#confirmed");
const dea = document.querySelector("#deaths");
const rec = document.querySelector("#recovered");
const dropdownItems = document.querySelector(".dropdown-items");
const error = document.querySelector("#error");
let myChart = document.getElementById("myChart");

let covidChart = new Chart(myChart);

function showCountries(){
  if(dropdownItems.style.display === "none"){
    dropdownItems.style.display = "block";
  } else {
    dropdownItems.style.display = "none";
  }

}

async function globalData(country) {
  let url = "https://covid19.mathdro.id/api/";
  let countries = "countries/";
  if (country == "World") country = "Global";
  if (country === "Macedonia") country = "North Macedonia";
  if (country !== "Global") {
  url += countries + country;
  }
  await (await fetch(url)).json().then(data => {
    console.log(status);
    let config = {
      type: "bar",
      data: {
        labels: [country],
        datasets: [
          {
            label: "Confirmed Cases",
            data: [data.confirmed.value],
            backgroundColor: "#ff980085",
            borderWidth: "2",
            borderColor: "#ff9800"
          },
          {
            label: "Recovered Cases",
            data: [data.recovered.value],
            backgroundColor: "#23bf2373",
            borderWidth: "2",
            borderColor: "#23bf23"
          },
          {
            label: "Deaths",
            data: [data.deaths.value],
            backgroundColor: "#ff161669",
            borderWidth: "2",
            borderColor: "#ff1616"
          }

        ]
      }
    };
    covidChart = new Chart(myChart, config);
  });
}

function showData(data1, data2, data3, data4) {
  con.innerHTML = data1;
  dea.innerHTML = data2;
  rec.innerHTML = data3;
  for(let i = 0; i<2; i++){
    countryName[i].innerHTML = data4;
  }
}

async function countryList() {
  let data = await fetch("https://covid19.mathdro.id/api/countries/");
  let new_data = await data.json();
  for (let i = 0; i < new_data.countries.length; i++) {
    const countrySpan = document.createElement("SPAN");
    const countryTag = document.createElement("A");
    const countryName = document.createTextNode(new_data.countries[i].name);
    countrySpan.appendChild(countryName);
    countryTag.appendChild(countrySpan);
    dropdownItems.appendChild(countryTag);
  }
}

async function getData(country) {
  try {
    let data;
    if (country === "Global") country = "global";
    if (country === "World") country = "global";
    if (country === "global") {
      data = await fetch("https://covid19.mathdro.id/api");
    } else {
      if (country === "Macedonia") {
        country = "North Macedonia";
      }
      data = await fetch("https://covid19.mathdro.id/api/countries/" + country);
    }
    let new_data = await data.json();
    let countryData = [
      new_data.confirmed.value,
      new_data.deaths.value,
      new_data.recovered.value,
      country
    ];
    showData(countryData[0], countryData[1], countryData[2], country);
    let checkbox = document.getElementById("checkboxSpeech");
    if (checkbox.checked === true) {
    robotSpeak(country, countryData[0], countryData[2], countryData[1]);
    }
  } catch {
    error.textContent = "Country doesnt exist!";
  }
}

function robotSpeak(country, confirmed, recovered, deaths){
  let words = [
    country,
    "Confirmed Cases",
    confirmed,
    "Recovered Cases",
    recovered,
    "Death Cases",
    deaths
  ];
  for (let i = 0; i < 7; i++) {
    let msg = new SpeechSynthesisUtterance(words[i]);
    speechSynthesis.speak(msg);
  }
}

btn.addEventListener("click", function(){
  if (input.value === "") error.textContent = "No country specified!";
  else {
    error.textContent = "";
    getData(input.value);
    globalData(input.value);
    covidChart.destroy();
  }
})

let countries;
function getCountryNames(){
  let countries = document.querySelectorAll(".dropdown-items a");
  let filterValue = input.value.toUpperCase();

  for(let i = 0; i < countries.length; i++){
      countries[i].addEventListener("click", function(){
        input.value = countries[i].textContent;
          showCountries();
       })
  }
    }

    function filterButtons(){
      if(dropdownItems.style.display === "none"){
        showCountries();
      }
      let filterValue = input.value.toUpperCase();
      let countries = document.querySelectorAll(".dropdown-items a");

      for(let i = 0; i<countries.length; i++){
        let a = countries[i].getElementsByTagName("span")[0];
        if(a.innerHTML.toUpperCase().indexOf(filterValue) > -1){
          countries[i].style.display = "";
        }else{
          countries[i].style.display = "none";
        }
      }
    }

countryList();
getData("global");
globalData("Global");
setTimeout(getCountryNames, 1000);
