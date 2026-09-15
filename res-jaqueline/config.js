const CONFIG = {
  pasta: "imagens_360/",
  extensao: "jpg",
  extensoes: {},
  totalImagens: 9,
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
    // define pra onde a camera aponta ao abrir cada imagem (em graus)
    // yaw: 0 a 360 (direcao horizontal) | pitch: -90 a 90 (pra cima/baixo)
    // so precisa listar as imagens que quer travar; o resto abre de frente (yaw 0)
    // exemplo: 2: { yaw: 145, pitch: -5 }
  },
  hotspots: {
    // pontos clicaveis DENTRO de uma imagem que levam pra outra cena
    // chave = cena de origem, valor = lista de pontos { destino, yaw, pitch }
    // exemplo: 1: [ { destino: 3, yaw: 42, pitch: -3 } ]
  }
};
