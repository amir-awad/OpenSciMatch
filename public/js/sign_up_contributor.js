document.addEventListener('DOMContentLoaded', function () {
    const addSkillButton = document.getElementById('add-skill');
    const skillSelect = document.getElementById('skill');
    const skillList = document.getElementById('skill-list');

    addSkillButton.addEventListener('click', function () {
        const selectedSkill = skillSelect.value;
        if (selectedSkill) {
            const skillItem = document.createElement('div');
            skillItem.classList.add('skill-item');
            skillItem.textContent = selectedSkill;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', function () {
                skillList.removeChild(skillItem);
            });

            skillItem.appendChild(removeButton);
            skillList.appendChild(skillItem);
        }
    });
});
