async function authenticateUser(username, password) {
  try {
    const response = await axios.post('http://191.101.71.67:8080/api/v1/login/autenticacao', {
      email: username,
      senha: password,
    });
    console.log(response)
    if (response.status === 200 && response.data.token) {
      return response.data;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('Error during authentication:', error);

    if (error.response && error.response.status === 401) {
      throw new Error('Invalid username or password');
    } else {
      throw new Error('Authentication failed');
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'));
  welcomeModal.show();
});


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

// document.addEventListener('DOMContentLoaded', function () {
//   const aulaSelect = document.getElementById('aulaSelect');
//   const idProfessor = ID_PROFESSOR;
//   const url = `http://191.101.71.67:8080/sistema/v1/lista_aulas?idProfessor=${idProfessor}`;

//   fetch(url)
//     .then(response => response.json())
//     .then(data => {
//       data.forEach(aula => {
//         const option = document.createElement('option');
//         option.value = aula.id;
//         option.text = `${aula.materia}, ${aula.ano_letivo}, ${aula.turma}, ${aula.periodo}`;
//         aulaSelect.add(option);
//       });
//     })
//     .catch(error => {
//       console.error('Erro ao buscar a lista de aulas:', error);
//     });
// });