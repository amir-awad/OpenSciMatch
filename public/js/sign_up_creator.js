document.addEventListener('DOMContentLoaded', function () {
    const addMandatorySkillButton = document.getElementById('add-mandatory-skill');
    const addGoodToHaveSkillButton = document.getElementById('add-good-to-have-skill');
    const mandatorySkillSelect = document.getElementById('mandatory-skill');
    const goodToHaveSkillSelect = document.getElementById('good-to-have-skill');
    const skillList = document.getElementById('skill-list');

    addMandatorySkillButton.addEventListener('click', function () {
        const mandatorySkill = mandatorySkillSelect.value;

        if (mandatorySkill) {
            const skillItem = document.createElement('div');
            skillItem.classList.add('skill-item');
            skillItem.textContent = `Mandatory: ${mandatorySkill}`;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', function () {
                skillList.removeChild(skillItem);
            });

            skillItem.appendChild(removeButton);
            skillList.appendChild(skillItem);

            // Clear the mandatory skill selection after adding
            mandatorySkillSelect.value = '';
        }
    });

    addGoodToHaveSkillButton.addEventListener('click', function () {
        const goodToHaveSkill = goodToHaveSkillSelect.value;

        if (goodToHaveSkill) {
            const skillItem = document.createElement('div');
            skillItem.classList.add('skill-item');
            skillItem.textContent = `Good to Have: ${goodToHaveSkill}`;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', function () {
                skillList.removeChild(skillItem);
            });

            skillItem.appendChild(removeButton);
            skillList.appendChild(skillItem);

            // Clear the good-to-have skill selection after adding
            goodToHaveSkillSelect.value = '';
        }
    });
});
