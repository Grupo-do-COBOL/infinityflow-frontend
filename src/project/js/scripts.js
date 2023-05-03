// Ouve o evento de envio do formulário de login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    // Aqui vai o código que será executado ao enviar o formulário de login
  });
}
