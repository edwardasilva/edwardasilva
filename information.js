// Information content for dynamic loading
const infoContent = {
  // Education
  "deans-list": "Achieved Dean's List status for maintaining a GPA of 3.8 or higher for two semesters.",
  "honor-roll": "Recognized on the Honor Roll for maintaining a GPA between 3.5 and 3.79 for two semesters.",
  "provost-scholarship": "Awarded a merit-based scholarship of $9,000 per year for academic excellence throughout undergraduate studies.",
  "c-mapp": "Selected as a Colorado Mines Advanced Planning Program Scholar receiving $1,000 annually for demonstrating academic potential and leadership qualities.",
  "abs-scholar": "Recipient of the prestigious American Bureau of Shipping Scholarship valued at $4,000 for excellence in engineering studies related to maritime applications.",
  
  // Certifications
  "matlab-machine-learning": "Completed the MATLAB Machine Learning Onramp certification, demonstrating proficiency in implementing machine learning algorithms using MATLAB.",
  "matlab-signal": "Earned the MATLAB Signal Processing Onramp certification, validating skills in digital signal processing techniques and algorithms.",
  "matlab-fundamentals": "Achieved the MATLAB Fundamentals Onramp certification, confirming mastery of essential MATLAB programming and problem-solving capabilities.",
  "mta-java": "Earned Microsoft Technical Associate certification in Java Programming, validating proficiency in Java syntax, data structures, and object-oriented programming concepts.",
  "mta-python": "Received Microsoft Technical Associate certification in Python Programming, demonstrating competency in Python syntax, functions, and software development principles.",
  
  // Courses
  "fundamentals-electric-machinery": "Study of electromechanical energy conversion devices including DC, induction, and synchronous machines. Topics include magnetic circuit analysis, machine modeling, and control principles.",
  "engineering-electromagnetics": "Comprehensive study of electromagnetic field theory, Maxwell's equations, wave propagation, and applications in modern electrical engineering systems.",
  "embedded-systems": "Design and implementation of microcontroller-based systems, including hardware-software integration, real-time operations, and interfacing with sensors and actuators.",
  "feedback-control-systems": "Analysis and design of control systems with feedback, including stability analysis, root locus, Bode plots, and PID controller design techniques.",
  "signals-systems": "Study of continuous and discrete signals and systems, including Fourier analysis, Laplace transforms, filtering, sampling, and digital signal processing fundamentals.",
  "electrical-circuits": "Analysis of electrical circuits using Kirchhoff's laws, Thevenin/Norton equivalents, and other circuit analysis techniques for both DC and AC circuits.",
  "digital-logic": "Design and analysis of digital logic circuits, including Boolean algebra, combinational and sequential logic, and introduction to hardware description languages.",
  "software-engineering": "Application of engineering principles to software development, including requirements analysis, design, testing, and project management methodologies.",
  "computer-organization": "Study of computer architecture and organization, including instruction set design, processor implementation, memory hierarchy, and I/O systems.",
  "data-structures-algorithms": "Implementation and analysis of fundamental data structures and algorithms, including lists, trees, graphs, sorting, searching, and algorithm complexity analysis.",
  "intro-csharp-programming": "Introduction to C# programming language, .NET framework, object-oriented concepts, and Windows application development.",
  "intro-linux-os": "Introduction to Linux operating system, command-line interface, shell scripting, system administration, and open-source software development.",
  "programming-challenges-1": "Intensive problem-solving course focused on algorithmic thinking, competitive programming techniques, and efficient implementation strategies.",
  "linear-algebra": "Study of vector spaces, linear transformations, matrices, determinants, eigenvalues, and applications in engineering and computer science.",
  "differential-equations": "Solution techniques for ordinary differential equations, systems of differential equations, and applications in engineering systems modeling.",
  "calculus-1-3": "Comprehensive study of differential and integral calculus, including limits, derivatives, integrals, infinite series, and multivariable calculus with applications.",
  "chemistry-1-2": "Fundamental principles of chemistry, including atomic structure, chemical bonding, thermodynamics, kinetics, and equilibrium with laboratory experiments.",
  "physics-1-2": "Study of classical mechanics, electricity, magnetism, thermodynamics, and waves with applications in engineering and problem-solving techniques."
};

// Optimize performance by using event delegation
document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle initialization
  initializeThemeToggle();
  
  // Initialize lazy loading for sections
  initializeLazyLoading();
  
  // Add event delegation for info buttons
  document.body.addEventListener('click', function(event) {
    // Handle info buttons
    if (event.target.classList.contains('info-button')) {
      handleInfoButtonClick(event.target);
    }
  });
});

// Download resume function
function downloadResume() {
  // Create link to resume file
  const link = document.createElement('a');
  link.href = 'assets/Edward_Silva_Resume.pdf';
  link.download = 'Edward_Silva_Resume.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Initialize theme toggle
function initializeThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Update icon
      toggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
    });
  }
}

// Handle info button clicks efficiently
function handleInfoButtonClick(button) {
  const infoId = button.getAttribute('data-info');
  const infoBox = button.nextElementSibling;
  
  if (infoBox) {
    // Check if content is already loaded
    if (!infoBox.querySelector('.info-content').textContent) {
      infoBox.querySelector('.info-content').textContent = infoContent[infoId] || 'Information not available';
    }
    
    // Toggle visibility with class for animation
    infoBox.classList.toggle('active');
  }
}

// Initialize lazy loading for sections
function initializeLazyLoading() {
  // Intersection Observer for lazy loading sections
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  });
  
  // Observe all sections
  document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });
}
