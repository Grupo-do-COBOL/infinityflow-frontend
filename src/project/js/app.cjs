const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Define o tipo MIME para arquivos CSS
app.use('/views/css', (req, res, next) => {
  res.type('text/css');
  next();
});

// Define o tipo MIME para arquivos JS
app.use('/project/js', (req, res, next) => {
  res.type('text/javascript');
  next();
});


// Define o tipo MIME para arquivos de imagem
app.use('/project/views/imgs', (req, res, next) => {
  res.type('image/png');
  next();
});

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

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  console.log(email, senha);
  try {
    const authData = await authenticateUser(email, senha);
    req.session.authData = authData;
    res.redirect('/mainpage');
  } catch (error) {
    res.status(401).render('login', { errorMessage: 'Invalid username or password' });
  }
});

app.get('/mainpage', (req, res) => {
  res.send('Welcome to the main page!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
