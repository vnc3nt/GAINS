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

async function leftClick(e) {
    let userInput = window.prompt(buttonQuestion[e.target.id])
    if (!userInput) {
        console.debug("no userInput");
        return;
    }
    console.log(e.target.id);
    console.log(userInput);

    if (e.target.id === "btn-fat"){
        let data = await fetch("/api/data",  { //TODO not correct adress when online
        method: "POST",
        body: JSON.stringify({
            fat: userInput,
            user: 1, //TODO change to dynamic UserID
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
        let data = await fetch("/api/data",  { //TODO not correct adress when online
        method: "POST",
        body: JSON.stringify({
            weight: userInput,
            user: 1, //TODO change to dynamic UserID
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
        let data = await fetch("/api/data",  { //TODO not correct adress when online
        method: "POST",
        body: JSON.stringify({
            muscle: userInput,
            user: 1, //TODO change to dynamic UserID
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

async function rightClick() { //edit old data
    //alert("right clicked!");
    window.location.assign("/edit")
    return false; //verhindert das Kontextmenü

    
    
    
}