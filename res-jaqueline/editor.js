// MODO EDITOR DE POSIÇÃO
// Ativado só com ?editor=1 na URL -- o cliente nunca ve isso.
// Fluxo: abrir o tour com esse parametro, girar cada imagem ate a vista
// desejada, clicar "Salvar posicao desta cena", repetir pra todas, e no
// final "Copiar bloco" cola o resultado direto no config.js do cliente.

const posicoesCapturadas = {};

function editorAtivo() {
  return new URLSearchParams(window.location.search).get("editor") === "1";
}

function iniciarEditorPosicao() {
  if (!editorAtivo()) return;

  const painel = document.getElementById("editor-panel");
  if (painel) painel.style.display = "flex";

  atualizarPainelEditor();
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

  status.textContent = `${tituloAtual}${jaSalvaEssa} — ${salvas} de ${total} salvas`;
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

// atualiza o indicador do painel sempre que trocar de cena pelas setas ou menu
const _atualizarIndicadorCenaOriginal = window.atualizarIndicadorCena;
window.atualizarIndicadorCena = function () {
  _atualizarIndicadorCenaOriginal?.();
  atualizarPainelEditor();
};
