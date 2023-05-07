document.addEventListener('DOMContentLoaded', function() {
  const startClassBtn = document.getElementById('startClassBtn');

  if (startClassBtn) {
    startClassBtn.addEventListener('click', function() {
      const selectedClass = document.querySelector('.form-select').value;
      if (selectedClass !== "Escolha uma aula") {
        const attendanceTab = document.getElementById('attendance-tab');
        attendanceTab.classList.add('active');
        const welcomeModal = bootstrap.Modal.getInstance(document.getElementById('welcomeModal'));
        welcomeModal.hide();
      } else {
        alert('Por favor, selecione uma aula.');
      }
    });
  }
});
