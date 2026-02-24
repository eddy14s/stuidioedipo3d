const imagens360 = [];
const scenes = {};

for (let i = 1; i <= CONFIG.totalImagens; i++) {
  const id = `scene_${i}`;

  imagens360.push({
    id,
    arquivo: `${CONFIG.pasta}${i}.${CONFIG.extensao}`,
    titulo: `Cena ${i}`,
    thumb: `${CONFIG.pasta}${i}.${CONFIG.extensao}`
  });

  scenes[id] = {
    type: "equirectangular",
    panorama: `${CONFIG.pasta}${i}.${CONFIG.extensao}`
  };
}
