function criarMenu() {
  const menu = document.getElementById("menu");
  menu.innerHTML = "<strong>Cenas</strong>";

  imagens360.forEach((img, index) => {
    const item = document.createElement("div");
    item.className = "thumb";

    item.innerHTML = `
      <img src="${img.thumb}">
      <span>${img.titulo}</span>
    `;

    item.onclick = () => {
      currentSceneIndex = index;
      viewer.loadScene(img.id);
    };

    menu.appendChild(item);
  });
}
