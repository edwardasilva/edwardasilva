// script.js

// Data object with information
const infoData = {
    "deans-list": "The Dean's List is an academic award that recognizes students who have achieved high academic performance. I was honored to receive this award for my outstanding academic achievements at the Colorado School of Mines for my Freshman and Junior Fall.",
    "honor-roll": "The Honor Roll is an academic award that recognizes students who have achieved high academic performance. I was honored to receive this award for my outstanding academic achievements at the Colorado School of Mines for my Sophomore Fall and Spring.",
    "provost-scholarship": "The Provost Scholarship is awarded to students demonstrating outstanding academic performance and leadership potential. It provided $9,000 per year to support my studies at the Colorado School of Mines.",
    "c-mapp": "As a recipient of the C-MAPP (Computing-Mines Affiliates Partnership Program) Scholarship at the Colorado School of Mines, I was recognized for my academic achievements and involvement in computer science activities. The scholarship supports students who demonstrate excellence in their field, with a focus on fostering connections between academia and industry. This opportunity not only provided financial assistance but also allowed me to engage in professional learning activities and expand my network within the tech industry.",
    "abs-scholar": "The American Bureau of Shipping Scholar award recognizes students who demonstrate outstanding academic performance and commitment to engineering disciplines. This scholarship supported my academic journey with $4,000 in funding."
};

// Add hover event listeners to all buttons
document.querySelectorAll('.info-button').forEach(button => {
    button.addEventListener('mouseover', () => {
        const infoKey = button.getAttribute('data-info'); // Get the data-info attribute
        const infoBox = button.nextElementSibling; // Get the next sibling info box

        // Update content and show the box
        infoBox.querySelector('.info-content').textContent = infoData[infoKey];
        infoBox.classList.remove('hidden');
    });

    button.addEventListener('mouseout', () => {
        const infoBox = button.nextElementSibling; // Get the next sibling info box

        // Hide the box
        infoBox.classList.add('hidden');
    });
});
