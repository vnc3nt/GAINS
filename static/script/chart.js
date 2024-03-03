const viewoption = {
    "days": 1,
    "weeks": 7,
    "months": 30,
    "years": 365
}

google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);


window.onload = function (e) {
      document.querySelectorAll("input[name='view-options']").forEach(radiobutton=>{
        radiobutton.addEventListener("change", e=>drawChart());
      });
};

async function drawChart() {
    let userData = await fetch('/api/data')
        .then(response => response.json())
        .catch((error) => {
            console.error('Error:', error);
        });

    let userDataCount = await fetch('/count')
        .then(response => response.json())
        .then(data => data.count)
        .catch((error) => {
            console.error('Error:', error);
        });

    let databaseData = [['Datum', 'Körperfett', 'Gewicht', 'Muskelmasse']];
    let firstDate = undefined;
    let currentDate = undefined;

    userData.data.forEach(element => {
        if (firstDate === undefined && element.date) {
            firstDate = element.date;
            currentDate = stringToDate(firstDate);
        }

        let elementDate = stringToDate(element.date);
        while (currentDate < elementDate) {
            databaseData.push([dateToString(currentDate), 0, 0, 0]);
            currentDate = addDays(currentDate, 1);
        }

        databaseData.push([element.date, element.fat ?? 0, element.weight ?? 0, element.muscle ?? 0]);
        currentDate = addDays(currentDate, 1);
    });

    // Aufruf der Funktion, um Nullen mit interpolierten Werten zu ersetzen
    ersetzeNullenMitInterpoliertenWerten(databaseData);

    //databaseData = filterData(databaseData, interval)

    let data = google.visualization.arrayToDataTable(databaseData);

    console.debug(databaseData);

    let maxValue = Math.max(...userData.maxValue);

    // Erhalten Sie alle Radiobuttons
    let selectedValue = document.querySelector("input[type=radio][name='view-options']:checked").value
    console.debug(viewoption[selectedValue]);
    
    

    let options = {
        curveType: 'function',
        legend: 'none',
        width: daysTillToday(firstDate) * 50 / viewoption[selectedValue],
        height: window.innerHeight - 140 - convertRemToPixels(4) - 50,
        colors: ['rgb(20, 0, 150)', 'rgb(120, 120, 120)', 'rgb(115, 0, 0)'],
        lineWidth: 3,
        pointSize: 7.5,
        backgroundColor: { fill: 'transparent' },
        chartArea: { 'width': '99%', 'height': '90%' },
        hAxis: { viewWindow: { min: .25, max: daysTillToday(firstDate) - 0.25 } }, // dynamisch an datensatz anpassen (4 Datensätze -> max: 3.5  5 -> max: 4.5  6 -> max: 5.5)
        vAxis: { viewWindow: { min: 0, max: maxValue + 10 } }
    };

    let chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    chart.draw(data, options);

    let container = document.querySelector('.scrollwindow');
    console.log(container);
    container.scrollLeft = options.width + 500;
}

function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function dateToString(date) {
    let tag = String(date.getDate()).padStart(2, '0');
    let monat = String(date.getMonth() + 1).padStart(2, '0'); // Monate von 0-11
    let jahr = date.getFullYear();
    return `${tag}-${monat}-${jahr}`;
}

function stringToDate(datumString) {
    let teile = datumString.split("-");
    return new Date(teile[2], teile[1] - 1, teile[0]);
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function ersetzeNullenMitInterpoliertenWerten(databaseData) {
    let vorherigeWerte = [0, 0, 0]; // Vorherige Werte für fat, weight und muscle
    let zukünftigeWerte = [0, 0, 0]; // Zukünftige Werte für fat, weight und muscle
    let nullStreckenStart = [0, 0, 0]; // Startindex der aufeinanderfolgenden Nullen für fat, weight und muscle

    for (let i = 1; i < databaseData.length; i++) {
        for (let j = 1; j <= 3; j++) {
            if (databaseData[i][j] === 0) {
                if (nullStreckenStart[j - 1] === 0) {
                    vorherigeWerte[j - 1] = Number(databaseData[i - 1][j]);
                    nullStreckenStart[j - 1] = i;
                }
            } else {
                if (nullStreckenStart[j - 1] > 0) {
                    zukünftigeWerte[j - 1] = Number(databaseData[i][j]);
                    let schrittweite = (zukünftigeWerte[j - 1] - vorherigeWerte[j - 1]) / (i - nullStreckenStart[j - 1] + 1);
                    for (let k = nullStreckenStart[j - 1]; k < i; k++) {
                        databaseData[k][j] = Number((vorherigeWerte[j - 1] + schrittweite * (k - nullStreckenStart[j - 1] + 1)).toFixed(2));
                    }
                    nullStreckenStart[j - 1] = 0;
                }
                vorherigeWerte[j - 1] = Number(databaseData[i][j]);
            }
        }
    }

    // Behandlung für den Fall, dass das Array mit Nullen endet
    for (let j = 1; j <= 3; j++) {
        if (nullStreckenStart[j - 1] > 0) {
            for (let k = nullStreckenStart[j - 1]; k < databaseData.length; k++) {
                databaseData[k][j] = Number(vorherigeWerte[j - 1].toFixed(2)); // Verwenden Sie den letzten Nicht-Null-Wert
            }
        }
    }
}

function daysTillToday(datumString) {
    if (typeof datumString === 'string') {
        let teile = datumString.split("-");
        let gegebenesDatum = new Date(teile[2], teile[1] - 1, teile[0]);
        let heute = new Date();
        let differenzInZeit = heute.getTime() - gegebenesDatum.getTime();
        let differenzInTagen = Math.floor(differenzInZeit / (1000 * 3600 * 24));
        return differenzInTagen + 1;
    } else {
        // Behandlung für den Fall, dass datumString kein String ist
        console.error('datumString ist kein String:', datumString);
        return 0;
    }
}


function filterData(databaseData, interval) {
    let filteredData = [databaseData[0]]; // Behalten Sie die Überschriften bei
    for (let i = databaseData.length - 1; i > 0; i -= interval) {
        filteredData.unshift(databaseData[i]);
    }
    return filteredData;
}