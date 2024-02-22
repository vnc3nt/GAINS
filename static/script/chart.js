const weekMonthYear = {
  "week": 7,
  "month": 30,
  "year": 365
}


google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

window.onload = function() {
  let container = document.querySelector('.scrollwindow');
  container.scrollLeft = 1000;//dynamisch an datensatz anpassen
};

async function drawChart() {
  let userData = await fetch('/api/data')
  .then(response => response.json())
  .then(data => data.count)
  .catch((error) => {
      console.error('Error:', error);
  });

  let userDataCount = await fetch('/count')
  .then(response => response.json())
  .then(data => data.count)
  .catch((error) => {
      console.error('Error:', error);
  });

  let data = google.visualization.arrayToDataTable([
    ['Month', 'Körperfett', 'Gewicht', 'Muskelmasse'],
    ['2006', 9, 58, 48.7],
    ['2007', 9.5, 62, 49]
  ]);

  

  console.debug(userDataCount)
  let options = {
    curveType: 'function',
    legend: 'none',
    width:  userDataCount*50, //dynamisch an datensatz anpassen
    height: window.innerHeight - 140 - convertRemToPixels(4) - 50,
    colors: ['rgb(20, 0, 150)', 'rgb(120, 120, 120)', 'rgb(115, 0, 0)' ],
    lineWidth: 2,
    backgroundColor: { fill:'transparent' },
    chartArea: {'width': '90%', 'height': '90%'},
    hAxis: { viewWindow: { min: .25, max: 3.75 } }, // dynamisch an datensatz anpassen (4 Datensätze -> max: 3.5  5 -> max: 4.5  6 -> max: 5.5)
    vAxis: { viewWindow: { min:0 , max: 100 } }
  };

  let chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

  chart.draw(data, options);
}

function convertRemToPixels(rem) {    
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}