// edit-card.js

// Function to load and insert card.html into the card-container div
function loadCard() {
  console.log("carrrrrdddd");
  const cardContainer = document.getElementById("card-container");
  fetch("../contributor_card.html") // Load card.html
    .then((response) => response.text())
    .then((data) => {
      cardContainer.innerHTML = data; // Insert card.html content into the card-container div
    })
    .catch((error) => console.error("Error loading card.html:", error));
}
loadCard();
// Call the function to load the card when the page loads
// window.addEventListener("load", loadCard);
