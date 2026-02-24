const imagens360 = [];
const scenes = {};

for (let i = 1; i <= CONFIG.totalImagens; i++) {
  const id = `scene_${i}`;
  const fileName = `${i}.${CONFIG.extensao}`;
  const assetPath = getAssetPath(fileName);

  imagens360.push({
    id,
    arquivo: assetPath,
    titulo: `Cena ${i}`,
    thumb: assetPath
  });

  scenes[id] = {
    type: "equirectangular",
    panorama: assetPath
  };
}