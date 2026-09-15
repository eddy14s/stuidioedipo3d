const CONFIG = {
  pasta: "imagens_360/",
  extensao: "jpg",
  extensoes: {},
  totalImagens: 9,
  senha: "Jasmim930",
  capa: "imagens_360/1.jpg",
  titulos: {
    1: "Banho Piscina",
    2: "Lavabo",
    3: "Banho Suíte01",
    4: "Banho Hospedes",
    5: "Banho 03"
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
