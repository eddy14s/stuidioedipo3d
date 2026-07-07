// Aplica a classe correspondente ao <body> pra ativar o layout certo no CSS
function aplicarDevice(device) {
  document.body.classList.remove("device-pc", "device-mobile");
  document.body.classList.add(device === "mobile" ? "device-mobile" : "device-pc");
}

// Usuário clicou em "Computador" ou "Celular"
function selecionarDevice(device) {
  localStorage.setItem("tourDevice", device);
  aplicarDevice(device);

  document.getElementById("step-device").style.display = "none";
  document.getElementById("step-password").style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".device-btn").forEach(btn => {
    btn.addEventListener("click", () => selecionarDevice(btn.dataset.device));
  });
});
