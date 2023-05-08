
document.addEventListener('DOMContentLoaded', function () {
  // Initialize the welcomeModal
  var welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'));

  welcomeModal.show();

  // Add this event listener to call fetchUserData() when the modal is shown
  document.getElementById('welcomeModal').addEventListener('shown.bs.modal', function () {
    fetchUserData();
  });

  const startClassBtn = document.getElementById('startClassBtn');
  if (startClassBtn) {
    startClassBtn.addEventListener('click', function () {
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

  async function fetchUserData() {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');

    if (email && token) {
      try {
        const response = await fetch(`http://191.101.71.67:8080/api/v1/usuarios/buscar_por_email?email=${email}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          document.getElementById('welcomeModalLabel').innerHTML = 'Bem-vindo, ' + data.nome_usuario + '!';
          localStorage.setItem('ProfessorID', data.professor_id);
          console.log(email, token, data.professor_id);
        } else {
          throw new Error('Error fetching user name');
        }
      } catch (error) {
        console.error('Error during fetching user name:', error);
      }
    }

    const idProfessor = localStorage.getItem('ProfessorID');
    console.log('Token:', token);
    console.log('IdProfessor:', idProfessor);
    fetchAulas();
  }

  function fetchAulas() {
    const aulaSelect = document.getElementById('aulaSelect');
    const IdProfessor = localStorage.getItem('ProfessorID');
    const token = localStorage.getItem('token');
    const url = `http://191.101.71.67:8080/sistema/v1/lista_aulas?idProfessor=${IdProfessor}`;

    fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar a lista de aulas');
        }
        return response.json();
      })
      .then(data => {
        data.forEach(aula => {
          if (!aula.confirmacao) {
            const option = document.createElement('option');
            option.value = aula.id_aula;
            option.text = `${aula.materia}, ${aula.ano_letivo}ª série, Turma ${aula.turma}, Período: ${aula.periodo}`;
            aulaSelect.add(option);
          }
        });
      })
      .catch(error => {
        console.error('Erro ao buscar a lista de aulas:', error);
      });
  }

});