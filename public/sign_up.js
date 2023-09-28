const form = document.querySelector("form"),
        nextBtn = form.querySelector(".nextBtn"),
        nextBtn1 = form.querySelector(".nextBtn1"),
        backBtn = form.querySelector(".backBtn"),
        backBtn1 = form.querySelector(".backBtn1"),
        allInput = form.querySelectorAll(".first input");


// nextBtn.addEventListener("click", ()=> {
//     allInput.forEach(input => {
//         if(input.value != ""){
//             form.classList.add('secActive');
//         }else{
//             form.classList.remove('secActive');
//         }
//     })
// })
nextBtn.addEventListener("click", ()=> {
            form.classList.add('secActive');
})
nextBtn1.addEventListener("click", ()=> {
    form.classList.add('thirdActive');
})



backBtn.addEventListener("click", () => form.classList.remove('secActive'));
backBtn1.addEventListener("click", () => form.classList.remove('thirdActive'));



function addSkill() {
    const skillDropdown = document.getElementById("skills");
    const selectedSkill = skillDropdown.value;
  
    if (selectedSkill) {
      const skillList = document.getElementById("skill-list");
      const skillItem = document.createElement("div");
      skillItem.className = "skill-item"; // Add a class for styling
      skillItem.textContent = selectedSkill;
  
      // Create a remove button
      const removeButton = document.createElement("span");
      removeButton.className = "remove-skill";
      removeButton.textContent = "x";
  
      // Add click event to remove the skill
      removeButton.addEventListener("click", function() {
        skillList.removeChild(skillItem);
      });
  
      // Append the skill item and remove button to the skill list
      skillItem.appendChild(removeButton);
      skillList.appendChild(skillItem);
      skillDropdown.value = ""; // Reset the dropdown selection
    }
  }
  
  // Add a click event listener to the "Add" button
  document.getElementById("add-skill").addEventListener("click", addSkill);
  