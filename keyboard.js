function loadSceneByIndex(index) {
  if (index < 0) index = imagens360.length - 1;
  if (index >= imagens360.length) index = 0;

  currentSceneIndex = index;
  viewer.loadScene(imagens360[index].id);
}

document.addEventListener("keydown", e => {
  if (!viewer) return;

  if (e.key === "ArrowLeft") loadSceneByIndex(currentSceneIndex - 1);
  if (e.key === "ArrowRight") loadSceneByIndex(currentSceneIndex + 1);
});
