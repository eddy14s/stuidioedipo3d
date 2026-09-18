function criarMenu() {
  const menu = document.getElementById("menu");
  menu.innerHTML = "<strong>Cenas</strong>";

  const ordemConfigurada = Array.isArray(CONFIG.ordemGaleria) ? CONFIG.ordemGaleria : [];
  const ordemValida = ordemConfigurada.length === imagens360.length &&
    new Set(ordemConfigurada).size === imagens360.length &&
    ordemConfigurada.every((numero) => Number.isInteger(numero) && numero >= 1 && numero <= imagens360.length);
  const ordem = ordemValida ? ordemConfigurada : imagens360.map((_, indice) => indice + 1);

  ordem.forEach((numeroCena) => {
    const index = numeroCena - 1;
    const img = imagens360[index];
    const item = document.createElement("div");
    item.className = "thumb";

    item.innerHTML = `
      <img src="${img.thumb}">
      <span>${img.titulo}</span>
    `;

    item.onclick = () => {
      currentSceneIndex = index;
      viewer.loadScene(img.id);
      atualizarIndicadorCena();
    };

    menu.appendChild(item);
  });
}
