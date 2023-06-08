// document.addEventListener('DOMContentLoaded', function () {
//     function buscarNomeUsuario() {
//       const email = localStorage.getItem('email');
//       const token = localStorage.getItem('token');
//       console.log("email: " + email);
//       if (email && token) {
//         fetch(`http://191.101.71.67:8080/api/v1/usuarios/buscar_por_email?email=${email}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`
            
//           }
//         })
//           .then(response => response.json())
//           .then(data => {
//             console.log(data);
//             document.getElementById('welcomeModalLabel').innerHTML = 'Bem vindo, ' + data.nome_usuario + '!';
//           })
//           .catch(error => console.error(error));
//       }
//     }
//     buscarNomeUsuario();
//   });

