// Aplica a classe correspondente ao <body> pra ativar o layout certo no CSS
function aplicarDevice(device) {
  document.body.classList.remove("device-pc", "device-mobile");
  document.body.classList.add(device === "mobile" ? "device-mobile" : "device-pc");
}

// Usuário clicou em "Computador" ou "Celular"
function selecionarDevice(device) {
  localStorage.setItem("tourDevice", device);
  aplicarDevice(device);

  // se o usuário já tinha feito login antes, não precisa pedir senha de novo
  // só trocou de ideia sobre o modo de visualização
  if (localStorage.getItem("tourAuth") === "ok") {
    entrarNoTour();
    return;
  }

  document.getElementById("step-device").style.display = "none";
  document.getElementById("step-password").style.display = "block";
}

// Sai do tour (e da tela cheia, se estiver ativa) e volta pra escolha de dispositivo
function sairDoTour() {
  if (document.fullscreenElement) {
    document.exitFullscreen?.();
  }

  document.getElementById("tour").style.display = "none";
  document.getElementById("landing").style.display = "flex";
  document.getElementById("step-device").style.display = "block";
  document.getElementById("step-password").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".device-btn").forEach(btn => {
    btn.addEventListener("click", () => selecionarDevice(btn.dataset.device));
  });
});
