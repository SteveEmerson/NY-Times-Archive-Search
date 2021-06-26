// API information
const baseUrl = 'https://api.nytimes.com/svc/archive/v1/';
const key = 'Prv7L5xnYJIRklA6y6Uy4fMvH9FFmZaA';
let url;

// SEARCH FORM 
const dateMonth = document.querySelector('#month');
const dateYear = document.querySelector('#year');
const submitBtn = document.querySelector('#getDate');

var max = new Date().getFullYear();
min = 1851;

for (var i = max; i >= min; i--) {
  var opt = document.createElement('option');
  opt.value = i;
  opt.innerHTML = i;
  dateYear.appendChild(opt);
}


// RESULTS NAVIGATION
// const nextBtn = document.querySelector('.next');
// const previousBtn = document.querySelector('.prev');

// RESULTS SECTION
const resultDiv = document.querySelector('#results');


// Add event listeners
submitBtn.addEventListener('click', fetchResults);  //?expects to have text input from the user ... also refresh page


function fetchResults(e) {

  e.preventDefault();  //default nature of a form is to POST and refresh the page ... prevents the refresh in this case
  //console.log(e);
  console.log("Got here");

  url = baseUrl + dateYear.value + "/" + dateMonth.value + ".json?api-key=" + key;


  var proxyUrl = 'https://cors-anywhere.herokuapp.com/'


  fetch(proxyUrl + url)
    .then(blob => blob.json())
    .then(data => {
      console.table(data);
      let keywordData = buildData(data);
      let maxResults = 20;
      let topResults = getTopResults(keywordData, maxResults);
      makeChart(keywordData, topResults);
    })
    .catch(e => {
      console.log(e);
      return e;
    });

}

// Handles building the local data set
function buildData(data) {

  const num_articles = data.response.meta.hits;
  const articles = data.response.docs;
  let frontPageArticles = articles.filter(article => article.print_page === "1")
  console.log(frontPageArticles[0]);

  let f_keywords = {};
  let max_keywords = 3;

  for (f_article of frontPageArticles) {
    for (let i = 0; i < f_article.keywords.length; i++) {
      if (i >= max_keywords) { break; }

      let curr_key = f_article.keywords[i].value;

      if (curr_key in f_keywords) {
        f_keywords[curr_key]++;
      } else {
        f_keywords[curr_key] = 1;
      }
    }

  }

  let count = 0;
  for (const key_word in f_keywords) {
    if (f_keywords[key_word] > 10) {
      console.log(`${key_word}: ${f_keywords[key_word]}`);
    }

  }

  return f_keywords;
}

function getTopResults(data, max = 0) {

  let w_data = {};
  Object.assign(w_data, data);

  let top_max_keys = [];

  let data_size = Object.keys(w_data).length;
  let end = (max === 0 || max > data_size) ? data_size : max;

  for (let i = 0; i < end; i++) {
    let largest_value = 0;
    let key_largest;

    for (let key in w_data) {
      if (w_data[key] > largest_value) {
        largest_value = w_data[key];
        key_largest = key;
      }
    }

    top_max_keys.push(key_largest);
    delete w_data[key_largest];

  }

  console.log(top_max_keys);
  return top_max_keys;

}

function makeChart(data, keyList) {

  while (resultDiv.firstElementChild) {
    resultDiv.removeChild(resultDiv.firstChild);
  }

  let chart = document.createElement('div')
  chart.className = 'chart';
  //chart.id = 'add an id';
  resultDiv.appendChild(chart);

  let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  let chartTitle = document.createElement('h3');
  chartTitle.textContent = `Top ${keyList.length} Topics for ${months[dateMonth.value - 1]}, ${dateYear.value}`;
  chart.appendChild(chartTitle);

  for (let key of keyList) {
    let barDiv = document.createElement('div');
    barDiv.className = 'bar-div';
    chart.appendChild(barDiv);
    let bar = document.createElement('div');
    bar.className = 'key-bar';
    bar.id = key;
    let barLength = data[key] * 10;
    bar.style.width = "" + barLength + "px"
    barDiv.appendChild(bar);
    let label = document.createElement('p');
    label.textContent = key;
    label.className = 'bar-label';
    barDiv.appendChild(label);
  }
}

// function nextPage(e){
//   pageNumber++;
//   fetchResults(e);

// }

// function previousPage(e){
//   if(pageNumber > 0){
//     pageNumber--;
//   }else{
//     return;
//   }

//   fetchResults(e);
// }






