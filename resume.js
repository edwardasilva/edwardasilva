function downloadResume() {
    const link = document.createElement('a');
    link.href = 'resume.pdf';
    link.download = 'EDWARD_SILVA_RESUME_2024.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
