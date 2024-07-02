const buttonQuestion = {
    "btn-fat": "Dein Körperfettanteil in Prozent:",
    "btn-weight": "Dein Körpergewicht in Kilogramm:",
    "btn-muscle": "Deine Museklmasse in Prozent:"
}
/*const tablePrompt = {
    "btn-fat": ,
    "btn-weight": ,
    "btn-muscle": 
}*/

let categories = {};

// Kategorien und Einheiten dynamisch laden
// Kategorien und Einheiten dynamisch laden
async function loadCategories() {
    try {
        let response = await fetch('/api/categories');
        let categories = await response.json();

        // Sortieren der Kategorien nach ID
        categories.sort((a, b) => a.id - b.id);

        let mainButtons = document.getElementById('main-buttons');
        mainButtons.innerHTML = ''; // Leeren des Inhalts

        categories.forEach(category => {
            let button = document.createElement('button');
            button.classList.add('category-button'); // Allgemeine CSS-Klasse für Kategorie-Buttons
            button.classList.add(category.name.toLowerCase()); // CSS-Klasse basierend auf dem Kategorienamen
            button.innerText = category.name;

            // Stil für Hintergrundfarbe aus der Datenbank
            button.style.backgroundColor = lightenColor(category.color, -40);
            button.style.borderColor = lightenColor(category.color, 0);

            button.id = `btn-${category.name.toLowerCase()}`; // ID basierend auf dem Kategorienamen
            button.addEventListener('click', leftClick);
            button.addEventListener('contextmenu', rightClick);
            mainButtons.appendChild(button);
        });

        console.debug('Dynamisch generierte Buttons:', categories);
    } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadCategories);

document.addEventListener('DOMContentLoaded', loadCategories);

let touchStartTime = null;
let touchStartX = null;
let touchStartY = null;
let touchX = 0;
let touchY = 0;
let moveDistance = 0;
let globalDatatransfer;
let lastTarget = null;
let allowDrop = false;
let draggedTouchNode = undefined;

const TOUCH_DRAG = "drag";
const TOUCH_NORMAL = "normal";
let touchSimulation = TOUCH_NORMAL;

const RIGHT_CLICK_TOUCH = 300;  // ms 
const DRAG_DISTANCE = 25;  // px²

window.addEventListener("touchstart", (e) => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
    let actualTarget = document.elementFromPoint(touchX, touchY);
    if (actualTarget.className === "muscle" || actualTarget.className === "fat" || actualTarget.className === "weight"){
        if (e.touches.length >= 2) {
            return;
        }
        e.preventDefault();
        touchStartTime = e.timeStamp;    // timeStamp in ms
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        //console.debug("Touch start:", touchStartTime);
    }

    //Funktion zum anmieren des profilemenus
    checkToHideProfile(e);

    buttonSwipeUp(e)
});


window.addEventListener("touchmove", (e) => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
    if (e.target != null) {
        if (e.target.className === "muscle" || e.target.className === "fat" || e.target.className === "weight"){
            if (e.touches.length >= 2) { 
                touchSimulation = TOUCH_NORMAL;
                return;
            }
            if (touchSimulation === TOUCH_NORMAL) {
                let moveX = touchStartX - e.touches[0].clientX;
                let moveY = touchStartY - e.touches[0].clientY;
                moveDistance = moveX * moveX + moveY * moveY;
                if (moveDistance >= DRAG_DISTANCE) {
                    let draggedTouchNode = findNextDraggable(e.target);
                    if (draggedTouchNode) {
                        globalDatatransfer = new DataTransfer();
                        globalDatatransfer.dropEffect = "move";
                        globalDatatransfer.effectAllowed = "move";

                        console.log(globalDatatransfer);
                        draggedTouchNode.dispatchEvent(new DragEvent("dragstart", {bubble: true, dataTransfer: globalDatatransfer}));
                        touchSimulation = TOUCH_DRAG;
                        lastTarget = actualTarget;
                        lastTarget.dispatchEvent(new DragEvent("dragenter", {bubbles: true, dataTransfer: globalDatatransfer}));
                    }
                }
            }
            else if (touchSimulation === TOUCH_DRAG) {
                // TODO dragenter/-leave
                let prevDOver = actualTarget.dispatchEvent(new DragEvent("dragover", {bubbles: true, dataTransfer: globalDatatransfer, cancelable: true}));
                allowDrop = !prevDOver;
                if (actualTarget != lastTarget) {
                    lastTarget.dispatchEvent(new DragEvent("dragleave", {bubbles: true, dataTransfer: globalDatatransfer, cancelable: true}));
                    lastTarget = actualTarget;
                    actualTarget.dispatchEvent(new DragEvent("dragenter", {bubbles: true, dataTransfer: globalDatatransfer, cancelable: true}));
                }
            }
        }
    }
});

window.addEventListener("touchend", (e) => {
    touchX = e.changedTouches[0].clientX;
    touchY = e.changedTouches[0].clientY;
    let actualTarget = document.elementFromPoint(touchX, touchY);
    //console.debug(actualTarget.className);
    if (e.target != null) {
        if (e.target.className === "muscle" || e.target.className === "fat" || e.target.className === "weight"){
            console.log("touch end diff:", e.timeStamp - touchStartTime);
            if (!touchStartTime || e.touches.length >= 2) {
                touchStartTime = null;
                return;
            }

            let diff = e.timeStamp - touchStartTime;  // ms 
            //console.debug("end touch target", e.target);
            
            touchSimulation = TOUCH_NORMAL;
            if (moveDistance < DRAG_DISTANCE) { // block clicks when it has been swiped
                if (diff >= RIGHT_CLICK_TOUCH && touchSimulation === TOUCH_NORMAL) {
                    e.preventDefault(); 
                    rightClick(e);
                }
            }
            touchStartTime = null;
        }
    }
});

window.addEventListener("touchcancel", (e) => {
    console.debug("touch cancel");
    if (touchSimulation == 0) {}
    touchStartTime = null;
    touchSimulation = TOUCH_NORMAL;
    moveDistance = 0;
    globalDatatransfer = null;
    draggedTouchNode = undefined;
});

async function leftClick(e) {
    let buttonId = e.target.id;  // ID des Buttons, z.B. "btn-fat"
    let category = categories.find(categ => categ.name === buttonId);
    if (!category) {
        console.error('Kategorie nicht gefunden für Button ID:', buttonId);
        return;
    }

    let unit = category.unit;
    let userInput = parseFloat(window.prompt(`Dein ${buttonQuestion[buttonId]} in ${unit}:`).replace(',', '.'));
    if (!userInput) {
        console.debug("Keine Benutzereingabe");
        return;
    }

    let data = await fetch("/api/data",  {
        method: "POST",
        body: JSON.stringify({
            category: buttonId,  // Button ID wird als Kategorie verwendet
            data: userInput,
            user: getUserId(),
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => response.json())
    .catch((error) => console.error('Fehler beim Speichern der Daten:', error));
    
    await drawChart();
}

async function rightClick(e) { //edit old data
    //alert("right clicked!");
    e.preventDefault(); //kein kontextmenü
    window.location.assign("/edit");
}

function checkToHideProfile(e) {
    const profileMenu = document.querySelector("#profile-menu");
    const profileMenuButton = document.querySelector("details#profile-menu-btn");
    let startY = e.touches[0].clientY;
    let originalY = 0;

    profileMenu.addEventListener("touchstart", (event) => {
        startY = event.touches[0].clientY;
        originalY = profileMenu.getBoundingClientRect().top;
    });

    profileMenu.addEventListener("touchmove", (event) => {
        const deltaY = event.touches[0].clientY - startY;
        if(deltaY > 0){
            profileMenu.style.transform = `translateY(${deltaY}px)`;
            profileMenu.style.transform += `scale(.97)`;
        }
        else {
            profileMenu.style.transform = `translateY(${deltaY/10}px)`;
        }
    });

    profileMenu.addEventListener("touchend", () => {
        // Prüfe, ob der Bereich überschritten wurde
        const threshold = 100;
        if (profileMenu.getBoundingClientRect().top - originalY > threshold) {

            profileMenu.style.transform = "translateY(100%)"; //nach unten fliegen

            if (profileMenuButton.open) {
                profileMenuButton.open = false;
            }
            profileMenu.style.transform = "translateY(0%)";
        } else {
            // Springe zurück zur Ausgangsposition
            profileMenu.style.transition = "transform 0.1s ease";
            profileMenu.style.transform = `translateY(${originalY}px)`;
        }
    });
}


function buttonSwipeUp(e) {
    const buttonMenu = document.getElementsByClassName("button-menu")[0];
    let startY = e.touches[0].clientY;
    let originalY = buttonMenu.getBoundingClientRect().top;
    

    buttonMenu.addEventListener("touchstart", (event) => {
        startY = event.touches[0].clientY;
        originalY = buttonMenu.getBoundingClientRect().top;
        console.debug("devvv" + originalY);
    });

    buttonMenu.addEventListener("touchmove", (event) => {
        const deltaY = event.touches[0].clientY - startY;

        console.debug("adsdasasadssad " + startY);
            
        if (startY > 590){
            if(deltaY > 0) {
                buttonMenu.style.transform = `translateY(${deltaY/10}px)`;
            }
            
            else {
                if (Math.abs(deltaY) < 400){
                    buttonMenu.style.transform = `translateY(${deltaY}px)`;
                }
                else{
                    buttonMenu.style.transform = `translateY(${-380 + deltaY/20}px)`;
                    
                }
            }
        }
        if (startY <= 590) {
            if(deltaY < 0) {
                buttonMenu.style.transform = `translateY(${-400 +deltaY/10}px)`;
            }
            
            else {
                if (Math.abs(deltaY) < 400){
                    buttonMenu.style.transform = `translateY(${-400 +deltaY}px)`;
                }
                else{
                    buttonMenu.style.transform = `translateY(${-380 +deltaY/20}px)`;
                    
                }
            }
        }
        
    });

    buttonMenu.addEventListener("touchend", () => {
        // Prüfe, ob der Bereich überschritten wurde
        const threshold = 0;
    
        if (startY <= 500) {
            if (buttonMenu.getBoundingClientRect().top - originalY < threshold) {
                // nach unten schließen
                buttonMenu.style.transition = "transform 0.1s ease";
                buttonMenu.style.transform = "translateY(-50vh)";
            } else {
                // zurück zur Ausgangsposition
                buttonMenu.style.transition = "transform 0.1s ease";
                buttonMenu.style.transform = "translateY(0vh)";
            }
        } else {
            if (originalY - buttonMenu.getBoundingClientRect().top > threshold) {
                // nach oben expanden
                buttonMenu.style.transition = "transform 0.1s ease";
                buttonMenu.style.transform = "translateY(-50vh)"; //zurück zur Ausgangsposition            
            } else {
                // zurück zur Ausgangsposition
                buttonMenu.style.transition = "transform 0.1s ease";
                buttonMenu.style.transform = "translateY(0vh)";
            }
        }
    });
    
}

function expandButtonsDesktop(e) {
    const buttonMenu = document.getElementsByClassName("button-menu")[0];
    let startY =  buttonMenu.getBoundingClientRect().top;

    console.debug("algoo: " + startY);

    if (startY > 500) {
        buttonMenu.style.transform = 'translateY(-50%)';
        e.target.style.transform = 'rotate(-45deg)';
    }
    else {
        buttonMenu.style.transform = 'translateY(0%)';
        e.target.style.transform = 'rotate(0deg)';
    }
}


function lightenColor(color, percent) {
    // Farbe in RGB-Werte aufteilen
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    // Helligkeit erhöhen
    r = Math.floor(r * (1 + percent / 100));
    g = Math.floor(g * (1 + percent / 100));
    b = Math.floor(b * (1 + percent / 100));

    // Grenzwerte sicherstellen (0 bis 255)
    r = Math.min(r, 255);
    g = Math.min(g, 255);
    b = Math.min(b, 255);

    // RGB-Werte zu HEX umwandeln
    let hex = `#${(r).toString(16).padStart(2, '0')}${(g).toString(16).padStart(2, '0')}${(b).toString(16).padStart(2, '0')}`;
    return hex;
}