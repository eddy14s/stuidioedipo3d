const CONFIG = {
  pasta: "imagens_360/",
  extensao: "jpg",
  extensoes: {
    6: "png"
  },
  totalImagens: 12,
  senha: "Jasmim433",
  capa: "imagens_360/1.jpg",
  titulos: {
    1: "LIVING",
    3: "GOURMET",
    6: "LAVANDERIA",
    7: "SUITE_,MASTER",
    10: "CLOSET_MASTER",
    11: "SUITE_03",
    12: "BANHO_03",
    13: "CIRCULAÇÃO"
  },
  // Ordem visual da galeria. Os números são IDs fixos das cenas/imagens;
  // reorganizar esta lista não altera arquivos, posições nem hotspots.
  ordemGaleria: [1, 3, 6, 7, 10, 11, 12, 2, 4, 5, 8, 9, 13],
posicoes: {
    1: { yaw: 142, pitch: -5 },
    3: { yaw: 87, pitch: -2 },
    6: { yaw: -18, pitch: -14 },
    7: { yaw: 33, pitch: -30 },
    10: { yaw: 153, pitch: -29 },
    11: { yaw: 150, pitch: -15 },
    12: { yaw: -118, pitch: -13 },
    13: { yaw: 126, pitch: -11 }
  },
hotspots: {
    7: [
      { destino: 10, yaw: 112, pitch: -6 }
    ],
    10: [
      { destino: 7, yaw: 179, pitch: -7 }
    ],
    11: [
      { destino: 12, yaw: -90, pitch: -7 }
    ],
    12: [
      { destino: 11, yaw: 148, pitch: -6 }
    ]
  }
,
  arquivosOriginais: {
    1: "001_exr.jpg",
    2: "001_tif.jpg",
    3: "002_exr.jpg",
    4: "002_tif.jpg",
    5: "003_tif.jpg",
    6: "003_tif.png",
    7: "004_exr.jpg",
    8: "004_tif.jpg",
    9: "005_tif.jpg",
    10: "1.jpg",
    11: "1_View01_01_View04.jpg",
    12: "1_View01_01_View05.jpg",
    13: "9.jpg"
  }
};

