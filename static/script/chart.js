const viewoption = {
    "week": 1,
    "month": 4.5,
    "year": 55
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


    let databaseData = [['Datum', 'Körperfett', {type:'string', role:'style'}, 'Gewicht',{type:'string', role:'style'}, 'Muskelmasse', {type:'string', role:'style'}]];
    let firstDate = undefined;
    let currentDate = undefined;

    userData.data.forEach(element => {
        if (firstDate === undefined && element.date) {
            firstDate = element.date;
            currentDate = stringToDate(firstDate);
        }

        let elementDate = stringToDate(element.date);
        while (currentDate < elementDate) {
            databaseData.push([dateToString(currentDate), 0,'point { fill-color: #1700ad; }', 0,'point { fill-color: #949292; }', 0, 'point { fill-color: #890000; }']);
            currentDate = addDays(currentDate, 1);
        }
//nicht interpolierte Werte
        databaseData.push([element.date, element.fat ?? 0,'point { fill-color: #ffffff; }', element.weight ?? 0,'point { fill-color: #ffffff; }', element.muscle ?? 0, 'point { fill-color: #ffffff; }']);
        currentDate = addDays(currentDate, 1);
    });

    // Aufruf der Funktion, um Nullen mit interpolierten Werten zu ersetzen
    ersetzeNullenMitInterpoliertenWerten(databaseData);

    //databaseData = filterData(databaseData, interval)


    let data = google.visualization.arrayToDataTable(databaseData);


    let maxValue = Math.max(...userData.maxValue);

    document.querySelector(".max").textContent = Math.round((maxValue + 5) / 5) * 5; //auf skalierung auf 10er gerundet schreiben


    // Erhalten Sie alle Radiobuttons
    let selectedValue = document.querySelector("input[type=radio][name='view-options']:checked").value
    console.debug(viewoption[selectedValue]);
    

    let options = {
        curveType: 'function',
        legend: 'none',
        width: window.innerWidth/7 * daysTillToday(firstDate) / viewoption[selectedValue],
        height: window.innerHeight - 140 - convertRemToPixels(4) - 50,
        colors: ['#1700ad', '#949292', '#890000'],
        lineWidth: 3,
        pointSize: 5/viewoption[selectedValue],
        backgroundColor: { fill: 'transparent' },
        chartArea: { 'width': '99%', 'height': '90%' },
        hAxis: { viewWindow: { min: .25, max: daysTillToday(firstDate) - 0.25 } }, // dynamisch an datensatz anpassen (4 Datensätze -> max: 3.5  5 -> max: 4.5  6 -> max: 5.5)
        vAxis: { viewWindow: { min: 0, max: maxValue + 10 } },
        tooltip: { isHtml: true }
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
    let spaltenAnzahl = databaseData[0].length; // Anzahl der Spalten dynamisch festlegen

    let vorherigeWerte = new Array(spaltenAnzahl).fill(0);
    let zukünftigeWerte = new Array(spaltenAnzahl).fill(0);
    let nullStreckenStart = new Array(spaltenAnzahl).fill(0);

    for (let i = 1; i < databaseData.length; i++) {
        for (let j = 1; j < spaltenAnzahl; j++) {
            if (databaseData[i][j] === 0) {
                if (nullStreckenStart[j] === 0) {
                    vorherigeWerte[j] = Number(databaseData[i - 1][j]);
                    nullStreckenStart[j] = i;
                }
            } else {
                if (nullStreckenStart[j] > 0) {
                    zukünftigeWerte[j] = Number(databaseData[i][j]);
                    let schrittweite = (zukünftigeWerte[j] - vorherigeWerte[j]) / (i - nullStreckenStart[j] + 1);
                    for (let k = nullStreckenStart[j]; k < i; k++) {
                        databaseData[k][j] = Number((vorherigeWerte[j] + schrittweite * (k - nullStreckenStart[j] + 1)).toFixed(2));
                    }
                    nullStreckenStart[j] = 0;
                }
                vorherigeWerte[j] = Number(databaseData[i][j]);
            }
        }
    }

    // Behandlung für den Fall, dass das Array mit Nullen endet
    for (let j = 1; j < spaltenAnzahl; j++) {
        if (nullStreckenStart[j] > 0) {
            for (let k = nullStreckenStart[j]; k < databaseData.length; k++) {
                databaseData[k][j] = Number(vorherigeWerte[j].toFixed(2)); // Verwenden Sie den letzten Nicht-Null-Wert
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