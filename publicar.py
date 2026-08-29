"""
Script de publicacao automatica do Tour Virtual 360.

NOVIDADE: agora cada cliente ganha sua PROPRIA subpasta dentro do mesmo
repositorio, com link fixo e independente. Publicar um cliente novo NAO
apaga nem sobrescreve o de outro cliente.

Exemplo de links resultantes:
    https://eddy14s.github.io/stuidioedipo3d/casa-silva/
    https://eddy14s.github.io/stuidioedipo3d/apto-joao/

O que ele faz, em ordem:
  1. Acha a pasta de renders do cliente automaticamente
     (padrao: NOME_CLIENTE\\render360, varrendo subpastas tipo interior/externo)
  2. Se for a primeira vez desse cliente, cria a subpasta dele dentro do
     repositorio, copiando o modelo base (pasta _template)
  3. Copia as imagens pra dentro da subpasta do cliente, renomeando pra
     1.jpg, 2.jpg... (apagando as imagens antigas DAQUELE cliente, sem
     mexer nas de outros clientes)
  4. Atualiza o config.js daquele cliente (quantidade de imagens + senha nova)
  5. Faz commit e push pro GitHub (repositorio unico de sempre)
  6. Mostra o link definitivo daquele cliente + a senha, prontos pra enviar

IMPORTANTE (configuracao unica, antes do primeiro uso):
  Dentro do repositorio clonado, crie uma pasta chamada "_template" e
  coloque nela os arquivos base do projeto (index.html, style.css,
  viewer.js, menu.js, keyboard.js, help.js, navigation.js, device.js,
  scenes.js, config.js). Essa pasta serve de "molde" pra cada cliente
  novo. Ela nao e nenhum tour em si, so a base copiada pros outros.

Uso basico (acha a pasta do cliente sozinho):
    python publicar.py --cliente "Casa Silva"

Uso publicando so uma subpasta especifica (ex: so as imagens noturnas):
    python publicar.py --cliente "Casa Silva" --cena "noturna"

Uso apontando uma pasta de renders manualmente:
    python publicar.py --cliente "Casa Silva" --pasta "C:\\Renders\\CasaSilva"

Uso para atualizar SO AS IMAGENS de um cliente ja publicado (mantem a
senha atual e nao mexe nos arquivos base/personalizacoes do cliente):
    python publicar.py --cliente "Casa Silva" --so-imagens

Uso para REMOVER um cliente (apaga a subpasta local + GitHub):
    python publicar.py --remover "Casa Silva"

Uso para VER a lista de clientes ativos, links e senhas:
    python publicar.py --listar

Um arquivo "clientes.csv" e mantido automaticamente na raiz do repositorio,
com o historico de cada cliente (link, senha, data, status). Esse arquivo
fica SOMENTE no seu computador (o script o adiciona ao .gitignore sozinho),
nunca e enviado ao GitHub - importante porque o repositorio e publico.
"""

import argparse
import csv
import random
import re
import shutil
import subprocess
import sys
import unicodedata
from datetime import datetime
from pathlib import Path

# ======================================================================
# CONFIGURACAO - ajuste isso UMA VEZ so, de acordo com o seu ambiente
# ======================================================================

# Pasta raiz do repositorio clonado (onde fica a pasta _template e onde
# vao ser criadas as subpastas de cada cliente)
REPO_DIR = Path(r"E:\4_VS-CODE_STUDIO_3D\SITE-VIZUALIZADOR-360\stuidioedipo3d")

# Pasta modelo (molde) dentro do repositorio, usada pra criar cada cliente novo
TEMPLATE_DIR = REPO_DIR / "_template"

# Link fixo do seu GitHub Pages (sem a subpasta do cliente no final)
LINK_GITHUB_PAGES = "https://eddy14s.github.io/stuidioedipo3d/"

# Pasta onde ficam TODOS os projetos de clientes (padrao: NOME_CLIENTE\render360)
PASTA_BASE_CLIENTES = Path(r"E:\0_STUDIO_3D\1_PROJETOS_2026")

# Nome da subpasta de renders dentro da pasta de cada cliente
NOME_PASTA_RENDER = "render360"

# Arquivo local com o histórico de clientes/links/senhas (NUNCA vai pro GitHub,
# pois o repositório é público - veja garantir_gitignore())
CLIENTES_CSV = REPO_DIR / "clientes.csv"
CAMPOS_CSV = ["cliente", "slug", "link", "senha", "total_imagens", "data", "status"]

# Extensoes de imagem aceitas na pasta de renders do cliente
EXTENSOES_VALIDAS = (".jpg", ".jpeg", ".png")

# Palavras usadas para gerar a senha (facil de falar, dificil de adivinhar)
PALAVRAS_SENHA = [
    "Praia", "Serra", "Vidro", "Aurora", "Nuvem", "Marfim", "Bosque",
    "Girassol", "Coral", "Granito", "Nascer", "Horizonte", "Cedro",
    "Safira", "Estuario", "Alameda", "Vitral", "Jasmim", "Rocha", "Brisa",
]

# ======================================================================


def slugify(nome: str) -> str:
    """Transforma 'Casa Silva' em 'casa-silva': minusculo, sem acento,
    so letras/numeros/hifen. Usado como nome da subpasta e do link."""
    nome = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode("ascii")
    nome = nome.lower().strip()
    nome = re.sub(r"[^a-z0-9]+", "-", nome).strip("-")
    return nome or "cliente"


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


def preparar_pasta_do_cliente(slug: str) -> Path:
    """Garante que existe uma subpasta pro cliente dentro do repositorio.
    Se for a primeira vez, copia o modelo base (_template) pra ela."""
    if not TEMPLATE_DIR.exists():
        sys.exit(
            f"Pasta modelo nao encontrada: {TEMPLATE_DIR}\n"
            f"Crie a pasta '_template' dentro do repositorio com os arquivos "
            f"base do projeto (veja o topo deste script)."
        )

    destino = REPO_DIR / slug
    destino.mkdir(parents=True, exist_ok=True)

    for item in TEMPLATE_DIR.iterdir():
        if item.name == "imagens_360":
            continue  # imagens sao tratadas separadamente, nao vem do template

        if item.is_dir():
            shutil.copytree(item, destino / item.name, dirs_exist_ok=True)
        else:
            shutil.copy2(item, destino / item.name)

    return destino


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
    """Limpa a pasta imagens_360 (SO daquele cliente) e copia as novas,
    renomeando 1,2,3..."""
    if destino.exists():
        shutil.rmtree(destino)
    destino.mkdir(parents=True)

    extensao = imagens[0].suffix.lower().lstrip(".")

    for i, imagem in enumerate(imagens, start=1):
        shutil.copy2(imagem, destino / f"{i}{imagem.suffix.lower()}")

    return extensao


def ler_senha_atual(config_path: Path) -> str:
    """Le a senha que ja esta gravada no config.js do cliente (usado no
    modo --so-imagens, pra nao trocar a senha de quem ja tem o link)."""
    if not config_path.exists():
        sys.exit(f"config.js nao encontrado: {config_path}")

    conteudo = config_path.read_text(encoding="utf-8")
    encontrado = re.search(r'senha:\s*"(.*?)"', conteudo)
    if not encontrado:
        sys.exit(f"Nao consegui encontrar o campo 'senha' em: {config_path}")
    return encontrado.group(1)


def atualizar_config_js(config_path: Path, total_imagens: int, extensao: str, senha: str):
    conteudo = config_path.read_text(encoding="utf-8")

    conteudo = re.sub(r'extensao:\s*".*?"', f'extensao: "{extensao}"', conteudo)
    conteudo = re.sub(r"totalImagens:\s*\d+", f"totalImagens: {total_imagens}", conteudo)
    conteudo = re.sub(r'senha:\s*".*?"', f'senha: "{senha}"', conteudo)

    config_path.write_text(conteudo, encoding="utf-8")


def garantir_gitignore():
    """Garante que clientes.csv NUNCA seja enviado ao GitHub (repositorio
    publico), mesmo que alguem rode 'git add -A' sem pensar."""
    gitignore = REPO_DIR / ".gitignore"
    linha = "clientes.csv"

    if gitignore.exists():
        conteudo = gitignore.read_text(encoding="utf-8")
        if linha in conteudo.splitlines():
            return
        with gitignore.open("a", encoding="utf-8") as f:
            f.write(f"\n{linha}\n")
    else:
        gitignore.write_text(f"{linha}\n", encoding="utf-8")


def _ler_registros_csv() -> list[dict]:
    if not CLIENTES_CSV.exists():
        return []
    with CLIENTES_CSV.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def _salvar_registros_csv(linhas: list[dict]):
    with CLIENTES_CSV.open("w", encoding="utf-8", newline="") as f:
        escritor = csv.DictWriter(f, fieldnames=CAMPOS_CSV)
        escritor.writeheader()
        escritor.writerows(linhas)


def registrar_cliente_publicado(nome_cliente: str, slug: str, link: str, senha: str, total_imagens: int):
    linhas = _ler_registros_csv()
    data_str = datetime.now().strftime("%d/%m/%Y %H:%M")

    novo_registro = {
        "cliente": nome_cliente, "slug": slug, "link": link, "senha": senha,
        "total_imagens": str(total_imagens), "data": data_str, "status": "ativo",
    }

    for i, linha in enumerate(linhas):
        if linha.get("slug") == slug:
            linhas[i] = novo_registro
            break
    else:
        linhas.append(novo_registro)

    _salvar_registros_csv(linhas)


def registrar_cliente_removido(slug: str):
    linhas = _ler_registros_csv()
    data_str = datetime.now().strftime("%d/%m/%Y %H:%M")

    for linha in linhas:
        if linha.get("slug") == slug:
            linha["status"] = "removido"
            linha["link"] = "-"
            linha["senha"] = "-"
            linha["data"] = data_str

    _salvar_registros_csv(linhas)


def listar_clientes():
    linhas = _ler_registros_csv()
    ativos = [l for l in linhas if l.get("status") == "ativo"]

    if not ativos:
        print("Nenhum cliente ativo registrado ainda.")
        return

    print(f"\n{'CLIENTE':<25} {'LINK':<55} {'SENHA':<15} {'ATUALIZADO EM'}")
    print("-" * 110)
    for l in ativos:
        print(f"{l['cliente']:<25} {l['link']:<55} {l['senha']:<15} {l['data']}")
    print()


def rodar(comando: list[str], cwd: Path):
    resultado = subprocess.run(comando, cwd=cwd, capture_output=True, text=True)
    if resultado.returncode != 0:
        print(resultado.stdout)
        print(resultado.stderr)
        sys.exit(f"Comando falhou: {' '.join(comando)}")


def remover_cliente(nome_cliente: str):
    slug = slugify(nome_cliente)
    pasta_cliente = REPO_DIR / slug

    if not pasta_cliente.exists():
        sys.exit(f"Nao existe nenhuma subpasta publicada para '{nome_cliente}' (esperava: {pasta_cliente})")

    print(f"→ Cliente: {nome_cliente}  →  subpasta: /{slug}/")
    print(f"→ Pasta a ser apagada: {pasta_cliente}")

    confirmacao = input(
        f"\nTem certeza que quer apagar o tour de '{nome_cliente}'? "
        f"O link {LINK_GITHUB_PAGES}{slug}/ vai parar de funcionar. "
        f"Digite SIM para confirmar: "
    )
    if confirmacao.strip().upper() != "SIM":
        sys.exit("Cancelado. Nada foi apagado.")

    shutil.rmtree(pasta_cliente)
    print("→ Pasta local apagada. Enviando remoção para o GitHub...")

    data = datetime.now().strftime("%d/%m/%Y %H:%M")
    rodar(["git", "add", "-A"], cwd=REPO_DIR)
    commit = subprocess.run(
        ["git", "commit", "-m", f"Remove cliente: {nome_cliente} - {data}"],
        cwd=REPO_DIR, capture_output=True, text=True,
    )
    if commit.returncode != 0 and "nothing to commit" not in commit.stdout.lower():
        print(commit.stdout)
        print(commit.stderr)
        sys.exit("Falha ao commitar a remoção.")

    rodar(["git", "push"], cwd=REPO_DIR)

    registrar_cliente_removido(slug)

    print("\n" + "=" * 50)
    print("CLIENTE REMOVIDO COM SUCESSO")
    print("=" * 50)
    print(f"Cliente : {nome_cliente}")
    print(f"Link removido: {LINK_GITHUB_PAGES}{slug}/")
    print("(pode levar 1-2 minutos pra o GitHub Pages atualizar de fato)")
    print("=" * 50)


def publicar_git(repo_dir: Path, cliente: str):
    data = datetime.now().strftime("%d/%m/%Y %H:%M")
    rodar(["git", "add", "-A"], cwd=repo_dir)

    # se nao houver mudancas, o commit falha - trata isso sem quebrar o script
    commit = subprocess.run(
        ["git", "commit", "-m", f"Tour: {cliente} - {data}"],
        cwd=repo_dir, capture_output=True, text=True,
    )
    if commit.returncode != 0 and "nothing to commit" not in commit.stdout.lower():
        print(commit.stdout)
        print(commit.stderr)
        sys.exit("Falha ao commitar.")

    rodar(["git", "push"], cwd=repo_dir)


def main():
    parser = argparse.ArgumentParser(description="Publica ou remove o tour 360 de um cliente.")
    parser.add_argument("--cliente", required=False, help="Nome do cliente (para publicar)")
    parser.add_argument("--remover", required=False, help="Nome do cliente a remover (apaga local + GitHub)")
    parser.add_argument("--listar", action="store_true", help="Mostra a lista de clientes ativos e sai")
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
    parser.add_argument(
        "--so-imagens", action="store_true",
        help="Atualiza SO as imagens de um cliente que ja foi publicado antes: "
             "mantem a senha atual e nao recopia os arquivos base do _template "
             "(preserva qualquer personalizacao feita naquele cliente).",
    )
    args = parser.parse_args()

    garantir_gitignore()

    if args.listar:
        listar_clientes()
        return

    if not args.cliente and not args.remover:
        sys.exit("Use --cliente \"Nome\" para publicar, ou --remover \"Nome\" para apagar.")

    if args.remover:
        remover_cliente(args.remover)
        return

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

    slug = slugify(args.cliente)

    if args.so_imagens:
        pasta_destino = REPO_DIR / slug
        if not pasta_destino.exists():
            sys.exit(
                f"Cliente '{args.cliente}' ainda nao foi publicado (nao existe "
                f"{pasta_destino}). Rode sem --so-imagens na primeira vez."
            )
    else:
        pasta_destino = preparar_pasta_do_cliente(slug)

    imagens_360_dir = pasta_destino / "imagens_360"
    config_js = pasta_destino / "config.js"

    print(f"→ Cliente: {args.cliente}  →  subpasta: /{slug}/")
    print(f"→ Lendo imagens de: {pasta_renders}")
    imagens = listar_imagens(pasta_renders)
    print(f"→ {len(imagens)} imagem(ns) encontrada(s)")

    print("→ Copiando e renomeando imagens...")
    extensao = limpar_e_copiar_imagens(imagens, imagens_360_dir)

    if args.so_imagens:
        senha = ler_senha_atual(config_js)
        print(f"→ Atualizando config.js (total={len(imagens)}, senha mantida)...")
    else:
        senha = gerar_senha()
        print(f"→ Atualizando config.js (total={len(imagens)}, senha={senha})...")
    atualizar_config_js(config_js, len(imagens), extensao, senha)

    print("→ Enviando para o GitHub...")
    publicar_git(REPO_DIR, args.cliente)

    link_final = f"{LINK_GITHUB_PAGES}{slug}/"

    registrar_cliente_publicado(args.cliente, slug, link_final, senha, len(imagens))

    titulo = "IMAGENS ATUALIZADAS COM SUCESSO" if args.so_imagens else "TOUR PUBLICADO COM SUCESSO"
    print("\n" + "=" * 50)
    print(titulo)
    print("=" * 50)
    print(f"Cliente : {args.cliente}")
    print(f"Link    : {link_final}")
    print(f"Senha   : {senha}" + ("  (mantida, nao mudou)" if args.so_imagens else ""))
    print("=" * 50)
    if not args.so_imagens:
        print(
            f"\nMensagem pronta para enviar:\n\n"
            f"Ola! Segue o link do seu tour virtual 360°:\n"
            f"{link_final}\n"
            f"Senha de acesso: {senha}\n"
        )


if __name__ == "__main__":
    main()
