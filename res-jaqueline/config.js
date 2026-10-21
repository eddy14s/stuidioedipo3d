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
    2: { yaw: 87, pitch: -2 },
    4: { yaw: -18, pitch: -14 },
    5: { yaw: 33, pitch: -30 },
    9: { yaw: 153, pitch: -29 },
    12: { yaw: 126, pitch: -11 }
  },
hotspots: {
    5: [
      { destino: 9, yaw: 112, pitch: -6 }
    ],
    9: [
      { destino: 5, yaw: 179, pitch: -7 }
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

