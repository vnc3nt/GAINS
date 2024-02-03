google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);



function drawChart() {
  var data = google.visualization.arrayToDataTable([
    ['Month', 'Körperfett', 'Gewicht', 'Muskelmasse'],
    ['2004', 10, 57, 45],
    ['2005', 11, 60, 47],
    ['2006', 9, 58, 48.7],
    ['2007', 9.5, 62, 49]
  ]);

  var options = {
    curveType: 'function',
    legend: 'none',
    width: 1000, //dynamisch an datensatz anpassen
    height: 500,
    colors: ['rgb(20, 0, 150)', 'rgb(120, 120, 120)', 'rgb(115, 0, 0)' ],
    lineWidth: 2,
    backgroundColor: { fill:'transparent' },
    chartArea: {'width': '90%', 'height': '90%'},
    hAxis: { viewWindow: { min: .5, max: 3.75 } }, // dynamisch an datensatz anpassen (4 Datensätze -> max: 3.5  5 -> max: 4.5  6 -> max: 5.5)
    vAxis: { viewWindow: { min:0 , max: 100 } }
  };

  var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

  chart.draw(data, options);
}