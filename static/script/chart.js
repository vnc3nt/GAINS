const viewoption = {
    "week": 1,
    "month": 4.5,
    "year": 55
}
//TODO left/right arrows for scrolling left and right on desktop like pictures on amazon product
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);


window.onload = function (e) {
    document.querySelectorAll("input[name='view-options']").forEach(radiobutton=>{
      radiobutton.addEventListener("change", e=>drawChart());
    });
};

async function drawChart() {
    try {
        let userData = await fetch('/api/data')
            .then(response => response.json())
            .catch((error) => {
                console.error('Error:', error);
            });
        let databaseData = [['Datum']];
        let firstDate = undefined;
        let currentDate = undefined;
        let categoryStyles = {}; // Objekt zur Speicherung von Farben und Stilen je nach Kategorie

        // Sammeln aller Kategorien und deren Farben
        let response = await fetch('/api/categories');
        let categories = await response.json();
        categories.sort((a, b) => a.id - b.id); // Sortieren der Kategorien nach ID


        console.debug('UserData:', userData); // Prüfe die gesamten zurückgegebenen Daten
        console.debug('UserData Data:', userData.data); // Prüfe spezifisch userData.data

        categories.forEach(category => {
            databaseData[0].push(category.name); // Hinzufügen der Kategorienamen als Überschriften
            categoryStyles[category.name] = { color: category.color}; // Speichern der Farben für jede Kategorie
        });


        // Finden des ersten gültigen Datums in den Daten
        userData.data.forEach(element => {
            if (!firstDate && element.date) {
                firstDate = element.date;
            }
        });
        // Falls kein gültiges Datum gefunden wurde, kannst du ein Standarddatum setzen
        if (!firstDate) {
            firstDate = '2002-02-02'; // Hier ein passendes Standarddatum setzen, falls nötig
        }


         // Datenpunkte zu den entsprechenden Datumseinträgen hinzufügen
         let dataByDate = {}; // Objekt zur Sammlung der Daten pro Datum

         userData.data.forEach(element => {
             let date = element.date;
             if (!dataByDate[date]) {
                 dataByDate[date] = [date]; // Erste Spalte im Datenarray ist das Datum
                 categories.forEach(category => {
                     dataByDate[date].push(0); // Initialisieren aller Kategorienwerte mit 0
                 });
             }
 
             // Werte für jede Kategorie zum entsprechenden Datum hinzufügen
             categories.forEach(category => {
                 dataByDate[date][categories.indexOf(category) + 1] += element[category.name] ?? 0;
             });
         });
 
         // Datenzeilen aus dem dataByDate Objekt in das databaseData Array einfügen
         Object.values(dataByDate).forEach(row => {
             databaseData.push(row);
         });


        
        //TODO nichtinterpolierte Punkte weiß einfärben

        // Aufruf der Funktion, um Nullen mit interpolierten Werten zu ersetzen
        ersetzeNullenMitInterpoliertenWerten(databaseData);

        let data = google.visualization.arrayToDataTable(databaseData);

         // Höchsten Wert für die Y-Achse berechnen
         let maxValue = Math.max(...Object.values(userData.maxValue));
         document.querySelector(".max").textContent = Math.round((maxValue + 5) / 5) * 5;
        let selectedValue = document.querySelector("input[type=radio][name='view-options']:checked").value;

        let options = {
            curveType: 'function',
            legend: 'none',
            width: Math.max(window.innerWidth / 7 * daysTillToday(firstDate) / viewoption[selectedValue], window.innerWidth * 0.95),
            height: window.innerHeight - 140 - convertRemToPixels(4) - 50,
            colors: Object.values(categoryStyles).map(style => style.color),
            lineWidth: 3,
            pointSize: 5 / viewoption[selectedValue],
            backgroundColor: { fill: 'transparent' },
            chartArea: { 'width': '99%', 'height': '90%' },
            hAxis: { viewWindow: { min: .25, max: daysTillToday(firstDate) - 0.25} },
            vAxis: { viewWindow: { min: 0, max: maxValue + 10 } },
            tooltip: { isHtml: true }
        };
        

        let chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

        

        chart.draw(data, options);

        let container = document.querySelector('.scrollwindow');
        container.scrollLeft = options.width + 500;
    } catch (error) {
        console.error('Fehler beim Zeichnen des Charts:', error);
    }
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