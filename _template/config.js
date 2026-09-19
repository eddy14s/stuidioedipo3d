const CONFIG = {
  pasta: "imagens_360/",
  extensao: "jpg",
  extensoes: {
    // defina aqui apenas as imagens que fogem do padrao acima
    // exemplo: 3: "png"
  },
  totalImagens: 10,
  senha: "Jasmim433",
  capa: "imagens_360/1.jpg",
  // Preenchido automaticamente pelo publicar.py -- guarda o nome do arquivo
  // original de cada imagem, pra reconhecer cada uma ao atualizar so as
  // imagens depois (mesmo que a ordem na pasta de origem mude), sem perder
  // titulos/posicoes/hotspots ja editados. Nao precisa mexer aqui na mao.
  arquivosOriginais: {},
  titulos: {
    1: "Banho Piscina",
    2: "Lavabo",
    3: "Banho Suíte01",
    4: "Banho Hospedes",
    5: "Banho 03"
  },
  // Ordem visual da galeria. Os números são IDs fixos das cenas/imagens;
  // reorganizar esta lista não altera arquivos, posições nem hotspots.
  ordemGaleria: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
posicoes: {
    1: { yaw: -64, pitch: 0 },
    2: { yaw: -84, pitch: -8 },
    3: { yaw: -123, pitch: -20 },
    4: { yaw: 89, pitch: -3 },
    5: { yaw: -11, pitch: -2 },
    6: { yaw: -20, pitch: -13 },
    7: { yaw: -31, pitch: -13 },
    8: { yaw: 151, pitch: -10 },
    9: { yaw: -123, pitch: -14 }
  },
hotspots: {
    1: [
      { destino: 2, yaw: -69, pitch: 1 }
    ],
    2: [
      { destino: 1, yaw: 109, pitch: -1 },
      { destino: 3, yaw: -111, pitch: -4 },
      { destino: 4, yaw: -94, pitch: -3 },
      { destino: 7, yaw: 63, pitch: -5 },
      { destino: 8, yaw: 174, pitch: 14 }
    ],
    3: [
      { destino: 2, yaw: 178, pitch: -3 }
    ],
    4: [
      { destino: 2, yaw: 48, pitch: -1 },
      { destino: 5, yaw: 122, pitch: -3 },
      { destino: 6, yaw: -46, pitch: -1 }
    ],
    5: [
      { destino: 4, yaw: -59, pitch: -5 }
    ],
    6: [
      { destino: 4, yaw: -157, pitch: -2 }
    ],
    7: [
      { destino: 2, yaw: 93, pitch: 3 }
    ],
    8: [
      { destino: 9, yaw: 0, pitch: -6 }
    ],
    9: [
      { destino: 2, yaw: 146, pitch: -5 }
    ]
  }
};





