import { Router } from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));

router.get('/', (_req, res) => {
  res.sendFile(join(__dirname, 'project', 'login.html'));
});

router.get('/login.html', (_req, res) => {
  res.sendFile(join(__dirname, 'project', 'login.html'));
});

router.get('/cadastro.html', (_req, res) => {
  res.sendFile(join(__dirname, 'project', 'cadastro.html'));
});

router.get('/recuperarSenha.html', (_req, res) => {
  res.sendFile(join(__dirname, 'project', 'recuperarSenha.html'));
});

export default router;


