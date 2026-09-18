// MODO EDITOR DE POSIÇÃO
// Ativado só com ?editor=1 na URL -- o cliente nunca ve isso.
// Fluxo: abrir o tour com esse parametro, girar cada imagem ate a vista
// desejada, clicar "Salvar posicao desta cena", repetir pra todas, e no
// final "Copiar bloco" cola o resultado direto no config.js do cliente.
//
// Alem disso, o mesmo painel tem o "Modo hotspot": ativa, clica em um ponto
// da propria imagem 360 (ex: a porta de outro ambiente), escolhe pra qual
// cena aquele ponto leva, e o marcador ja aparece na hora pra conferir.

const posicoesCapturadas = {};

let modoHotspotAtivo = false;
let _inicioCliqueHotspot = null;
let _hotspotArrastando = null;
let _ponteiroArrasteHotspot = null;
let _ultimaCoordenadaArraste = null;
let ordemGaleriaEditor = [];
let _origemArrasteGaleria = null;

function editorAtivo() {
  return new URLSearchParams(window.location.search).get("editor") === "1";
}

function iniciarEditorPosicao() {
  if (!editorAtivo()) return;

  const painel = document.getElementById("editor-panel");
  if (painel) painel.style.display = "flex";

  _tornarPainelArrastavel();
  ordemGaleriaEditor = _obterOrdemGaleriaValida();
  _configurarCliqueHotspot();
  atualizarPainelEditor();
}

function alternarPainelEditor() {
  const painel = document.getElementById("editor-panel");
  const botao = document.getElementById("btn-recolher-editor");
  if (!painel || !botao) return;

  const recolhido = painel.classList.toggle("editor-panel--recolhido");
  botao.textContent = recolhido ? "+" : "−";
  botao.setAttribute("aria-label", recolhido ? "Expandir painel do editor" : "Recolher painel do editor");
  botao.setAttribute("aria-expanded", String(!recolhido));
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

  painel.querySelector(".editor-panel-btn-recolher")?.addEventListener("mousedown", (ev) => {
    ev.stopPropagation();
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
  const hotspotsDaCena = _hotspotsDaCena(currentSceneIndex + 1).length;
  const totalHotspots = _contarTotalHotspots();

  status.textContent =
    `${tituloAtual}${jaSalvaEssa} — ${salvas} de ${total} posições | ` +
    `${hotspotsDaCena} nesta cena · ${totalHotspots} marcador(es) no tour`;

  _renderizarListaAmbientes();
  _agendarAlcasDeMovimento();
}

function _contarTotalHotspots() {
  return imagens360.reduce((total, _, indice) => total + _hotspotsDaCena(indice + 1).length, 0);
}

function _renderizarListaAmbientes() {
  const lista = document.getElementById("editor-lista-ambientes");
  if (!lista) return;

  lista.replaceChildren();
  ordemGaleriaEditor.forEach((destino) => {
    const imagem = imagens360[destino - 1];
    const item = document.createElement("div");
    item.className = "editor-ambiente-item";
    item.dataset.destino = String(destino);

    const numero = document.createElement("span");
    numero.className = "editor-ambiente-indice";
    numero.textContent = `#${destino}`;

    const miniatura = document.createElement("img");
    miniatura.className = "editor-ambiente-miniatura";
    miniatura.src = imagem.thumb;
    miniatura.alt = "";
    miniatura.loading = "lazy";

    const campo = document.createElement("input");
    campo.className = "editor-ambiente-input";
    campo.type = "text";
    campo.value = imagem.titulo || tituloDaCena(destino);
    campo.setAttribute("aria-label", `Nome do ambiente ${destino}`);
    campo.addEventListener("change", () => _renomearAmbiente(destino, campo.value));
    campo.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter") return;
      ev.preventDefault();
      campo.blur();
    });

    const alca = document.createElement("button");
    alca.type = "button";
    alca.className = "editor-ordem-alca";
    alca.draggable = true;
    alca.textContent = "⠿";
    alca.setAttribute("aria-label", `Arraste para reposicionar ${imagem.titulo || `cena ${destino}`} na galeria`);
    alca.title = "Arraste para reorganizar a galeria";
    alca.addEventListener("dragstart", (ev) => _iniciarArrasteGaleria(ev, destino));
    alca.addEventListener("dragend", _finalizarArrasteGaleria);

    item.addEventListener("dragover", (ev) => {
      ev.preventDefault();
      item.classList.add("editor-ambiente-item--destino");
      if (ev.dataTransfer) ev.dataTransfer.dropEffect = "move";
    });
    item.addEventListener("dragleave", () => item.classList.remove("editor-ambiente-item--destino"));
    item.addEventListener("drop", (ev) => {
      ev.preventDefault();
      _reordenarGaleriaPorArraste(destino);
    });

    item.append(numero, miniatura, campo, alca);
    lista.appendChild(item);
  });
}

function _iniciarArrasteGaleria(ev, destino) {
  _origemArrasteGaleria = destino;
  ev.dataTransfer?.setData("text/plain", String(destino));
  if (ev.dataTransfer) ev.dataTransfer.effectAllowed = "move";
  ev.currentTarget.closest(".editor-ambiente-item")?.classList.add("editor-ambiente-item--arrastando");
}

function _finalizarArrasteGaleria(ev) {
  ev.currentTarget.closest(".editor-ambiente-item")?.classList.remove("editor-ambiente-item--arrastando");
  document.querySelectorAll(".editor-ambiente-item--destino").forEach((item) => {
    item.classList.remove("editor-ambiente-item--destino");
  });
  _origemArrasteGaleria = null;
}

function _obterOrdemGaleriaValida() {
  const total = imagens360.length;
  const ordem = Array.isArray(CONFIG.ordemGaleria) ? CONFIG.ordemGaleria.map(Number) : [];
  const valida = ordem.length === total && new Set(ordem).size === total &&
    ordem.every((numero) => Number.isInteger(numero) && numero >= 1 && numero <= total);
  return valida ? ordem : imagens360.map((_, indice) => indice + 1);
}

function _reordenarGaleriaPorArraste(destinoAlvo) {
  const origem = _origemArrasteGaleria;
  if (!origem || origem === destinoAlvo) return;

  const indiceOrigem = ordemGaleriaEditor.indexOf(origem);
  let indiceAlvo = ordemGaleriaEditor.indexOf(destinoAlvo);
  if (indiceOrigem < 0 || indiceAlvo < 0) return;

  ordemGaleriaEditor.splice(indiceOrigem, 1);
  if (indiceOrigem < indiceAlvo) indiceAlvo--;
  ordemGaleriaEditor.splice(indiceAlvo, 0, origem);
  CONFIG.ordemGaleria = [...ordemGaleriaEditor];
  criarMenu();
  atualizarPainelEditor();
}

function gerarBlocoOrdemGaleria() {
  return `ordemGaleria: [${ordemGaleriaEditor.join(", ")}]`;
}

function copiarOrdemGaleria() {
  const bloco = gerarBlocoOrdemGaleria();
  navigator.clipboard.writeText(bloco).then(() => {
    alert('Ordem copiada! Cole o campo "ordemGaleria" no config.js. Os números das cenas não mudam.');
  }).catch(() => {
    prompt("Copie manualmente a ordem da galeria:", bloco);
  });
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
//
// Fonte única de verdade: em vez de guardar os pontos numa lista própria
// do editor, a gente lê e edita direto o "scenes[cena].hotSpots" que já é
// o mesmo array que o Pannellum usa pra desenhar os marcadores. Assim,
// criar/apagar/arrastar/renomear muda a mesma coisa que a gente exporta
// no final -- nunca fica dessincronizado.
//
// Controles (só com editor mode ativo):
//   - clique num ponto vazio (com "Modo hotspot" ligado) -> cria um novo
//   - clique com o botão direito num marcador -> apaga
//   - arrastar a alça ↕ que aparece sobre um marcador -> reposiciona
//   - renomear na lista de ambientes do painel -> atualiza galeria e pontos
// ---------------------------------------------------------------------

function _hotspotsDaCena(indiceCena) {
  const sceneId = imagens360[indiceCena - 1]?.id;
  if (!sceneId || !scenes[sceneId]) return [];
  if (!scenes[sceneId].hotSpots) scenes[sceneId].hotSpots = [];
  return scenes[sceneId].hotSpots;
}

function _acharHotspotPeloElemento(elemento) {
  const marcador = elemento?.closest?.(".hotspot-moderno") || elemento;
  return _hotspotsDaCena(currentSceneIndex + 1).find((hs) => hs.div === marcador);
}

function alternarModoHotspot() {
  modoHotspotAtivo = !modoHotspotAtivo;
  document.body.classList.toggle("editor-hotspot-ativo", modoHotspotAtivo);

  const btn = document.getElementById("btn-modo-hotspot");
  if (btn) {
    btn.textContent = modoHotspotAtivo
      ? "🔗 Modo hotspot: ATIVO (clique na imagem)"
      : "🔗 Ativar modo hotspot";
    btn.classList.toggle("editor-panel-btn-ativo", modoHotspotAtivo);
  }

  if (modoHotspotAtivo) _agendarAlcasDeMovimento();
}

function _distanciaClique(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function _configurarCliqueHotspot() {
  const container = document.getElementById("panorama");
  if (!container) return;

  // A alça é o único ponto que inicia o arraste. Escutamos no window, em
  // captura, para bloquear o Pannellum antes de ele receber o ponteiro.
  window.addEventListener("pointerdown", (ev) => {
    if (!editorAtivo()) return;
    const alca = ev.target.closest?.(".editor-hotspot-mover");
    if (!alca || !container.contains(alca)) return;

    const hotspot = _acharHotspotPeloElemento(alca);
    if (!hotspot) return;

    ev.preventDefault();
    ev.stopImmediatePropagation();
    _hotspotArrastando = hotspot;
    _ponteiroArrasteHotspot = ev.pointerId;
    _ultimaCoordenadaArraste = null;
    alca.setPointerCapture?.(ev.pointerId);
    hotspot.div?.classList.add("editor-hotspot--movendo");
  }, true);

  window.addEventListener("pointermove", (ev) => {
    if (!_hotspotArrastando || !viewer || ev.pointerId !== _ponteiroArrasteHotspot) return;

    ev.preventDefault();
    ev.stopImmediatePropagation();

    const [pitch, yaw] = viewer.mouseEventToCoords(ev);
    _ultimaCoordenadaArraste = { pitch, yaw };

    _hotspotArrastando.pitch = pitch;
    _hotspotArrastando.yaw = yaw;
    if (_hotspotArrastando.clickHandlerArgs) {
      _hotspotArrastando.clickHandlerArgs.pitch = pitch;
      _hotspotArrastando.clickHandlerArgs.yaw = yaw;
    }

    // o Pannellum só recalcula a posição na tela durante um render ativo --
    // esse truque (mudar o yaw pro mesmo valor) forca um render agora
    viewer.setYaw(viewer.getYaw(), 0);
  }, true);

  window.addEventListener("pointerup", (ev) => _finalizarArrasteHotspot(ev), true);
  window.addEventListener("pointercancel", (ev) => _finalizarArrasteHotspot(ev), true);

  window.addEventListener("mousedown", (ev) => {
    if (!ev.target.closest?.(".editor-hotspot-mover")) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
  }, true);

  // Evita que o click sintético emitido depois do pointerup acione a transição.
  window.addEventListener("click", (ev) => {
    if (!ev.target.closest?.(".editor-hotspot-mover")) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
  }, true);

  // apagar com o botão direito
  container.addEventListener("contextmenu", (ev) => {
    if (!editorAtivo()) return;
    const marcador = ev.target.closest(".hotspot-moderno");
    if (!marcador) return;
    ev.preventDefault();

    const hotspot = _acharHotspotPeloElemento(marcador);
    if (!hotspot) return;

    const nomeDestino = tituloDaCena(hotspot.clickHandlerArgs?.destino);
    if (!confirm(`Apagar esse ponto? (leva pra "${nomeDestino}")`)) return;

    viewer.removeHotSpot(hotspot.id, imagens360[currentSceneIndex].id);
    atualizarPainelEditor();
  });

  // criar um novo ponto (clique numa area vazia, com o modo hotspot ligado)
  container.addEventListener("mousedown", (ev) => {
    if (ev.target.closest(".hotspot-moderno")) return; // ja tratado acima
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

    const novoHotspot = {
      id: `hs_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      pitch,
      yaw,
      cssClass: "hotspot-moderno",
      text: tituloDaCena(destino),
      clickHandlerFunc: handlerTransicaoHotspot,
      clickHandlerArgs: { destino, yaw, pitch }
    };

    // addHotSpot ja poe isso dentro de scenes[cena].hotSpots -- nao precisa
    // guardar em outro lugar, e ja mostra o marcador na hora
    viewer.addHotSpot(novoHotspot, imagens360[cenaAtualIndice - 1].id);

    atualizarPainelEditor();
  });
}

function _finalizarArrasteHotspot(ev) {
  if (!_hotspotArrastando || ev.pointerId !== _ponteiroArrasteHotspot) return;

  ev.preventDefault();
  ev.stopImmediatePropagation();
  const hotspot = _hotspotArrastando;
  const coordenada = _ultimaCoordenadaArraste;
  hotspot.div?.classList.remove("editor-hotspot--movendo");
  _hotspotArrastando = null;
  _ponteiroArrasteHotspot = null;
  _ultimaCoordenadaArraste = null;

  if (coordenada && viewer) {
    const sceneId = imagens360[currentSceneIndex]?.id;
    if (sceneId) {
      viewer.removeHotSpot(hotspot.id, sceneId);
      hotspot.pitch = Math.round(coordenada.pitch);
      hotspot.yaw = Math.round(coordenada.yaw);
      if (hotspot.clickHandlerArgs) {
        hotspot.clickHandlerArgs.pitch = hotspot.pitch;
        hotspot.clickHandlerArgs.yaw = hotspot.yaw;
      }
      viewer.addHotSpot(hotspot, sceneId);
    }
  }

  atualizarPainelEditor();
}

function _agendarAlcasDeMovimento() {
  window.setTimeout(_garantirAlcasDeMovimento, 0);
  window.setTimeout(_garantirAlcasDeMovimento, 150);
  window.setTimeout(_garantirAlcasDeMovimento, 500);
}

function _garantirAlcasDeMovimento() {
  if (!editorAtivo() || !modoHotspotAtivo) return;

  _hotspotsDaCena(currentSceneIndex + 1).forEach((hotspot) => {
    const marcador = hotspot.div;
    if (!marcador || marcador.querySelector(".editor-hotspot-mover")) return;

    const alca = document.createElement("button");
    alca.type = "button";
    alca.className = "editor-hotspot-mover";
    alca.setAttribute("aria-label", `Mover marcador para ${hotspot.text || "ambiente"}`);
    alca.title = "Arraste para mover este marcador";
    alca.textContent = "↕";
    marcador.appendChild(alca);
  });
}

// Renomeia o ambiente de destino: atualiza CONFIG.titulos, a miniatura da
// galeria, e o texto de TODOS os hotspots (em qualquer cena) que apontam
// pra esse mesmo destino -- tudo com o mesmo nome, sempre.
function _renomearAmbiente(destino, nome) {
  const nomeFinal = String(nome || "").trim();
  if (!nomeFinal) {
    alert("O nome não pode ficar em branco.");
    _renderizarListaAmbientes();
    return;
  }

  if (!CONFIG.titulos) CONFIG.titulos = {};
  CONFIG.titulos[destino] = nomeFinal;
  if (imagens360[destino - 1]) imagens360[destino - 1].titulo = nomeFinal;

  // atualiza a miniatura correspondente na galeria
  const miniaturas = document.querySelectorAll("#menu .thumb");
  const spanMiniatura = miniaturas[destino - 1]?.querySelector("span");
  if (spanMiniatura) spanMiniatura.textContent = nomeFinal;

  // atualiza o texto em TODOS os hotspots (de qualquer cena) que levam pra esse destino
  Object.values(scenes).forEach((cena) => {
    (cena.hotSpots || []).forEach((hs) => {
      if (hs.clickHandlerArgs?.destino === destino) {
        hs.text = nomeFinal;
        const span = hs.div?.querySelector("span");
        if (span) span.textContent = nomeFinal;
      }
    });
  });

  atualizarPainelEditor();
}

function gerarBlocoHotspots() {
  const blocosPorCena = [];

  for (let cena = 1; cena <= imagens360.length; cena++) {
    const lista = _hotspotsDaCena(cena);
    if (!lista.length) continue;

    const itens = lista
      .map((h) => {
        const destino = h.clickHandlerArgs?.destino;
        return `      { destino: ${destino}, yaw: ${Math.round(h.yaw)}, pitch: ${Math.round(h.pitch)} }`;
      })
      .join(",\n");

    blocosPorCena.push(`    ${cena}: [\n${itens}\n    ]`);
  }

  return `hotspots: {\n${blocosPorCena.join(",\n")}\n  }`;
}

function copiarBlocoHotspots() {
  const temAlgo = imagens360.some((_, idx) => _hotspotsDaCena(idx + 1).length > 0);
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

function gerarBlocoTitulos() {
  const linhas = Object.entries(CONFIG.titulos || {})
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([indice, nome]) => `    ${indice}: ${JSON.stringify(String(nome))}`)
    .join(",\n");

  return `titulos: {\n${linhas}\n  }`;
}

function copiarBlocoTitulos() {
  const bloco = gerarBlocoTitulos();

  navigator.clipboard.writeText(bloco).then(() => {
    alert('Bloco copiado! Cole substituindo o "titulos: { ... }" no config.js deste cliente.');
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
