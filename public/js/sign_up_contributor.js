document.addEventListener("DOMContentLoaded", function () {
  const addSkillButton = document.getElementById("add-skill");
  const skillSelect = document.getElementById("skill");
  const skillList = document.getElementById("skill-list");
  const submitButton = document.getElementById("submit-button");

  addSkillButton.addEventListener("click", function () {
    const selectedSkill = skillSelect.value;
    if (selectedSkill) {
      const skillItem = document.createElement("div");
      skillItem.classList.add("skill-item");
      skillItem.textContent = selectedSkill;

      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", function () {
        skillList.removeChild(skillItem);
      });

      skillItem.appendChild(removeButton);
      skillList.appendChild(skillItem);
    }
  });

  submitButton.addEventListener("click", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phone-number").value;
    const skills = Array.from(skillList.children).map(
      (skillItem) => skillItem.textContent,
    );
    const expertiseLevel = document.getElementById("expertise-level").value;
    const availability = document.getElementById("availability-date").value;
    const description = document.getElementById("description").value;
    const contributorType = document.getElementById("contributor-type").value;

    const data = {
      name,
      password,
      email,
      phoneNumber,
      skills,
      expertiseLevel,
      availability,
      description,
      contributorType,
    };

    await axios({
      method: "post",
      url: "/api/v1/auth/register-contributor",
      data: data,
      validateStatus: () => true,
    })
      .then((response) => {
        console.log(response, "responseeee");

        if (response.status === 201) {
          window.location.href = "/index.html";
        } else {
          alert(response.data.msg);
        }
      })
      .catch((error) => {
        console.log(error, "errorrrrrr");
        alert(error.response.data.msg);
      });
  });
});
