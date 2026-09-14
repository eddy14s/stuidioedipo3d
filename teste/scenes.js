const imagens360 = [];
const scenes = {};

for (let i = 1; i <= CONFIG.totalImagens; i++) {
  const id = `scene_${i}`;
  const titulo = (CONFIG.titulos && CONFIG.titulos[i]) ? CONFIG.titulos[i] : `Cena ${i}`;
  const ext = (CONFIG.extensoes && CONFIG.extensoes[i]) ? CONFIG.extensoes[i] : CONFIG.extensao;
  const posicao = (CONFIG.posicoes && CONFIG.posicoes[i]) ? CONFIG.posicoes[i] : {};

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
    pitch: posicao.pitch || 0
  };
}
