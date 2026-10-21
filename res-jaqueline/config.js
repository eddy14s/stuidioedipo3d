const CONFIG = {
  pasta: "imagens_360/",
  extensao: "jpg",
  extensoes: {
    2: "png",
    6: "png",
    9: "png",
    10: "png"
  },
  totalImagens: 12,
  senha: "Jasmim433",
  capa: "imagens_360/1.jpg",
  titulos: {
    3: "GOURMET",
    6: "LAVANDERIA",
    7: "SUITE_,MASTER",
    11: "CLOSET_MASTER",
    12: "CIRCULAÇÃO"
  },
  // Ordem visual da galeria. Os números são IDs fixos das cenas/imagens;
  // reorganizar esta lista não altera arquivos, posições nem hotspots.
  ordemGaleria: [3, 6, 7, 11, 1, 4, 5, 8, 12, 2, 9, 10],
posicoes: {
    3: { yaw: 87, pitch: -2 },
    6: { yaw: -18, pitch: -14 },
    7: { yaw: 33, pitch: -30 },
    11: { yaw: 153, pitch: -29 },
    12: { yaw: 126, pitch: -11 }
  },
hotspots: {
    7: [
      { destino: 11, yaw: 112, pitch: -6 }
    ],
    11: [
      { destino: 7, yaw: 179, pitch: -7 }
    ]
  }
,
  arquivosOriginais: {
    1: "001_tif.jpg",
    2: "001_tif.png",
    3: "002_exr.jpg",
    4: "002_tif.jpg",
    5: "003_tif.jpg",
    6: "003_tif.png",
    7: "004_exr.jpg",
    8: "004_tif.jpg",
    9: "005_tif.png",
    10: "008_tif.png",
    11: "1.jpg",
    12: "9.jpg"
  }
};

