const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const axios = require('axios');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));


// Serve arquivos estáticos (CSS, JavaScript, imagens) e define o tipo MIME correto
app.use('/static', express.static(path.join(__dirname, '..', 'views')), (req, res, next) => {
  if (req.path.endsWith('.css')) {
    res.type('text/css');
  } else if (req.path.endsWith('.js')) {
    res.type('text/javascript');
  } else if (req.path.endsWith('.jpg') || req.path.endsWith('.jpeg')) {
    res.type('image/jpg');
  } else if (req.path.endsWith('.png')) {
    res.type('image/png');
  }
  next();
});

app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: true
}));

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
  console.log(email, senha);
  try {
    const authData = await authenticateUser(email, senha);
    req.session.authData = authData
    res.redirect('/mainpage');
  } catch (error) {
    res.status(401).render('login', {
      errorMessage: 'Invalid username or password'
    });
  }
});

app.get('/mainpage', (req, res) => {
  if (req.session.authData) {
    res.render('mainpage', {
      user: req.session.authData
    });
  } else {
    res.redirect('/login');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});