const CONFIG = {
  pasta: "imagens_360/",
  extensao: "jpg",
  extensoes: {},
  totalImagens: 10,
  senha: "Jasmim930",
  capa: "imagens_360/1.jpg",
  titulos: {
    1: "LIVING",
    2: "CIRCULAÇÃO",
    3: "GOURMET",
    4: "LAVANDERIA",
    5: "LAVABO",
    6: "BANHEIRO_01",
    7: "BANHEIRO_02",
    8: "BANHEIRO_03",
    9: "BANHEIRO_04"
  },
posicoes: {
    1: { yaw: 136, pitch: -21 },
    2: { yaw: -45, pitch: -13 },
    3: { yaw: 71, pitch: 1 },
    4: { yaw: -17, pitch: -8 },
    5: { yaw: -115, pitch: -12 },
    6: { yaw: -15, pitch: -30 },
    7: { yaw: 148, pitch: -11 },
    8: { yaw: -128, pitch: -15 },
    9: { yaw: 146, pitch: -1 }
  },
  hotspots: {
    // pontos clicaveis DENTRO de uma imagem que levam pra outra cena
    // chave = cena de origem, valor = lista de pontos { destino, yaw, pitch }
    // exemplo: 1: [ { destino: 3, yaw: 42, pitch: -3 } ]
  }
};
