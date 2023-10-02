document.addEventListener("DOMContentLoaded", function () {
  const addMandatorySkillButton = document.getElementById(
    "add-mandatory-skill",
  );
  const addGoodToHaveSkillButton = document.getElementById(
    "add-good-to-have-skill",
  );
  const mandatorySkillSelect = document.getElementById("mandatory-skill");
  const goodToHaveSkillSelect = document.getElementById("good-to-have-skill");
  const skillList = document.getElementById("skill-list");
  const submitButton = document.getElementById("submit-button");

  addMandatorySkillButton.addEventListener("click", function () {
    const mandatorySkill = mandatorySkillSelect.value;

    if (mandatorySkill) {
      const skillItem = document.createElement("div");
      skillItem.classList.add("skill-item");
      skillItem.textContent = `Mandatory: ${mandatorySkill}`;

      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", function () {
        skillList.removeChild(skillItem);
      });

      skillItem.appendChild(removeButton);
      skillList.appendChild(skillItem);

      // Clear the mandatory skill selection after adding
      mandatorySkillSelect.value = "";
    }
  });

  addGoodToHaveSkillButton.addEventListener("click", function () {
    const goodToHaveSkill = goodToHaveSkillSelect.value;

    if (goodToHaveSkill) {
      const skillItem = document.createElement("div");
      skillItem.classList.add("skill-item");
      skillItem.textContent = `Good to Have: ${goodToHaveSkill}`;

      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", function () {
        skillList.removeChild(skillItem);
      });

      skillItem.appendChild(removeButton);
      skillList.appendChild(skillItem);

      // Clear the good-to-have skill selection after adding
      goodToHaveSkillSelect.value = "";
    }
  });

  submitButton.addEventListener("click", async function (event) {
    event.preventDefault();

    // Get all form values
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phone").value;
    const expertiseLevel = document.getElementById("expertise-level").value;
    const contributorType = document.getElementById("contributor-type").value;
    const projectDescription = document.getElementById(
      "project-description",
    ).value;
    const password = document.getElementById("password").value;

    const mandatorySkills = [];
    const goodToHaveSkills = [];

    // Collect skills from the skill list
    const skillItems = document.querySelectorAll(".skill-item");
    skillItems.forEach(function (skillItem) {
      const skillText = skillItem.textContent;
      // remove the "Remove" suffix from each skill
      skillItem.textContent = skillText.substring(0, skillText.length - 6);
      if (skillText.startsWith("Mandatory")) {
        mandatorySkills.push(skillText.split(": ")[1]);
      } else if (skillText.startsWith("Good to Have")) {
        goodToHaveSkills.push(skillText.split(": ")[1]);
      }
    });

    // Create a data object to send to the backend
    const data = {
      name,
      password,
      email,
      phoneNumber,
      expertiseLevel,
      contributorType,
      projectDescription,
      mandatorySkills,
      goodToHaveSkills,
    };

    await axios({
      method: "post",
      url: "/api/v1/auth/register-project-creator",
      data: data,
      validateStatus: () => true,
    })
      .then((response) => {
        if (response.status === 201) {
          window.location.href = "/index.html";
        } else {
          alert(response.data.msg);
        }
      })
      .catch((error) => {
        alert(error.response.data.msg);
      });
  });
});
