"""
Interface grafica do Publicador de Tours 360.

Roda os mesmos comandos do publicar.py, so que com botoes em vez de
digitar tudo no terminal. Nao reescreve a logica de publicacao -- so
chama o publicar.py como um processo, do mesmo jeito que voce faria
digitando no PowerShell, e mostra a saida em tempo real na tela.

COMO USAR:
  1. Coloque este arquivo (publicar_gui.py) na MESMA pasta do publicar.py
     (a raiz do repositorio, ex: stuidioedipo3d).
  2. Instale a dependencia UMA vez:
       pip install PySide6
  3. Rode com duplo clique (via o .bat) ou:
       python publicar_gui.py

Veja o final deste arquivo (comentario CRIAR_ATALHO) para o passo a
passo de criar o icone na area de trabalho.
"""

import csv
import sys
from pathlib import Path

from PySide6.QtCore import Qt, QProcess
from PySide6.QtGui import QFont
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QComboBox, QPushButton, QTextEdit, QTableWidget,
    QTableWidgetItem, QSpinBox, QFileDialog, QMessageBox, QGroupBox,
    QHeaderView, QAbstractItemView,
)

# ======================================================================
# Espera-se que este arquivo esteja na mesma pasta do publicar.py
# ======================================================================
REPO_DIR = Path(__file__).resolve().parent
PUBLICAR_PY = REPO_DIR / "publicar.py"
CLIENTES_CSV = REPO_DIR / "clientes.csv"


def ler_clientes_csv() -> list[dict]:
    if not CLIENTES_CSV.exists():
        return []
    with CLIENTES_CSV.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


class JanelaPrincipal(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Publicador de Tours 360 - Studio Edipo 3D")
        self.resize(880, 640)

        self.processo: QProcess | None = None
        self.pasta_manual: str = ""

        self._montar_ui()
        self.atualizar_tabela_clientes()

        if not PUBLICAR_PY.exists():
            self._log(
                f"⚠ Nao encontrei publicar.py em: {PUBLICAR_PY}\n"
                f"Coloque publicar_gui.py na mesma pasta do publicar.py.\n"
            )

    # ------------------------------------------------------------------
    # MONTAGEM DA INTERFACE
    # ------------------------------------------------------------------
    def _montar_ui(self):
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        # --- bloco: cliente + pasta/cena opcionais ---
        grupo_cliente = QGroupBox("Cliente")
        grid = QVBoxLayout(grupo_cliente)

        linha1 = QHBoxLayout()
        linha1.addWidget(QLabel("Nome do cliente:"))
        self.combo_cliente = QComboBox()
        self.combo_cliente.setEditable(True)
        self.combo_cliente.setInsertPolicy(QComboBox.NoInsert)
        self.combo_cliente.setMinimumWidth(260)
        linha1.addWidget(self.combo_cliente)
        linha1.addStretch()
        grid.addLayout(linha1)

        linha2 = QHBoxLayout()
        linha2.addWidget(QLabel("Cena (opcional):"))
        self.campo_cena = QLineEdit()
        self.campo_cena.setPlaceholderText("ex: noturna")
        linha2.addWidget(self.campo_cena)

        linha2.addWidget(QLabel("Pasta manual (opcional):"))
        self.campo_pasta = QLineEdit()
        self.campo_pasta.setPlaceholderText("deixe em branco para achar sozinho")
        linha2.addWidget(self.campo_pasta)
        btn_pasta = QPushButton("Procurar...")
        btn_pasta.clicked.connect(self._escolher_pasta)
        linha2.addWidget(btn_pasta)
        grid.addLayout(linha2)

        layout.addWidget(grupo_cliente)

        # --- bloco: acoes principais ---
        grupo_acoes = QGroupBox("Acoes")
        acoes = QHBoxLayout(grupo_acoes)

        self.btn_publicar = QPushButton("📤 Publicar / Republicar tudo")
        self.btn_publicar.clicked.connect(self.acao_publicar)
        acoes.addWidget(self.btn_publicar)

        self.btn_so_imagens = QPushButton("🖼 Só atualizar imagens")
        self.btn_so_imagens.clicked.connect(self.acao_so_imagens)
        acoes.addWidget(self.btn_so_imagens)

        self.btn_remover_cliente = QPushButton("🗑 Remover cliente")
        self.btn_remover_cliente.clicked.connect(self.acao_remover_cliente)
        acoes.addWidget(self.btn_remover_cliente)

        layout.addWidget(grupo_acoes)

        # --- bloco: remover uma imagem especifica ---
        grupo_img = QGroupBox("Remover uma imagem especifica")
        linha_img = QHBoxLayout(grupo_img)
        linha_img.addWidget(QLabel("Numero da imagem:"))
        self.spin_indice = QSpinBox()
        self.spin_indice.setRange(1, 999)
        linha_img.addWidget(self.spin_indice)

        self.btn_remover_imagem = QPushButton("✂ Remover essa imagem")
        self.btn_remover_imagem.clicked.connect(self.acao_remover_imagem)
        linha_img.addWidget(self.btn_remover_imagem)
        linha_img.addStretch()
        layout.addWidget(grupo_img)

        self.botoes_acao = [
            self.btn_publicar, self.btn_so_imagens,
            self.btn_remover_cliente, self.btn_remover_imagem,
        ]

        # --- tabela de clientes ativos ---
        grupo_lista = QGroupBox("Clientes ativos")
        layout_lista = QVBoxLayout(grupo_lista)

        linha_lista_topo = QHBoxLayout()
        linha_lista_topo.addStretch()
        btn_atualizar_lista = QPushButton("🔄 Atualizar lista")
        btn_atualizar_lista.clicked.connect(self.atualizar_tabela_clientes)
        linha_lista_topo.addWidget(btn_atualizar_lista)
        layout_lista.addLayout(linha_lista_topo)

        self.tabela = QTableWidget(0, 5)
        self.tabela.setHorizontalHeaderLabels(
            ["Cliente", "Link", "Senha", "Imagens", "Atualizado em"]
        )
        self.tabela.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeToContents)
        self.tabela.horizontalHeader().setSectionResizeMode(1, QHeaderView.Stretch)
        self.tabela.setEditTriggers(QAbstractItemView.NoEditTriggers)
        self.tabela.setSelectionBehavior(QAbstractItemView.SelectRows)
        self.tabela.cellDoubleClicked.connect(self._preencher_cliente_da_tabela)
        layout_lista.addWidget(self.tabela)

        layout.addWidget(grupo_lista, stretch=1)

        # --- log de saida ---
        grupo_log = QGroupBox("Saida do comando")
        layout_log = QVBoxLayout(grupo_log)
        self.log = QTextEdit()
        self.log.setReadOnly(True)
        self.log.setFont(QFont("Consolas", 9))
        layout_log.addWidget(self.log)
        layout.addWidget(grupo_log, stretch=1)

    # ------------------------------------------------------------------
    # AUXILIARES
    # ------------------------------------------------------------------
    def _escolher_pasta(self):
        pasta = QFileDialog.getExistingDirectory(self, "Escolha a pasta de renders")
        if pasta:
            self.campo_pasta.setText(pasta)

    def _log(self, texto: str):
        self.log.append(texto.rstrip("\n"))
        self.log.verticalScrollBar().setValue(self.log.verticalScrollBar().maximum())

    def _preencher_cliente_da_tabela(self, linha: int, _coluna: int):
        nome = self.tabela.item(linha, 0).text()
        self.combo_cliente.setCurrentText(nome)

    def atualizar_tabela_clientes(self):
        registros = [r for r in ler_clientes_csv() if r.get("status") == "ativo"]

        self.tabela.setRowCount(len(registros))
        for i, r in enumerate(registros):
            self.tabela.setItem(i, 0, QTableWidgetItem(r.get("cliente", "")))
            self.tabela.setItem(i, 1, QTableWidgetItem(r.get("link", "")))
            self.tabela.setItem(i, 2, QTableWidgetItem(r.get("senha", "")))
            self.tabela.setItem(i, 3, QTableWidgetItem(r.get("total_imagens", "")))
            self.tabela.setItem(i, 4, QTableWidgetItem(r.get("data", "")))

        nomes_atuais = self.combo_cliente.currentText()
        self.combo_cliente.clear()
        self.combo_cliente.addItems(sorted({r.get("cliente", "") for r in registros}))
        self.combo_cliente.setCurrentText(nomes_atuais)

    def _nome_cliente(self) -> str:
        return self.combo_cliente.currentText().strip()

    def _travar_botoes(self, travar: bool):
        for b in self.botoes_acao:
            b.setEnabled(not travar)

    # ------------------------------------------------------------------
    # EXECUCAO DE COMANDOS (via QProcess, mesma coisa que rodar no terminal)
    # ------------------------------------------------------------------
    def _rodar(self, args: list[str], entrada_stdin: str | None = None):
        if self.processo is not None:
            QMessageBox.warning(self, "Aguarde", "Ja tem um comando rodando.")
            return

        if not PUBLICAR_PY.exists():
            QMessageBox.critical(self, "Erro", f"publicar.py nao encontrado em:\n{PUBLICAR_PY}")
            return

        self._log(f"\n$ python publicar.py {' '.join(args)}\n")
        self._travar_botoes(True)

        self.processo = QProcess(self)
        self.processo.setProgram(sys.executable)
        self.processo.setArguments([str(PUBLICAR_PY)] + args)
        self.processo.setWorkingDirectory(str(REPO_DIR))

        self.processo.readyReadStandardOutput.connect(self._ler_saida)
        self.processo.readyReadStandardError.connect(self._ler_erro)
        self.processo.finished.connect(self._processo_terminou)

        self.processo.start()

        if entrada_stdin is not None:
            self.processo.write(entrada_stdin.encode("utf-8"))

    def _ler_saida(self):
        if self.processo:
            saida = bytes(self.processo.readAllStandardOutput()).decode("utf-8", errors="replace")
            self._log(saida)

    def _ler_erro(self):
        if self.processo:
            erro = bytes(self.processo.readAllStandardError()).decode("utf-8", errors="replace")
            self._log(erro)

    def _processo_terminou(self, codigo: int, _status):
        self._log(f"\n[processo encerrado, codigo {codigo}]\n")
        self.processo = None
        self._travar_botoes(False)
        self.atualizar_tabela_clientes()

    # ------------------------------------------------------------------
    # ACOES DOS BOTOES
    # ------------------------------------------------------------------
    def acao_publicar(self):
        cliente = self._nome_cliente()
        if not cliente:
            QMessageBox.warning(self, "Falta o cliente", "Digite ou selecione o nome do cliente.")
            return

        args = ["--cliente", cliente]
        if self.campo_cena.text().strip():
            args += ["--cena", self.campo_cena.text().strip()]
        if self.campo_pasta.text().strip():
            args += ["--pasta", self.campo_pasta.text().strip()]

        self._rodar(args)

    def acao_so_imagens(self):
        cliente = self._nome_cliente()
        if not cliente:
            QMessageBox.warning(self, "Falta o cliente", "Digite ou selecione o nome do cliente.")
            return

        args = ["--cliente", cliente, "--so-imagens"]
        if self.campo_cena.text().strip():
            args += ["--cena", self.campo_cena.text().strip()]
        if self.campo_pasta.text().strip():
            args += ["--pasta", self.campo_pasta.text().strip()]

        self._rodar(args)

    def acao_remover_imagem(self):
        cliente = self._nome_cliente()
        if not cliente:
            QMessageBox.warning(self, "Falta o cliente", "Digite ou selecione o nome do cliente.")
            return

        indice = self.spin_indice.value()
        resposta = QMessageBox.question(
            self, "Confirmar",
            f"Remover a imagem {indice} de '{cliente}'?\nAs imagens seguintes serao renumeradas.",
        )
        if resposta != QMessageBox.Yes:
            return

        self._rodar(["--cliente", cliente, "--remover-imagem", str(indice)])

    def acao_remover_cliente(self):
        cliente = self._nome_cliente()
        if not cliente:
            QMessageBox.warning(self, "Falta o cliente", "Digite ou selecione o nome do cliente.")
            return

        resposta = QMessageBox.question(
            self, "Confirmar remocao",
            f"Isso vai apagar TODO o tour de '{cliente}' (local + GitHub).\n"
            f"O link dele para de funcionar. Tem certeza?",
        )
        if resposta != QMessageBox.Yes:
            return

        # o publicar.py pede pra digitar "SIM" no terminal antes de apagar;
        # aqui a confirmacao ja foi feita na caixa de dialogo acima, entao
        # mandamos o "SIM" direto pela entrada do processo.
        self._rodar(["--remover", cliente], entrada_stdin="SIM\n")


def main():
    app = QApplication(sys.argv)
    janela = JanelaPrincipal()
    janela.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()


# ======================================================================
# CRIAR_ATALHO -- passo a passo pra criar o icone na area de trabalho
# ======================================================================
#
# 1. Salve este arquivo (publicar_gui.py) na mesma pasta do publicar.py.
#
# 2. Nessa mesma pasta, crie um arquivo chamado "Abrir Publicador.bat"
#    com este conteudo (ajuste o caminho se for diferente):
#
#        @echo off
#        cd /d "E:\4_VS-CODE_STUDIO_3D\SITE-VIZUALIZADOR-360\stuidioedipo3d"
#        pythonw publicar_gui.py
#
#    (o "pythonw" abre sem a janela preta do terminal atras)
#
# 3. Clique com o botao direito nesse .bat -> "Enviar para" ->
#    "Area de trabalho (criar atalho)".
#
# 4. (Opcional) Clique direito no atalho criado -> Propriedades ->
#    "Alterar Icone..." se quiser um icone customizado.
#
# Pronto: duplo clique no atalho da area de trabalho abre a interface.
# ======================================================================
