let viewer;
let currentSceneIndex = 0;

function iniciarTour() {
  if (viewer && typeof viewer.destroy === "function") {
    viewer.destroy();
  }

  viewer = pannellum.viewer('panorama', {
    default: {
      firstScene: imagens360[0].id,
      sceneFadeDuration: 1000,
      autoLoad: true,
      showControls: true
    },
    scenes: scenes
  });

  criarMenu();
  ativarAjuda();
  criarSetasNavegacao();
  criarIndicadorCena();
  criarBotaoGaleria();
}
