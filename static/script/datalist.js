function handleSwipe() {
  // define the minimum distance to trigger the action
  const minDistance = 30;
  const container = document.querySelector('.swipe-container');
  const output = document.querySelector('.output');
  // get the distance the user swiped
  const swipeDistance = container.scrollLeft - container.clientWidth;
  if (swipeDistance < minDistance * -1) {
    console.debug('swiped left');
    alert("ask");
  } else if (swipeDistance > minDistance) {
    console.debug('swiped right');
    alert("ask");
  } else {
    console.debug(`did not swipe ${minDistance}px instead: ${swipeDistance}px`);
  }
}


async function leftClick(e) {
  let userInput = parseFloat(window.prompt(buttonQuestion[e.target.id]).replace(',', '.'));
  if (!userInput) {
      console.debug("no userInput");
      return;
  }
  console.log(e.target.innerText);
  console.log(userInput);

  if (e.target.id === "btn-fat"){ //TODO von Button verhalten zu Daten bearbeiten -> Datum von Event abgreifen statt Button.id
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