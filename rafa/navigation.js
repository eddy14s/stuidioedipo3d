function criarSetasNavegacao() {
  const tour = document.getElementById("tour");

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
