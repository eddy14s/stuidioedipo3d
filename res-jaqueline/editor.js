
const posicoesCapturadas = {};
const hotspotsCapturados = {};

let modoHotspotAtivo = false;
let _inicioCliqueHotspot = null;

function editorAtivo() {
  return new URLSearchParams(window.location.search).get("editor") === "1";
}

function iniciarEditorPosicao() {
  if (!editorAtivo()) return;

  const painel = document.getElementById("editor-panel");
  if (painel) painel.style.display = "flex";

  _tornarPainelArrastavel();
  _configurarCliqueHotspot();
  atualizarPainelEditor();
}

// Deixa o painel flutuante: arrasta pelo título (a "strong" no topo) pra
// tirar ele de cima da galeria ou de qualquer outro ponto da tela.
function _tornarPainelArrastavel() {
  const painel = document.getElementById("editor-panel");
  const alca = painel?.querySelector("strong");
  if (!painel || !alca) return;

  let arrastando = false;
  let offsetX = 0;
  let offsetY = 0;

  alca.addEventListener("mousedown", (ev) => {
    arrastando = true;
    const rect = painel.getBoundingClientRect();
    offsetX = ev.clientX - rect.left;
    offsetY = ev.clientY - rect.top;

    // trava a posicao atual em top/left (em vez de top/right) pra poder mover livremente
    painel.style.left = `${rect.left}px`;
    painel.style.top = `${rect.top}px`;
    painel.style.right = "auto";
    painel.style.bottom = "auto";
  });

  window.addEventListener("mousemove", (ev) => {
    if (!arrastando) return;
    const largura = painel.offsetWidth;
    const altura = painel.offsetHeight;

    let novoLeft = ev.clientX - offsetX;
    let novoTop = ev.clientY - offsetY;

    // nao deixa arrastar pra fora da tela
    novoLeft = Math.max(0, Math.min(window.innerWidth - largura, novoLeft));
    novoTop = Math.max(0, Math.min(window.innerHeight - altura, novoTop));

    painel.style.left = `${novoLeft}px`;
    painel.style.top = `${novoTop}px`;
  });

  window.addEventListener("mouseup", () => {
    arrastando = false;
  });
}

function salvarPosicaoAtual() {
  if (!viewer) return;

  const indice = currentSceneIndex + 1; // config.js usa indice comecando em 1
  posicoesCapturadas[indice] = {
    yaw: Math.round(viewer.getYaw()),
    pitch: Math.round(viewer.getPitch())
  };

  atualizarPainelEditor();
}

function atualizarPainelEditor() {
  const status = document.getElementById("editor-status");
  if (!status) return;

  const total = imagens360.length;
  const salvas = Object.keys(posicoesCapturadas).length;
  const tituloAtual = imagens360[currentSceneIndex]?.titulo || "";
  const jaSalvaEssa = posicoesCapturadas[currentSceneIndex + 1] ? " ✓" : "";
  const hotspotsDaCena = (hotspotsCapturados[currentSceneIndex + 1] || []).length;

  status.textContent =
    `${tituloAtual}${jaSalvaEssa} — ${salvas} de ${total} posições | ` +
    `${hotspotsDaCena} hotspot(s) nesta cena`;
}

function gerarBlocoConfig() {
  const linhas = Object.entries(posicoesCapturadas)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([indice, pos]) => `    ${indice}: { yaw: ${pos.yaw}, pitch: ${pos.pitch} }`)
    .join(",\n");

  return `posicoes: {\n${linhas}\n  }`;
}

function copiarBlocoConfig() {
  if (Object.keys(posicoesCapturadas).length === 0) {
    alert('Nenhuma posição salva ainda. Gire a imagem e clique em "Salvar posição desta cena" em cada uma.');
    return;
  }

  const bloco = gerarBlocoConfig();

  navigator.clipboard.writeText(bloco).then(() => {
    alert('Bloco copiado! Cole substituindo o "posicoes: { ... }" no config.js deste cliente.');
  }).catch(() => {
    prompt("Copie manualmente o bloco abaixo:", bloco);
  });
}

// ---------------------------------------------------------------------
// MODO HOTSPOT (pontos de transição clicáveis dentro da própria imagem)
// ---------------------------------------------------------------------

function alternarModoHotspot() {
  modoHotspotAtivo = !modoHotspotAtivo;

  const btn = document.getElementById("btn-modo-hotspot");
  if (btn) {
    btn.textContent = modoHotspotAtivo
      ? "🔗 Modo hotspot: ATIVO (clique na imagem)"
      : "🔗 Ativar modo hotspot";
    btn.classList.toggle("editor-panel-btn-ativo", modoHotspotAtivo);
  }
}

function _distanciaClique(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function _configurarCliqueHotspot() {
  const container = document.getElementById("panorama");
  if (!container) return;

  container.addEventListener("mousedown", (ev) => {
    _inicioCliqueHotspot = { x: ev.clientX, y: ev.clientY };
  });

  container.addEventListener("mouseup", (ev) => {
    if (!modoHotspotAtivo || !viewer || !_inicioCliqueHotspot) return;

    // se o mouse se moveu bastante, foi arrasto pra olhar em volta -- ignora
    const foiArrasto = _distanciaClique(_inicioCliqueHotspot, { x: ev.clientX, y: ev.clientY }) > 6;
    _inicioCliqueHotspot = null;
    if (foiArrasto) return;

    const [pitchClicado, yawClicado] = viewer.mouseEventToCoords(ev);
    const pitch = Math.round(pitchClicado);
    const yaw = Math.round(yawClicado);
    const cenaAtualIndice = currentSceneIndex + 1;

    const resposta = prompt(
      `Esse ponto vai levar pra qual cena? (digite o número, de 1 a ${imagens360.length})`
    );
    if (resposta === null) return;

    const destino = parseInt(resposta, 10);
    if (!destino || destino < 1 || destino > imagens360.length) {
      alert("Número de cena inválido.");
      return;
    }
    if (destino === cenaAtualIndice) {
      alert("Esse ponto já está nesta mesma cena -- escolha outra cena de destino.");
      return;
    }

    if (!hotspotsCapturados[cenaAtualIndice]) hotspotsCapturados[cenaAtualIndice] = [];
    hotspotsCapturados[cenaAtualIndice].push({ destino, yaw, pitch });

    // mostra o marcador na hora, pra conferir a posicao sem precisar recarregar
    viewer.addHotSpot(
      {
        pitch,
        yaw,
        type: "scene",
        sceneId: `scene_${destino}`,
        text: imagens360[destino - 1]?.titulo || `Cena ${destino}`,
        cssClass: "hotspot-moderno"
      },
      imagens360[cenaAtualIndice - 1].id
    );

    atualizarPainelEditor();
  });
}

function gerarBlocoHotspots() {
  const linhasCenas = Object.entries(hotspotsCapturados)
    .filter(([, lista]) => lista.length > 0)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([cena, lista]) => {
      const itens = lista
        .map((h) => `      { destino: ${h.destino}, yaw: ${h.yaw}, pitch: ${h.pitch} }`)
        .join(",\n");
      return `    ${cena}: [\n${itens}\n    ]`;
    })
    .join(",\n");

  return `hotspots: {\n${linhasCenas}\n  }`;
}

function copiarBlocoHotspots() {
  const temAlgo = Object.values(hotspotsCapturados).some((lista) => lista.length > 0);
  if (!temAlgo) {
    alert('Nenhum hotspot criado ainda. Ative o "Modo hotspot" e clique num ponto da imagem.');
    return;
  }

  const bloco = gerarBlocoHotspots();

  navigator.clipboard.writeText(bloco).then(() => {
    alert('Bloco copiado! Cole substituindo o "hotspots: { ... }" no config.js deste cliente.');
  }).catch(() => {
    prompt("Copie manualmente o bloco abaixo:", bloco);
  });
}

// atualiza o indicador do painel sempre que trocar de cena pelas setas ou menu
const _atualizarIndicadorCenaOriginal = window.atualizarIndicadorCena;
window.atualizarIndicadorCena = function () {
  _atualizarIndicadorCenaOriginal?.();
  atualizarPainelEditor();
};

