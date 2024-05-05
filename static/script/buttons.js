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
    let userInput = parseFloat(window.prompt(buttonQuestion[e.target.id]).replace(',', '.'));
    if (!userInput) {
        console.debug("no userInput");
        return;
    }
    console.log(e.target.id);
    console.log(userInput);

    if (e.target.id === "btn-fat"){
        let data = await fetch("/api/data",  {
        method: "POST",
        body: JSON.stringify({
            fat: userInput,
            user: getUserId(),
            // date: "abc"  // post has no date
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => response.json())
    .catch((json) => console.log(json));
    }

    if (e.target.id === "btn-weight"){
        let data = await fetch("/api/data",  {
        method: "POST",
        body: JSON.stringify({
            weight: userInput,
            user: getUserId(),
            // date: "abc"  // post has no date
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => response.json())
    .catch((json) => console.log(json));
    }

    if (e.target.id === "btn-muscle"){
        let data = await fetch("/api/data",  {
        method: "POST",
        body: JSON.stringify({
            muscle: userInput,
            user: getUserId(),
            // date: "abc"  // post has no date
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => response.json())
    .catch((json) => console.log(json));
    }
    
    await drawChart();
    //alert("left clicked!");
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
        const threshold = 200;
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
    const buttonMenu = document.getElementsByClassName("button-menu");
    let startY = e.touches[0].clientY;
    let originalY = 0;
    console.log(buttonMenu);

    buttonMenu.addEventListener("touchstart", (event) => {
        startY = event.touches[0].clientY;
        originalY = buttonMenu.getBoundingClientRect().top;
    });

    buttonMenu.addEventListener("touchmove", (event) => {
        const deltaY = event.touches[0].clientY - startY;
        if(deltaY > 0) {
            buttonMenu.style.transform = `translateY(${deltaY/10}px)`;
        }
        else {
            if (Math.abs(deltaY) < 100){
                buttonMenu.style.transform = `translateY(${deltaY/10}px)`;
            }
            else{
                buttonMenu.style.transform = `translateY(${deltaY}px)`;
            }
        }
    });

    buttonMenu.addEventListener("touchend", () => {
        // Prüfe, ob der Bereich überschritten wurde
        const threshold = 200;
        if (buttonMenu.getBoundingClientRect().top - originalY > threshold) {

            buttonMenu.style.transform = "translateY(100%)"; //nach unten fliegen

        } else {
            // Springe zurück zur Ausgangsposition
            buttonMenu.style.transition = "transform 0.1s ease";
            buttonMenu.style.transform = `translateY(${originalY}px)`;
        }
    });
}