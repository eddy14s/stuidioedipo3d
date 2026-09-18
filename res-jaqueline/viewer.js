let viewer;
let currentSceneIndex = 0;

// Campo de visao VERTICAL (graus) que queremos manter constante em qualquer
// aparelho -- e isso, e nao um hfov fixo, que faz o enquadramento parecer
// igual no celular e no PC. 90 graus reproduz visualmente o que 120 de hfov
// dava numa tela widescreen (~16:9), que era a referencia "sem distorcao".
const VFOV_ALVO = 90;

// Calcula, na hora, o hfov maximo permitido pra tela atual (PC ou celular,
// retrato ou paisagem) que resulta no VFOV_ALVO acima -- em telas estreitas
// (celular em pe) isso da um hfov menor, evitando a distorcao nos polos.
function calcularHfovMaximo() {
  const container = document.getElementById("panorama");
  const largura = (container && container.clientWidth) || window.innerWidth;
  const altura = (container && container.clientHeight) || window.innerHeight;
  const aspecto = largura / altura;

  const vfovRad = (VFOV_ALVO * Math.PI) / 180;
  const hfovRad = 2 * Math.atan(Math.tan(vfovRad / 2) * aspecto);
  const hfov = (hfovRad * 180) / Math.PI;

  // trava dentro de uma faixa segura pro Pannellum (equirectangular)
  return Math.min(Math.max(hfov, 50), 120);
}

function iniciarTour() {
  if (viewer && typeof viewer.destroy === "function") {
    viewer.destroy();
  }

  const hfovInicial = calcularHfovMaximo();

  viewer = pannellum.viewer('panorama', {
    default: {
      firstScene: imagens360[0].id,
      sceneFadeDuration: 1000,
      autoLoad: true,
      showControls: true,
      hfov: hfovInicial,
      maxHfov: hfovInicial
    },
    scenes: scenes
  });

  // Hotspots chamam loadScene diretamente; manter esse índice sincronizado é
  // indispensável para o editor alterar os marcadores da cena que está aberta.
  viewer.on("scenechange", (sceneId) => {
    const indice = imagens360.findIndex((imagem) => imagem.id === sceneId);
    if (indice < 0) return;
    currentSceneIndex = indice;
    atualizarIndicadorCena();
  });

  criarMenu();
  criarSetasNavegacao();
  criarIndicadorCena();
  criarBotaoGaleria();

  window.addEventListener("resize", ajustarZoomAoRedimensionar);
}

// Reajusta o limite de zoom quando o celular gira (retrato/paisagem) ou a
// janela do navegador muda de tamanho. So reenquadra automaticamente se o
// usuario ainda estiver no zoom maximo (nao mexeu no zoom manualmente).
function ajustarZoomAoRedimensionar() {
  if (!viewer) return;

  const novoMax = calcularHfovMaximo();
  const config = viewer.getConfig();
  const hfovAtual = viewer.getHfov();
  const estavaNoMaximo = hfovAtual >= config.maxHfov - 1;

  config.maxHfov = novoMax;
  if (estavaNoMaximo) {
    viewer.setHfov(novoMax, false);
  }
}
