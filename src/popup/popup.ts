
let buttonConnect = document.getElementById('buttonConnect') as HTMLElement;
let htmlConnectionState = document.getElementById("connectionState") as HTMLElement;



function connectAnki()
{
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    "action": "deckNames",
    "version": 6
  });

  var requestOptions: RequestInit  = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  try {
    fetch("http://localhost:8765", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

  } catch (error) {
    console.error("Woops");  
  }
}


buttonConnect.addEventListener("click", async () =>
{
  connectAnki();
});
