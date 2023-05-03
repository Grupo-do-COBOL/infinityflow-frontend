const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'your-session-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Dummy users data
let users = [
  { id: 1, name: 'User One', role: 'PROFESSOR', username: 'user1', password: '$2b$10$abcdef' },
  { id: 2, name: 'User Two', role: 'PROFESSOR', username: 'user2', password: '$2b$10$ghijkl' },
];

// Configure Passport
passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = users.find(u => u.username === username);
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Routes
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/mainpage',
  failureRedirect: '/login',
}));

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { registerNameInput, registerRoleInput, registerEmailInput, registerPasswordInput } = req.body;
  const hashedPassword = await bcrypt.hash(registerPasswordInput, 10);
  const newUser = {
    id: users.length + 1,
    name: registerNameInput,
    role: registerRoleInput,
    username: registerEmailInput,
    password: hashedPassword,
  };
  users.push(newUser);
  res.redirect('/login');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

app.get('/mainpage', isAuthenticated, (req, res) => {
  res.render('mainpage', { user: req.user });
});

// Start the server
const port = process.env.PORT || 3070;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
