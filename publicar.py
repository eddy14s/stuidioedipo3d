"""
Script de publicacao automatica do Tour Virtual 360.

O que ele faz, em ordem:
  1. Acha a pasta do cliente automaticamente (padrao: NOME_CLIENTE\\render360)
     e varre todas as subpastas dentro dela (interior, externo, noturna...)
  2. Copia as imagens pra dentro do projeto, renomeando pra 1.jpg, 2.jpg...
     (apagando as imagens do cliente anterior antes)
  3. Atualiza o config.js (quantidade de imagens + gera senha nova)
  4. Faz commit e push pro GitHub (mesmo repositorio / mesmo link de sempre)
  5. Mostra o link + senha prontos pra copiar e mandar pro cliente

Uso basico (acha a pasta do cliente sozinho):
    python publicar.py --cliente "Casa Silva"

Uso publicando so uma subpasta especifica (ex: so as imagens noturnas):
    python publicar.py --cliente "Casa Silva" --cena "noturna"

Uso apontando uma pasta manualmente (ignora a busca automatica):
    python publicar.py --cliente "Casa Silva" --pasta "C:\\Renders\\CasaSilva"
"""

import argparse
import random
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# ======================================================================
# CONFIGURACAO - ajuste isso UMA VEZ so, de acordo com o seu ambiente
# ======================================================================

# Pasta do projeto (onde estao o index.html, config.js, etc.)
PROJETO_DIR = Path(r"E:\0_VS-CODE_STUDIO_3D\SITE-VIZUALIZADOR-360\stuidioedipo3d")

# Link fixo do seu GitHub Pages (o que voce ja manda pro cliente hoje)
LINK_GITHUB_PAGES = "https://eddy14s.github.io/stuidioedipo3d/"

# Pasta onde ficam TODOS os projetos de clientes (padrao: NOME_CLIENTE\render360)
PASTA_BASE_CLIENTES = Path(r"E:\0_STUDIO_3D\1_PROJETOS_2026")

# Nome da subpasta de renders dentro da pasta de cada cliente
NOME_PASTA_RENDER = "render360"

# Extensoes de imagem aceitas na pasta de renders do cliente
EXTENSOES_VALIDAS = (".jpg", ".jpeg", ".png")

# Palavras usadas para gerar a senha (facil de falar, dificil de adivinhar)
PALAVRAS_SENHA = [
    "Praia", "Serra", "Vidro", "Aurora", "Nuvem", "Marfim", "Bosque",
    "Girassol", "Coral", "Granito", "Nascer", "Horizonte", "Cedro",
    "Safira", "Estuario", "Alameda", "Vitral", "Jasmim", "Rocha", "Brisa",
]

# ======================================================================


def encontrar_pasta_cliente(nome_cliente: str) -> Path:
    """Procura, dentro de PASTA_BASE_CLIENTES, uma pasta cujo nome bata
    (ignorando maiusculas/minusculas e espacos/underscores) com o nome
    do cliente informado."""
    if not PASTA_BASE_CLIENTES.exists():
        sys.exit(f"Pasta base de clientes nao encontrada: {PASTA_BASE_CLIENTES}")

    alvo = nome_cliente.strip().lower().replace(" ", "_")

    candidatas = [
        p for p in PASTA_BASE_CLIENTES.iterdir()
        if p.is_dir() and p.name.strip().lower().replace(" ", "_") == alvo
    ]

    if not candidatas:
        # tenta uma busca mais flexivel (contem o nome, nao so igual)
        candidatas = [
            p for p in PASTA_BASE_CLIENTES.iterdir()
            if p.is_dir() and alvo in p.name.strip().lower().replace(" ", "_")
        ]

    if not candidatas:
        sys.exit(
            f"Nao encontrei nenhuma pasta de cliente parecida com '{nome_cliente}' "
            f"dentro de {PASTA_BASE_CLIENTES}.\n"
            f"Use --pasta para apontar o caminho manualmente."
        )

    if len(candidatas) > 1:
        nomes = "\n".join(f"  - {c.name}" for c in candidatas)
        sys.exit(
            f"Encontrei mais de uma pasta parecida com '{nome_cliente}':\n{nomes}\n"
            f"Seja mais especifico ou use --pasta para apontar o caminho exato."
        )

    return candidatas[0]


def gerar_senha() -> str:
    """Gera senha do tipo 'Praia482': facil de falar/digitar, dificil de
    adivinhar (mistura palavra + 3 numeros aleatorios)."""
    palavra = random.choice(PALAVRAS_SENHA)
    numeros = random.randint(100, 999)
    return f"{palavra}{numeros}"


def listar_imagens(pasta: Path) -> list[Path]:
    """Varre a pasta e TODAS as subpastas dentro dela, procurando imagens.
    Ordena primeiro pelo caminho da subpasta (ex: externo antes de interior,
    em ordem alfabetica) e depois pelo nome do arquivo."""
    imagens = sorted(
        [p for p in pasta.rglob("*") if p.suffix.lower() in EXTENSOES_VALIDAS],
        key=lambda p: (str(p.parent).lower(), p.name.lower()),
    )
    if not imagens:
        sys.exit(f"Nenhuma imagem encontrada em: {pasta} (nem nas subpastas)")
    return imagens


def limpar_e_copiar_imagens(imagens: list[Path], destino: Path) -> str:
    """Limpa a pasta imagens_360 e copia as novas, renomeando 1,2,3..."""
    if destino.exists():
        shutil.rmtree(destino)
    destino.mkdir(parents=True)

    extensao = imagens[0].suffix.lower().lstrip(".")

    for i, imagem in enumerate(imagens, start=1):
        shutil.copy2(imagem, destino / f"{i}{imagem.suffix.lower()}")

    return extensao


def atualizar_config_js(config_path: Path, total_imagens: int, extensao: str, senha: str):
    conteudo = config_path.read_text(encoding="utf-8")

    conteudo = re.sub(r'extensao:\s*".*?"', f'extensao: "{extensao}"', conteudo)
    conteudo = re.sub(r"totalImagens:\s*\d+", f"totalImagens: {total_imagens}", conteudo)
    conteudo = re.sub(r'senha:\s*".*?"', f'senha: "{senha}"', conteudo)

    config_path.write_text(conteudo, encoding="utf-8")


def rodar(comando: list[str], cwd: Path):
    resultado = subprocess.run(comando, cwd=cwd, capture_output=True, text=True)
    if resultado.returncode != 0:
        print(resultado.stdout)
        print(resultado.stderr)
        sys.exit(f"Comando falhou: {' '.join(comando)}")


def publicar_git(projeto_dir: Path, cliente: str):
    data = datetime.now().strftime("%d/%m/%Y %H:%M")
    rodar(["git", "add", "-A"], cwd=projeto_dir)

    # se nao houver mudancas, o commit falha - trata isso sem quebrar o script
    commit = subprocess.run(
        ["git", "commit", "-m", f"Tour: {cliente} - {data}"],
        cwd=projeto_dir, capture_output=True, text=True,
    )
    if commit.returncode != 0 and "nothing to commit" not in commit.stdout.lower():
        print(commit.stdout)
        print(commit.stderr)
        sys.exit("Falha ao commitar.")

    rodar(["git", "push"], cwd=projeto_dir)


def main():
    parser = argparse.ArgumentParser(description="Publica o tour 360 de um cliente.")
    parser.add_argument("--cliente", required=True, help="Nome do cliente")
    parser.add_argument(
        "--pasta", required=False,
        help="(Opcional) Caminho manual da pasta de renders. Se nao informado, "
             "o script procura sozinho em PASTA_BASE_CLIENTES.",
    )
    parser.add_argument(
        "--cena", required=False,
        help="(Opcional) Nome de uma subpasta especifica dentro do render360 "
             "(ex: 'noturna') para publicar so aquela categoria.",
    )
    args = parser.parse_args()

    if args.pasta:
        pasta_renders = Path(args.pasta)
        if not pasta_renders.exists():
            sys.exit(f"Pasta nao encontrada: {pasta_renders}")
    else:
        pasta_cliente = encontrar_pasta_cliente(args.cliente)
        pasta_renders = pasta_cliente / NOME_PASTA_RENDER
        if not pasta_renders.exists():
            sys.exit(
                f"Achei a pasta do cliente ({pasta_cliente}) mas nao existe "
                f"subpasta '{NOME_PASTA_RENDER}' dentro dela."
            )

    if args.cena:
        pasta_renders = pasta_renders / args.cena
        if not pasta_renders.exists():
            sys.exit(f"Subpasta de cena nao encontrada: {pasta_renders}")

    imagens_360_dir = PROJETO_DIR / "imagens_360"
    config_js = PROJETO_DIR / "config.js"

    print(f"→ Lendo imagens de: {pasta_renders}")
    imagens = listar_imagens(pasta_renders)
    print(f"→ {len(imagens)} imagem(ns) encontrada(s)")

    print("→ Copiando e renomeando imagens...")
    extensao = limpar_e_copiar_imagens(imagens, imagens_360_dir)

    senha = gerar_senha()
    print(f"→ Atualizando config.js (total={len(imagens)}, senha={senha})...")
    atualizar_config_js(config_js, len(imagens), extensao, senha)

    print("→ Enviando para o GitHub...")
    publicar_git(PROJETO_DIR, args.cliente)

    print("\n" + "=" * 50)
    print("TOUR PUBLICADO COM SUCESSO")
    print("=" * 50)
    print(f"Cliente : {args.cliente}")
    print(f"Link    : {LINK_GITHUB_PAGES}")
    print(f"Senha   : {senha}")
    print("=" * 50)
    print(
        f"\nMensagem pronta para enviar:\n\n"
        f"Ola! Segue o link do seu tour virtual 360°:\n"
        f"{LINK_GITHUB_PAGES}\n"
        f"Senha de acesso: {senha}\n"
    )


if __name__ == "__main__":
    main()
