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
    if (e.touches.length >= 2) {
        return;
    }
    e.preventDefault();
    touchStartTime = e.timeStamp;    // timeStamp in ms
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    console.debug("Touch start:", touchStartTime);
});


function findNextDraggable(node) {
    do {
        if (node.getAttribute("draggable") == "true") {
            return node;
        }
    } while ((node = node.parentNode));
    return null;
}


window.addEventListener("touchmove", (e) => {
    if (e.touches.length >= 2) { 
        touchSimulation = TOUCH_NORMAL;
        return;
    }
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
    let actualTarget = document.elementFromPoint(touchX, touchY);
    console.log("actual target", actualTarget);
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
});

window.addEventListener("touchend", (e) => {
    console.log("touch end diff:", e.timeStamp - touchStartTime);
    if (!touchStartTime || e.touches.length >= 2) {
        touchStartTime = null;
        return;
    }

    let diff = e.timeStamp - touchStartTime;  // ms 
    console.debug("end touch target", e.target);
    if (touchSimulation === TOUCH_DRAG) {
        e.preventDefault();
        let actualTarget = document.elementFromPoint(touchX, touchY);
        console.debug("Maybe drop", actualTarget);
        if (draggedTouchNode !== undefined) {
            draggedTouchNode.classList.remove("mobile-drag-element");
            draggedTouchNode.style.removeProperty("left");
            draggedTouchNode.style.removeProperty("top");
            draggedTouchNode = undefined;
        }
        actualTarget.dispatchEvent(new DragEvent("dragleave", {bubbles: true, dataTransfer: globalDatatransfer}));
        actualTarget.dispatchEvent(new DragEvent("dragend", {bubbles: true, dataTransfer: globalDatatransfer}));

        if (allowDrop) { 
            actualTarget.dispatchEvent(new DragEvent("drop", {bubbles: true, dataTransfer: globalDatatransfer}));
        }
        console.log("drop events");
        touchSimulation = TOUCH_NORMAL;
        globalDatatransfer = null;
    }
    else if (moveDistance < DRAG_DISTANCE) { // block clicks when it has been swiped
        // left click/right click simulation
        console.debug("Normal click")
        if (diff >= RIGHT_CLICK_TOUCH && touchSimulation === TOUCH_NORMAL) {
            e.preventDefault();
            e?.target.dispatchEvent(new Event("contextmenu", {bubbles: true}));  // event 
        }
        // else {  // don't handle left click because the defaults are probably optimized
        //     console.log("Left click");
        //     e?.target.dispatchEvent(new PointerEvent("click", {bubbles: true}));
        // }
    }
    touchStartTime = null;
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
    let userInput = parseFloat(window.prompt(buttonQuestion[e.target.id]))
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