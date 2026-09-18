// TRANSIÇÃO "STEP-IN" AO CLICAR NUM HOTSPOT (efeito parecido com Matterport)
//
// A troca de cena padrão do Pannellum é só um crossfade entre duas fotos
// paradas -- funciona, mas não passa sensação de deslocamento. Pra melhorar
// isso, cada clique num hotspot agora faz 3 coisas em sequência:
//
//   1) PASSO A FRENTE: da um zoom rapido na direção do ponto clicado,
//      simulando que você deu um passo até ali.
//   2) CHEGADA CONTINUA: troca de cena já olhando pra a mesma direção que
//      você clicou (em vez de "teletransportar" pra um enquadramento
//      qualquer), o crossfade do Pannellum acontece nesse instante.
//   3) ASSENTAR: assim que a cena carrega, a câmera "anda" suavemente até
//      o enquadramento ideal daquele ambiente (o que já configuramos em
//      CONFIG.posicoes).
//
// Esse arquivo precisa carregar ANTES do scenes.js, porque é lá que a
// função abaixo é referenciada na montagem dos hotSpots.

const DURACAO_FADE_CENA = 1000; // tem que bater com o "sceneFadeDuration" do viewer.js
const DURACAO_PASSO = 350;
const DURACAO_ASSENTAR = 900;
const ZOOM_PASSO = 0.72; // reduz o hfov em ~28% no "passo a frente"

// Escolhe a representação angular mais próxima da direção atual. Assim a
// câmera nunca dá uma volta longa ao buscar um marcador perto do limite ±180°.
function yawMaisProximo(yawAtual, yawDestino) {
  const diferenca = ((yawDestino - yawAtual + 540) % 360) - 180;
  return yawAtual + diferenca;
}

function handlerTransicaoHotspot(evento, args) {
  if (!viewer) return;

  const { destino, yaw, pitch } = args;
  const painel = document.getElementById("panorama");
  painel?.classList.add("transicao-hotspot");

  const hfovNormal = viewer.getHfov();
  const hfovZoom = Math.max(40, hfovNormal * ZOOM_PASSO);
  const yawDoMarcador = Number.isFinite(yaw) ? yaw : viewer.getYaw();
  const pitchDoMarcador = Number.isFinite(pitch) ? pitch : viewer.getPitch();
  const yawDoPasso = yawMaisProximo(viewer.getYaw(), yawDoMarcador);

  // 1) passo a frente NA direção do marcador: pan + tilt + zoom acontecem
  // juntos, evitando ampliar o ponto onde a câmera estava olhando antes.
  viewer.setYaw(yawDoPasso, DURACAO_PASSO);
  viewer.setPitch(pitchDoMarcador, DURACAO_PASSO);
  viewer.setHfov(hfovZoom, DURACAO_PASSO, () => {
    // 2) troca de cena chegando olhando pro mesmo ponto que foi clicado
    viewer.loadScene(`scene_${destino}`, pitch, yaw, hfovZoom);

    // espera o fade da propria troca de cena terminar antes de "andar"
    setTimeout(() => {
      const posicaoIdeal = (CONFIG.posicoes && CONFIG.posicoes[destino]) || {};

      // 3) assenta suavemente no enquadramento configurado pra esse ambiente
      viewer.setYaw(posicaoIdeal.yaw || 0, DURACAO_ASSENTAR);
      viewer.setPitch(posicaoIdeal.pitch || 0, DURACAO_ASSENTAR);
      viewer.setHfov(hfovNormal, DURACAO_ASSENTAR, () => {
        painel?.classList.remove("transicao-hotspot");
      });
    }, DURACAO_FADE_CENA);
  });
}
