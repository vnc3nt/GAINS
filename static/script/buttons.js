document.getElementById("btn-fat").onmousedown = function(event) {
    if (event.button == 2) {
        alert("right clicked!");
    }
}

document.getElementById("btn-weight").onmousedown = function(event) {
    if (event.button == 2) {
        alert("right clicked!");
    }
    if (event.button == 0) {
        alert("left clicked!");
    }
}

document.getElementById("btn-muscle").onmousedown = function(event) {
    if (event.button == 2) {
        alert("right clicked!");
    }
}