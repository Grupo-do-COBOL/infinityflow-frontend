const express = require('express');
const path = require('path');
const axios = require('axios');
const session = require('express-session');
const _ = require('lodash'); // Adicione essa linha para incluir a biblioteca lodash
const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'project', 'views'));

app.use((req, res, next) => {
  if (req.path.endsWith('.css')) {
    res.type('text/css');
  } else if (req.path.endsWith('.js')) {
    res.type('text/javascript');
  } else if (req.path.endsWith('.jpg') || req.path.endsWith('.jpeg')) {
    res.type('image/jpeg');
  } else if (req.path.endsWith('.png')) {
    res.type('image/png');
  }
  next();
});

app.use('/css', express.static(path.join(__dirname, 'project', 'views', 'css')));
app.use('/js', express.static(path.join(__dirname, 'project', 'js')));
app.use('/imgs', express.static(path.join(__dirname, 'project', 'views', 'imgs')));

app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: true
}));



async function authenticate(email, senha) {
  try {
    const response = await axios.post('http://191.101.71.67:8080/api/v1/login/autenticacao', {
      email,
      senha,
    });

    return response.data.token;
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return null;
  }
}

async function getUserDataByEmail(email, token) {
  try {
    const response = await axios.get('http://191.101.71.67:8080/api/v1/usuarios/buscar_por_email', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        email
      }
    });



    const userData = response.data;
    console.log("userData:", userData); // Adicionado console.log para verificar o valor de userData
    console.log('Token de Acesso: ', token);
    return userData;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return null;
  }
}

async function getAulasList(token, userId) {
  try {
    const response = await axios.get('http://191.101.71.67:8080/sistema/v1/lista_aulas', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        idProfessor: userId
      }
    });

    if (!response.data || response.data.length === 0) {
      console.log('Não há aulas hoje');
      // Retorna um objeto especial quando não há aulas
      return 'Não há aulas hoje';
    } else {
      console.log('Dados Aulas: ', response.data);
      return response.data;
    }
  } catch (error) {
    console.error(error);
  }
}

async function getAlunosList(token, id_aula) {
  try {
    const response = await axios.get('http://191.101.71.67:8080/sistema/v1/lista_alunos', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        idAula: id_aula
      }
    });

    if (!response.data || response.data.length === 0) {
      console.log('Não há alunos na lista');
      // Retorna um array vazio quando não há alunos
      return ['Não há alunos na lista'];
    } else {
      console.log('Dados Alunos: ', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Erro ao buscar lista de alunos:', error);
    return [];
  }
}

async function getAttendanceReport(token, dataInicial, dataFinal) {
  try {
    const response = await axios.get('http://191.101.71.67:8080/sistema/v1/gerar_relatorios', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        dataInicial,
        dataFinal
      },
    });

    if (!response.data || response.data.length === 0) {
      console.log('Não há relatório de presença');
      // Retorna um array vazio quando não há relatório
      return [];
    } else {
      console.log('Dados do Relatório: ', response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Erro ao buscar relatório de presença:', error);
    return [];
  }
}


app.get('/attendance_report', async (req, res) => {
  if (req.session.authData) {
    const {
      token
    } = req.session.authData;
    const {
      dataInicial,
      dataFinal
    } = req.query;

    try {
      const reportData = await getAttendanceReport(token, dataInicial, dataFinal);
      res.json(reportData);
    } catch (error) {
      console.error('Erro ao buscar relatório de presença:', error);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(401);
  }
});



app.get('/', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const {
    email,
    senha
  } = req.body;

  try {
    const token = await authenticate(email, senha);

    if (token) {
      req.session.authData = {
        email: email,
        token: token,
      };

      res.redirect('/mainpage');
    } else {
      res.status(401).render('login', {
        errorMessage: 'Invalid username or password'
      });
    }
  } catch (error) {
    res.status(401).render('login', {
      errorMessage: 'Invalid username or password'
    });
  }
});


app.get('/mainpage', async (req, res) => {
  if (req.session.authData) {
    const {
      email,
      token
    } = req.session.authData;
    const selectedAulaId = req.session.selectedAulaId;

    if (!token) {
      console.error('Token inválido:', token);
      return res.status(401).send('Token inválido');
    }

    const userData = await getUserDataByEmail(email, token);

    if (!userData || !userData.professor_id) {
      console.error('Dados de usuário inválidos:', userData);
      return res.status(500).send('Não foi possível obter os dados do usuário');
    }

    try {
      const userId = userData.professor_id;
      let aulas = await getAulasList(token, userId);
      let alunos = [];

      if (selectedAulaId) {
        alunos = await getAlunosList(token, selectedAulaId);
      }

      // Verifica se `aulas` é um array
      if (Array.isArray(aulas)) {
        const aulasFiltradas = aulas.filter(aula => !aula.confirmacao);

        res.render('mainpage', {
          userInfo: userData,
          aulas: aulasFiltradas,
          alunos
        });
      } else {
        console.error('Aulas não é um array:', aulas);
        aulas = [];
        res.render('mainpage', {
          userInfo: userData,
          aulas,
          alunos
        });
      }
    } catch (error) {
      console.error("Erro ao buscar as aulas:", error);
      res.status(500).send(`Erro ao buscar as aulas: ${error.message}`);
    }

  } else {
    res.redirect('/login');
  }
});




app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.post('/setSelectedAula', async (req, res) => {
  const id_aula = req.body.id_aula;
  req.session.selectedAulaId = id_aula;

  if (req.session.authData) {
    const {
      token
    } = req.session.authData;

    try {
      const alunos = await getAlunosList(token, id_aula);
      res.json(alunos);
    } catch (error) {
      console.error('Erro ao buscar lista de alunos:', error);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(401);
  }
});

app.post('/registraPresenca', async (req, res) => {
  if (!req.session.authData) {
    res.sendStatus(401); // Unauthorized
    return;
  }

  const {
    token
  } = req.session.authData;

  // Extrair os dados do corpo da requisição
  const {
    id_aula,
    lista_presencas
  } = req.body;

  if (!id_aula || !lista_presencas || lista_presencas.length === 0) {
    res.status(400).json({
      message: 'id_aula ou lista_presencas inválidos!'
    });
    return;
  }

  try {
    // Fazendo uma requisição POST para o endpoint remoto
    const response = await axios.post('http://191.101.71.67:8080/sistema/v1/registrar_presencas', {
      id_aula,
      lista_presencas,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Status da resposta:', response.status);


    // Verifique o objeto de resposta para determinar se a requisição foi bem-sucedida
    if (response.status === 201) {
      res.status(201).json({
        message: 'Presenças registradas com sucesso!'
      });
    } else {
      // Manipule a resposta aqui, se necessário
      res.status(500).json({
        message: 'Erro ao registrar presenças!'
      });
    }
  } catch (error) {
    // Manipule o erro aqui, se necessário
    console.error(error);
    res.status(500).json({
      message: 'Erro ao registrar presenças!'
    });
  }
});






const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});