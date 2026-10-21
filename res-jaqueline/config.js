const CONFIG = {
  pasta: "imagens_360/",
  extensao: "jpg",
  extensoes: {
    4: "png",
    7: "png",
    8: "png",
    10: "png",
    11: "png"
  },
  totalImagens: 12,
  senha: "Jasmim433",
  capa: "imagens_360/1.jpg",
  titulos: {
    2: "GOURMET",
    4: "LAVANDERIA",
    5: "SUITE_,MASTER",
    9: "CLOSET_MASTER",
    12: "CIRCULAÇÃO"
  },
  // Ordem visual da galeria. Os números são IDs fixos das cenas/imagens;
  // reorganizar esta lista não altera arquivos, posições nem hotspots.
  ordemGaleria: [2, 4, 5, 9, 1, 3, 6, 12, 7, 8, 10, 11],
posicoes: {
    1: { yaw: -13, pitch: -10 },
    2: { yaw: 21, pitch: -11 },
    3: { yaw: -81, pitch: -1 },
    6: { yaw: -41, pitch: -14 },
    7: { yaw: 136, pitch: -24 },
    8: { yaw: 145, pitch: -15 },
    10: { yaw: -127, pitch: -25 },
    11: { yaw: -30, pitch: -17 }
  },
hotspots: {
    2: [
      { destino: 5, yaw: 179, pitch: -2 },
      { destino: 6, yaw: 1, pitch: -3 }
    ],
    3: [
      { destino: 4, yaw: 124, pitch: -1 }
    ],
    5: [
      { destino: 2, yaw: 110, pitch: -10 }
    ],
    6: [
      { destino: 2, yaw: 93, pitch: 0 }
    ],
    8: [
      { destino: 10, yaw: -88, pitch: -4 }
    ],
    10: [
      { destino: 8, yaw: 136, pitch: -7 }
    ]
  }
,
  arquivosOriginais: {
    1: "001_tif.jpg",
    2: "002_exr.jpg",
    3: "003_tif.jpg",
    4: "003_tif.png",
    5: "004_exr.jpg",
    6: "004_tif.jpg",
    7: "005_tif.png",
    8: "008_tif.png",
    9: "1.jpg",
    10: "10.png",
    11: "2_tif.png",
    12: "9.jpg"
  }
};

