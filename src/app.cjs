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


// Serve arquivos estáticos (CSS, JavaScript, imagens)
app.use('/css', express.static(path.join(__dirname, 'project' , 'views', 'css')));
app.use('/js', express.static(path.join(__dirname, 'project', 'js')));
app.use('/imgs', express.static(path.join(__dirname, 'project', 'views', 'imgs')));

// Define o tipo MIME correto
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
});


app.use(session({
  secret: 'my-secret',
  resave: false,
  saveUninitialized: true
}));


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