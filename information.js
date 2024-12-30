// script.js
function downloadResume() {
  const link = document.createElement('a');
  link.href = 'resume.pdf';
  link.download = 'EDWARD_SILVA_RESUME_2024.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Updated Data Object with More Catalog-Accurate Descriptions
const infoData = {
  "deans-list": "The Dean's List is an academic award that recognizes students who have achieved high academic performance. I was honored to receive this award for my outstanding academic achievements at the Colorado School of Mines for my Freshman and Junior Fall.",
  "honor-roll": "The Honor Roll is an academic award that recognizes students who have achieved high academic performance. I was honored to receive this award for my outstanding academic achievements at the Colorado School of Mines for my Sophomore Fall and Spring.",
  "provost-scholarship": "The Provost Scholarship is awarded to students demonstrating outstanding academic performance and leadership potential. It provided $9,000 per year to support my studies at the Colorado School of Mines.",
  "c-mapp": "As a recipient of the C-MAPP (Computing-Mines Affiliates Partnership Program) Scholarship at the Colorado School of Mines, I was recognized for my academic achievements and involvement in computer science activities. The scholarship supports students who demonstrate excellence in their field, with a focus on fostering connections between academia and industry. This opportunity not only provided financial assistance but also allowed me to engage in professional learning activities and expand my network within the tech industry.",
  "abs-scholar": "The American Bureau of Shipping Scholar award recognizes students who demonstrate outstanding academic performance and commitment to engineering disciplines. This scholarship supported my academic journey with $4,000 in funding.",

  "fundamentals-electric-machinery":
    "Principles of rotating electric machines and transformers, including electromagnetic theory, machine construction, and performance characteristics. Focuses on modeling, analysis, and control of DC and AC machines for practical engineering applications.",

  "software-engineering":
    "Introduces modern software development practices such as agile methodologies, object-oriented design, and project management. Emphasizes teamwork, communication, and continuous integration through practical software projects.",

  "linear-algebra":
    "Covers matrix theory, vector spaces, linear transformations, eigenvalues, and eigenvectors. Explores applications in engineering and science through analytical and computational methods.",

  "engineering-electromagnetics":
    "Focuses on electromagnetic theory, including Maxwell's equations, wave propagation, reflection, and transmission. Applies these concepts to antennas, waveguides, and communication systems.",

  "computer-organization":
    "Studies hardware architecture from a programmer’s perspective, covering memory hierarchies, instruction sets, CPU design, and I/O organization. Emphasizes the hardware-software interface and performance considerations.",

  "differential-equations":
    "Covers methods for solving ordinary differential equations with an emphasis on engineering applications. Introduces Laplace transforms, numerical methods, and modeling real-world systems.",

  "embedded-systems":
    "Examines microcontroller-based system design and real-time operations. Topics include hardware interfacing, sensor integration, and embedded C/C++ programming. Emphasizes laboratory-based projects.",

  "data-structures-algorithms":
    "Covers fundamental data structures (lists, stacks, queues, trees) and algorithms (search, sort, hashing) essential to computer science. Emphasizes algorithm complexity, software design, and implementation.",

  "calculus-1-3":
    "A three-course sequence exploring limits, derivatives, integrals, and series, culminating in multivariable calculus. Designed to build a solid foundation for advanced engineering and scientific study.",

  "feedback-control-systems":
    "Introduces feedback control concepts including system modeling, stability analysis, and controller design. Topics include root locus, Bode plots, and frequency response methods in mechanical and electrical applications.",

  "intro-csharp-programming":
    "Introduces the C# programming language, covering syntax, data types, and object-oriented principles. Emphasizes practical application development and debugging techniques.",

  "chemistry-1-2":
    "Two-course sequence covering fundamental chemical principles, including atomic structure, bonding, thermodynamics, kinetics, and equilibria. Laboratory work reinforces theoretical and engineering-related concepts.",

  "signals-systems":
    "Examines continuous and discrete-time signals and systems, convolution, Fourier and Laplace transforms, and filtering. Includes applications to communications, control, and signal processing.",

  "intro-linux-os":
    "Provides an introduction to the Linux operating system, covering installation, basic administration, command-line usage, and shell scripting. Emphasizes practical skills for engineering and computing tasks.",

  "physics-1-2":
    "Two-course sequence covering mechanics, electromagnetism, waves, and thermodynamics. Laboratory experiments reinforce core physical concepts and engineering applications.",

  "electrical-circuits":
    "Covers DC and AC circuit analysis, circuit theorems, operational amplifiers, and transient response. Emphasizes design and testing through laboratory projects and simulations.",

  "programming-challenges-1":
    "Focuses on algorithmic problem-solving through hands-on programming exercises and competitions. Emphasizes efficiency, correctness, and robust coding practices.",

  "digital-logic":
    "Covers the principles of digital logic design, including Boolean algebra, logic gates, and combinational/sequential circuits. Explores design and implementation of basic digital systems and hardware.",

  "mta-java": "Microsoft Technical Associate -- Java Programming certification demonstrates proficiency in Java programming, including understanding of Java syntax, object-oriented programming, and basic Java development.",
  "mta-python": "Microsoft Technical Associate -- Python Programming certification validates knowledge of Python programming, including syntax, data structures, and basic programming concepts.",
  "matlab-signal": "Matlab Signal Processing Onramp certification covers the basics of signal processing using Matlab, including filtering, Fourier transforms, and signal analysis.",
  "matlab-fundamentals": "Matlab Fundamentals Onramp certification provides foundational knowledge of Matlab, including basic operations, programming, and data visualization."
};

// Function to adjust the position of the info-box
function adjustInfoBoxPosition(button, infoBox) {
  const buttonRect = button.getBoundingClientRect();
  const infoBoxRect = infoBox.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Align the info-box to the button
  infoBox.style.left = `${buttonRect.left + buttonRect.width / 2 - infoBoxRect.width / 2}px`;
  infoBox.style.top = `${buttonRect.bottom + window.scrollY + 5}px`; // Adjusted to point to the link

  // Ensure the info-box does not go off the screen horizontally
  if (infoBoxRect.right > viewportWidth) {
    infoBox.style.left = `${viewportWidth - infoBoxRect.width - 10}px`;
  } else if (infoBoxRect.left < 0) {
    infoBox.style.left = '10px';
  }

  // Ensure the info-box does not go off the screen vertically
  if (infoBoxRect.bottom > viewportHeight) {
    infoBox.style.top = `${buttonRect.top + window.scrollY - infoBoxRect.height - 5}px`;
  }

  // Recalculate the position after adjustments
  const adjustedInfoBoxRect = infoBox.getBoundingClientRect();
  if (adjustedInfoBoxRect.right > viewportWidth) {
    infoBox.style.left = `${viewportWidth - adjustedInfoBoxRect.width - 10}px`;
  } else if (adjustedInfoBoxRect.left < 0) {
    infoBox.style.left = '10px';
  }
  if (adjustedInfoBoxRect.bottom > viewportHeight) {
    infoBox.style.top = `${buttonRect.top + window.scrollY - adjustedInfoBoxRect.height - 5}px`;
  }
}

// Add hover and click event listeners to all buttons
document.querySelectorAll('.info-button').forEach(button => {
  button.addEventListener('mouseover', () => {
    const infoKey = button.getAttribute('data-info'); // Get the data-info attribute
    const infoBox = button.nextElementSibling; // Get the next sibling info box

    // Update content and show the box
    infoBox.querySelector('.info-content').textContent = infoData[infoKey];
    infoBox.classList.remove('hidden');

    // Adjust position to ensure it stays within the viewport
    adjustInfoBoxPosition(button, infoBox);
  });

  button.addEventListener('mouseout', (event) => {
    const infoBox = button.nextElementSibling; // Get the next sibling info box

    // Check if the mouse is moving to the info-box
    if (!infoBox.contains(event.relatedTarget)) {
      // Hide the box if not active
      if (!button.classList.contains('active')) {
        infoBox.classList.add('hidden');
      }
    }
  });

  button.addEventListener('click', () => {
    const infoBox = button.nextElementSibling; // Get the next sibling info box

    // Toggle active class
    button.classList.toggle('active');
    if (button.classList.contains('active')) {
      infoBox.classList.remove('hidden');
    } else {
      infoBox.classList.add('hidden');
    }
  });

  // Add event listeners to the info-box to keep it visible while hovering
  const infoBox = button.nextElementSibling;
  infoBox.addEventListener('mouseover', () => {
    infoBox.classList.remove('hidden');
  });

  infoBox.addEventListener('mouseout', (event) => {
    // Check if the mouse is moving to the button
    if (!button.contains(event.relatedTarget)) {
      // Hide the box if not active
      if (!button.classList.contains('active')) {
        infoBox.classList.add('hidden');
      }
    }
  });
});

// Hide info-box when clicking outside
document.addEventListener('click', (event) => {
  document.querySelectorAll('.info-button').forEach(button => {
    const infoBox = button.nextElementSibling; // Get the next sibling info box
    if (!button.contains(event.target) && !infoBox.contains(event.target)) {
      button.classList.remove('active');
      infoBox.classList.add('hidden');
    }
  });
});
