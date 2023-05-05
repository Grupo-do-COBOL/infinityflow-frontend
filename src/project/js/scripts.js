// const loginForm = document.getElementById("loginForm");

// if (loginForm) {
//   loginForm.addEventListener("submit", function (e) {
//     e.preventDefault();
//     const email = document.getElementById("email").value;
//     const senha = document.getElementById("senha").value;

//     fetch("/login", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ email: email, senha: senha }),
//     })
//       .then((response) => {
//         if (response.ok) {
//           window.location.href = "/mainpage";
//         } else {
//           throw new Error("Falha na autenticação");
//         }
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   });
// }