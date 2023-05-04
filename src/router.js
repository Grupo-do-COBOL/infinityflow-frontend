import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { isAuthenticated } from './auth.js';


const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

// Rotas
router.get('/', (req, res) => {
  res.render('login');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/mainpage',
  failureRedirect: '/login',
}));

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
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

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

router.get('/mainpage', isAuthenticated, (req, res) => {
  res.render('mainpage', { user: req.user });
});

export default router;
