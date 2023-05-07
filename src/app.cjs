const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const axios = require('axios');
const session = require('express-session');
const app = express();
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./localStorage');

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'project', 'views'));


// Serve arquivos estáticos (CSS, JavaScript, imagens) e define o tipo MIME correto
app.use('/static', express.static(path.join(__dirname, 'project', 'views'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'text/javascript');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));


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

    if (response.status === 200 && response.data.token) {
      localStorage.setItem('token', response.data.token);
      console.log("token app.cjs: " + response.data.token)
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
  localStorage.setItem('email', email);
  console.log("email app.cjs: " + email);
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