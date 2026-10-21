const CONFIG = {
  pasta: "imagens_360/",
  extensao: "jpg",
  extensoes: {
    2: "png",
    5: "png",
    8: "png",
    9: "png"
  },
  totalImagens: 11,
  senha: "Jasmim433",
  capa: "imagens_360/1.jpg",
  titulos: {
    3: "GOURMET",
    5: "LAVANDERIA",
    6: "SUITE_,MASTER",
    10: "CLOSET_MASTER",
    11: "CIRCULAÇÃO"
  },
  // Ordem visual da galeria. Os números são IDs fixos das cenas/imagens;
  // reorganizar esta lista não altera arquivos, posições nem hotspots.
  ordemGaleria: [3, 5, 6, 10, 1, 4, 7, 11, 2, 8, 9],
posicoes: {
    3: { yaw: 87, pitch: -2 },
    5: { yaw: -18, pitch: -14 },
    6: { yaw: 33, pitch: -30 },
    10: { yaw: 153, pitch: -29 },
    11: { yaw: 126, pitch: -11 }
  },
hotspots: {
    6: [
      { destino: 10, yaw: 112, pitch: -6 }
    ],
    10: [
      { destino: 6, yaw: 179, pitch: -7 }
    ]
  }
,
  arquivosOriginais: {
    1: "001_tif.jpg",
    2: "001_tif.png",
    3: "002_exr.jpg",
    4: "003_tif.jpg",
    5: "003_tif.png",
    6: "004_exr.jpg",
    7: "004_tif.jpg",
    8: "005_tif.png",
    9: "008_tif.png",
    10: "1.jpg",
    11: "9.jpg"
  }
};

