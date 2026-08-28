function criarSetasNavegacao() {
  const tour = document.getElementById("tour");

  // remove setas antigas, caso o tour seja iniciado mais de uma vez na sessão
  document.getElementById("nav-prev")?.remove();
  document.getElementById("nav-next")?.remove();

  const btnPrev = document.createElement("div");
  btnPrev.id = "nav-prev";
  btnPrev.className = "nav-arrow nav-prev";
  btnPrev.setAttribute("aria-label", "Cena anterior");
  btnPrev.innerHTML = "&#10094;";
  btnPrev.onclick = () => loadSceneByIndex(currentSceneIndex - 1);

  const btnNext = document.createElement("div");
  btnNext.id = "nav-next";
  btnNext.className = "nav-arrow nav-next";
  btnNext.setAttribute("aria-label", "Próxima cena");
  btnNext.innerHTML = "&#10095;";
  btnNext.onclick = () => loadSceneByIndex(currentSceneIndex + 1);

  tour.appendChild(btnPrev);
  tour.appendChild(btnNext);
}

function criarIndicadorCena() {
  const tour = document.getElementById("tour");

  // remove indicador antigo, caso o tour seja iniciado mais de uma vez na sessão
  document.getElementById("scene-indicator")?.remove();

  const indicador = document.createElement("div");
  indicador.id = "scene-indicator";
  tour.appendChild(indicador);

  atualizarIndicadorCena();
}

function atualizarIndicadorCena() {
  const indicador = document.getElementById("scene-indicator");
  if (!indicador) return;

  const titulo = imagens360[currentSceneIndex]?.titulo || "";
  indicador.textContent = `${titulo} (${currentSceneIndex + 1}/${imagens360.length})`;
}

function criarBotaoGaleria() {
  const tour = document.getElementById("tour");

  // remove botao antigo, caso o tour seja iniciado mais de uma vez na sessão
  document.getElementById("toggle-galeria")?.remove();

  const btn = document.createElement("div");
  btn.id = "toggle-galeria";
  btn.className = "toggle-galeria-btn";
  btn.innerHTML = "🖼";
  btn.setAttribute("aria-label", "Mostrar ou ocultar a galeria de cenas");

  btn.onclick = () => {
    const oculta = document.body.classList.toggle("galeria-oculta");
    btn.innerHTML = oculta ? "🖼" : "✕";
    btn.setAttribute("aria-label", oculta ? "Mostrar galeria de cenas" : "Ocultar galeria de cenas");
  };

  tour.appendChild(btn);
}
