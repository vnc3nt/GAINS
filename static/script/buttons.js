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
    console.debug(userInput);
    let data = await fetch("http://localhost:5000/api/data",  { //TODO not correct adress when online
        method: "POST",
        body: JSON .stringify({
            fat: 4833,
            weight: 4750,
            muscle: 1400,
            user: 1,
            // date: "abc"  // post has no date
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => response.json())
    .catch((json) => console.log(json));

    console.log(data);
    //alert("left clicked!");
}

function rightClick() { //edit old data
    alert("right clicked!");
    return false; //verhindert das Kontextmenü
}