const imagens360 = [];
const scenes = {};

function tituloDaCena(indice) {
  return (CONFIG.titulos && CONFIG.titulos[indice]) ? CONFIG.titulos[indice] : `Cena ${indice}`;
}

for (let i = 1; i <= CONFIG.totalImagens; i++) {
  const id = `scene_${i}`;
  const titulo = tituloDaCena(i);
  const ext = (CONFIG.extensoes && CONFIG.extensoes[i]) ? CONFIG.extensoes[i] : CONFIG.extensao;
  const posicao = (CONFIG.posicoes && CONFIG.posicoes[i]) ? CONFIG.posicoes[i] : {};
  const pontosDaCena = (CONFIG.hotspots && CONFIG.hotspots[i]) ? CONFIG.hotspots[i] : [];

  imagens360.push({
    id,
    arquivo: `${CONFIG.pasta}${i}.${ext}`,
    titulo,
    thumb: `${CONFIG.pasta}${i}.${ext}`
  });

  scenes[id] = {
    type: "equirectangular",
    panorama: `${CONFIG.pasta}${i}.${ext}`,
    yaw: posicao.yaw || 0,
    pitch: posicao.pitch || 0,
    hotSpots: pontosDaCena.map((ponto, idx) => ({
      id: `hs_${i}_${idx}`,
      pitch: ponto.pitch || 0,
      yaw: ponto.yaw,
      cssClass: "hotspot-moderno",
      text: tituloDaCena(ponto.destino),
      // clique customizado (ver transicoes.js) em vez do type:"scene" padrao:
      // assim controlamos o passo-a-frente + chegada continua + assentamento
      clickHandlerFunc: handlerTransicaoHotspot,
      clickHandlerArgs: { destino: ponto.destino, yaw: ponto.yaw, pitch: ponto.pitch }
    }))
  };
}

