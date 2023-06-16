function getJsonDataFromScriptTag(scriptId) {
  const scriptTag = document.getElementById(scriptId);
  if (!scriptTag) {
    console.error('Script tag not found:', scriptId);
    return null;
  }
  const jsonData = scriptTag.textContent;
  try {
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Failed to parse JSON from script tag', error);
    return null;
  }
}


function populateAulaSelect() {
  const aulaSelect = document.getElementById('aulaSelect');
  const data = getJsonDataFromScriptTag('userAndAulasData');

  // Se data.aulas é uma string, adicione essa string como uma opção e retorne
  if (typeof data.aulas === 'string') {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Não há aulas hoje';
    aulaSelect.appendChild(option);
    return;
  }

  // Caso contrário, assuma que data.aulas é um array e adicione cada aula como uma opção
  const aulas = Array.isArray(data.aulas) ? data.aulas : [];
  aulas.forEach(aula => {
    const option = document.createElement('option');
    option.value = aula.id_aula;
    option.textContent = `${aula.materia}, ${aula.ano_letivo}ª série, Turma ${aula.turma}, ${aula.periodo}`;
    aulaSelect.appendChild(option);
  });

  // Adicione isso dentro do manipulador 'change' do aulaSelect
  aulaSelect.addEventListener('change', function () {
    const selectedAulaId = this.value;

    axios.post('/setSelectedAula', {
        id_aula: selectedAulaId
      })
      .then(function (response) {
        // Limpa a tabela de alunos atual
        const tableBody = document.querySelector('#attendance tbody');
        tableBody.innerHTML = '';

        // Adiciona novos alunos à tabela
        const alunos = response.data || [];
        alunos.forEach(aluno => {
          const row = document.createElement('tr');

          const nameCell = document.createElement('td');
          nameCell.textContent = aluno.nome;
          row.appendChild(nameCell);

          const attendanceCell = document.createElement('td');
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = `${aluno.id}`;
          attendanceCell.appendChild(checkbox);
          row.appendChild(attendanceCell);

          tableBody.appendChild(row);
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  });

}

// Request para registrar presença dos alunos
document.getElementById("registrarPresenca").addEventListener('click', function () {
  // Obter todas as linhas da tabela de presenças
  const rows = document.querySelectorAll('#attendance tbody tr');

  // Criar uma lista vazia para armazenar os registros de presença
  let lista_presencas = [];

  // Iterar por cada linha
  for (let i = 0; i < rows.length; i++) {
    // Obter o ID do aluno a partir do ID do checkbox
    const checkbox = rows[i].querySelector('input[type=checkbox]');
    const alunoId = checkbox.id;

    // Determinar o status de presença com base na marcação do checkbox
    const presenca = checkbox.checked ? 'P' : 'A';

    // Adicionar o registro de presença à lista
    lista_presencas.push({
      id_aluno: alunoId,
      situacao: presenca
    });
  }

  console.log('Dados de Presença: ', lista_presencas);

  // Obter o ID da aula selecionada
  const selectedAulaId = document.getElementById('aulaSelect').value;

  // Agora, faça a solicitação POST com a lista completa de presenças
  axios.post('/registraPresenca', {
      id_aula: selectedAulaId,
      lista_presencas: lista_presencas
    })

    .then(function () {
      // Manipule a resposta aqui, se necessário
      alert('Presenças registradas com sucesso!');
    })
    .catch(function (error) {
      // Manipule o erro aqui, se necessário
      console.log(error);
      alert('Erro ao registrar presenças!');
    });
});




// Função para exibir a modal de boas-vindas com o select de aulas
function showOptionModal() {

  if (localStorage.getItem('isRedirectedFromModal') === 'true') {
    localStorage.removeItem('isRedirectedFromModal');
    return; // Não mostre a modal
  } else if (localStorage.getItem('optionModalShown') === 'true') {
    localStorage.removeItem('optionModalShown');
    return;
  }

  const data = getJsonDataFromScriptTag('userAndAulasData');
  const userInfo = data ? data.userInfo : {};
  const userName = document.querySelector('#optionModalLabel');
  userName.textContent = `Bem-vindo, ${userInfo.nome_usuario}!`;

  const optionModal = new bootstrap.Modal(document.getElementById('optionModal'));
  optionModal.show();


}


// Função para exibir a modal de boas-vindas com o select de aulas
function showWelcomeModal() {
  const data = getJsonDataFromScriptTag('userAndAulasData');
  const userInfo = data ? data.userInfo : {};
  const userName = document.querySelector('#welcomeModalLabel');
  userName.textContent = `${userInfo.nome_usuario}`;

  populateAulaSelect();

  const welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'));
  welcomeModal.show();
}

function loadAttendanceReport(dataInicial, dataFinal) {
  $.get('/attendance_report', {
    dataInicial,
    dataFinal
  }, function (data) {
    // Limpa a tabela antes de adicionar novos dados
    $('#attendance-report tbody').empty();

    // Itera sobre cada item nos dados retornados
    $.each(data, function (i, item) {
      // Adiciona uma nova linha na tabela para cada item
      $('#attendance-report tbody').append(`
        <tr>
          <td>${item.nome_aluno}</td>
          <td>${item.bimestre}</td>
          <td>${item.periodo}</td>
          <td>${item.turma}</td>
          <td>${item.disciplina}</td>
          <td>${item.presencas}</td>
          <td>${item.faltas}</td>
        </tr>
      `);
    });
  });
}



// Adiciona eventos de clique para o botão para exibir o modal de seleção de datas
document.getElementById('openReports').addEventListener('click', function () {
  // Abre o modal para seleção de datas
  const dateSelectionModal = new bootstrap.Modal(document.getElementById('dateSelectionModal'));
  dateSelectionModal.show();
});

document.getElementById('backButton').addEventListener('click', function () {
  $('#dateSelectionModal').modal('hide');
  $('#optionModal').modal('show');
});

// Adiciona eventos de clique para o botão para confirmar a seleção de datas
document.getElementById('confirmDateSelection').addEventListener('click', function () {
  // Validação das datas
  let dataInicial = document.getElementById('dataInicialSelection').value;
  let dataFinal = document.getElementById('dataFinalSelection').value;

  if (dataInicial && dataFinal) {
    const dataInicialMoment = moment(dataInicial, 'YYYY-MM-DD');
    const dataFinalMoment = moment(dataFinal, 'YYYY-MM-DD');

    if (dataFinalMoment.isBefore(dataInicialMoment)) {
      alert('Data final não pode ser antes da data inicial');
      return;
    }

    // Formata as datas no formato necessário antes de passar para a função
    dataInicial = dataInicialMoment.format('YYYY/MM/DD');
    dataFinal = dataFinalMoment.format('YYYY/MM/DD');

    const tabs = document.querySelector('.tabs');
    const attendanceSection = document.querySelector('.attendance-section');

    // Verifica se as abas estão escondidas
    if (tabs.style.display === 'none') {
      // Se estão escondidas, mostra as abas e esconde a seção de presença
      tabs.style.display = 'block';
      attendanceSection.style.display = 'none';

      // Carrega os dados do relatório de presença apenas quando o botão é clicado
      loadAttendanceReport(dataInicial, dataFinal);
    } else {
      // Se não estão escondidas, esconde as abas e mostra a seção de presença
      tabs.style.display = 'none';
      attendanceSection.style.display = 'block';
    }
  } else {
    alert('Não há relatórios para exibir nesta data');
  }
});

// Evento de clique para o botão "Filtrar"
document.getElementById('filtraRelatorio').addEventListener('click', function (event) {
  // Previne o comportamento padrão do formulário
  event.preventDefault();

  // Validação das datas
  let dataInicial = document.getElementById('dataInicial').value;
  let dataFinal = document.getElementById('dataFinal').value;

  if (dataInicial && dataFinal) {
    const dataInicialMoment = moment(dataInicial, 'YYYY-MM-DD');
    const dataFinalMoment = moment(dataFinal, 'YYYY-MM-DD');

    if (dataFinalMoment.isBefore(dataInicialMoment)) {
      alert('Data final não pode ser antes da data inicial');
      return;
    }

    // Formata as datas no formato necessário antes de passar para a função
    dataInicial = dataInicialMoment.format('YYYY/MM/DD');
    dataFinal = dataFinalMoment.format('YYYY/MM/DD');

    // Aqui você pode chamar a função que irá filtrar o relatório de faltas
    loadAttendanceReport(dataInicial, dataFinal);
  } else {
    alert('Por favor, selecione as datas inicial e final');
  }
});




// Chama a função showOptionModal quando o DOM estiver carregado para abrir a modal com o que o professor gostaria de fazer 
document.addEventListener('DOMContentLoaded', showOptionModal);

// Adiciona eventos de clique para o botão para exibir a modal com as aulas do dia
document.getElementById('openWelcomeModal').addEventListener('click', showWelcomeModal);