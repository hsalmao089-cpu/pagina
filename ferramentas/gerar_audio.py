"""Gera vsl-narracao.mp3: a narração da VSL com trilha de fundo.

O que o script faz:
  1. Fala o roteiro com a voz "cadu" do Piper, em português do Brasil.
  2. Suaviza a voz: menos agudo e chiado, mais corpo, compressão leve e um
     pouco de ambiência.
  3. Compõe uma trilha original (110 BPM, animada e leve), sem direitos de
     terceiros. Também dá para usar uma música sua (TRILHA_ARQUIVO).
  4. Abaixa a trilha sozinha enquanto a voz fala.
  5. Grava tudo num MP3 de 58 segundos.

Quando usar: se mudar o preço do plano Start, a narração precisa ser refeita.
Enquanto o preço falado for diferente do preço da página, o site deixa o vídeo
sem som.

Como usar:
  1. pip install piper-tts imageio-ffmpeg numpy scipy pyloudnorm
  2. Ajuste PRECO, FALA_PRECO e FALA_DIA abaixo.
  3. Na pasta do site: python ferramentas/gerar_audio.py
  4. No index.html, troque data-price="97" da tag <audio class="vsl-audio">
     pelo novo preço.
  5. Se os começos das falas mudarem, copie os tempos que o script mostra para
     a lista caps da função vsl().

A voz "cadu" (https://github.com/OHF-Voice/piper1-gpl) foi treinada num
conjunto de dados CC0. Ela é baixada na primeira execução (~63 MB).
"""
import math
import pathlib
import subprocess
import sys
import urllib.request
import wave

import imageio_ffmpeg
import numpy as np
import pyloudnorm as pyln
from piper import PiperVoice, SynthesisConfig
from scipy import signal

PRECO = 97                                  # preço do plano Start, em reais
FALA_PRECO = "noventa e sete reais"         # como o preço é falado
FALA_DIA = "três reais e vinte e três"      # preço dividido por 30, falado

# opcional: caminho (a partir da pasta do site) de uma música com licença de uso,
# em mp3 ou wav, para usar no lugar da trilha gerada. Ex.: "ferramentas/minha-musica.mp3"
TRILHA_ARQUIVO = ""

VOZ = "pt_BR-cadu-medium"
VELOCIDADE = 1.05                           # acima de 1 = fala mais devagar e calma
D = 58.0                                    # duração do vídeo (data-duration)
SR = 44100
RAIZ = pathlib.Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "vsl-narracao.mp3"

# (começo da fala em segundos ou None = logo depois da anterior, fim da cena, texto falado)
# Algumas palavras vão escritas como se falam: Clóde = Claude, ôpen = open, U R L = URL.
FALAS = [
    (0.3, 6, "Você usa o Clóde para programar?"),
    (2.6, 6, "E paga em dólar, no cartão internacional?"),
    (6.4, 13, "Aí vem o IOF, o câmbio do dia..."),
    (9.1, 13, "e todo mês, a fatura chega com um valor diferente."),
    (13.9, 21.5, "Com a ôpen trinta e três, é diferente."),
    (16.9, 21.5, "Você usa o Clóde Ópus cinco, com plano mensal, em reais."),
    (21.9, 34, "Para começar, é só trocar a U R L, e a chave."),
    (26.1, 34, "Duas linhas no terminal, e o Clóde Côude está pronto."),
    (29.7, 34, "Também funciona no Cursor, no Anti-grávity, e no seu app."),
    (34.4, 43, "Você paga no Pix, ou no cartão, com preço fixo, e sem pagar IOF."),
    (39.1, 43, "Tem um milhão de tôkens de contexto, e suporte em português."),
    (43.3, 53.8, f"Os planos começam em {FALA_PRECO} por mês. Cerca de {FALA_DIA} por dia."),
    (None, 53.8, "E você ainda tem sete dias de garantia."),
    (54.1, D, "Escolha seu plano logo abaixo, e comece hoje."),
]
PAUSA = 0.28                                # silêncio mínimo entre falas

VOZ_LUFS = -17.0                            # volume da voz
TRILHA_LUFS = -22.0                         # volume da trilha sem voz
DUCK_DB = 6.5                               # quanto a trilha abaixa quando a voz fala
FINAL_LUFS = -16.0                          # volume final (padrão de vídeo na internet)


# ---------------------------------------------------------------- filtros
def biquad(tipo, f0, q=0.707, ganho_db=0.0):
    """Coeficientes do "Audio EQ Cookbook" (RBJ)."""
    A = 10 ** (ganho_db / 40)
    w0 = 2 * math.pi * f0 / SR
    al, cw = math.sin(w0) / (2 * q), math.cos(w0)
    sA = 2 * math.sqrt(A) * al
    if tipo == "passa-baixa":
        b, a = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2], [1 + al, -2 * cw, 1 - al]
    elif tipo == "passa-alta":
        b, a = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2], [1 + al, -2 * cw, 1 - al]
    elif tipo == "passa-banda":
        b, a = [al, 0, -al], [1 + al, -2 * cw, 1 - al]
    elif tipo == "pico":
        b, a = [1 + al * A, -2 * cw, 1 - al * A], [1 + al / A, -2 * cw, 1 - al / A]
    elif tipo == "grave":
        b = [A * ((A + 1) - (A - 1) * cw + sA), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - sA)]
        a = [(A + 1) + (A - 1) * cw + sA, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - sA]
    elif tipo == "agudo":
        b = [A * ((A + 1) + (A - 1) * cw + sA), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - sA)]
        a = [(A + 1) - (A - 1) * cw + sA, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - sA]
    else:
        raise ValueError(tipo)
    return np.array(b) / a[0], np.array(a) / a[0]


def filtrar(x, *etapas):
    for etapa in etapas:
        b, a = biquad(*etapa)
        x = signal.lfilter(b, a, x, axis=0)
    return x


def comprimir(x, limiar_db=-24.0, razao=2.5, ataque=0.008, soltura=0.15):
    hop = 64
    n = len(x) // hop * hop
    rms = np.sqrt(np.mean(x[:n].reshape(-1, hop) ** 2, axis=1) + 1e-12)
    alvo = np.minimum(0.0, (limiar_db - 20 * np.log10(rms)) * (1 - 1 / razao))
    ca, cr = math.exp(-hop / (ataque * SR)), math.exp(-hop / (soltura * SR))
    g, atual = np.empty_like(alvo), 0.0
    for i, v in enumerate(alvo):
        c = ca if v < atual else cr
        atual = c * atual + (1 - c) * v
        g[i] = atual
    ganho = np.repeat(10 ** (g / 20), hop)
    ganho = np.concatenate([ganho, np.full(len(x) - n, ganho[-1] if len(ganho) else 1.0)])
    return x * ganho


def resposta_sala(rt60, pre=0.012, corte=6000.0, semente=1):
    """Resposta ao impulso sintética (ruído com queda exponencial), estéreo."""
    n = int(rt60 * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(semente)
    canais = []
    for _ in range(2):
        r = filtrar(rng.standard_normal(n) * np.exp(-6.91 * t / rt60), ("passa-baixa", corte, 0.7))
        r = np.concatenate([np.zeros(int(pre * SR)), r])
        canais.append(r / np.sqrt(np.sum(r ** 2)))
    return np.stack(canais, axis=1)


def reverberar(x, ir, molhado):
    """x mono ou estéreo -> estéreo com reverberação."""
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    y = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - molhado) + y * molhado


def lufs(x):
    return pyln.Meter(SR).integrated_loudness(x)


def ajustar_volume(x, alvo):
    return x * 10 ** ((alvo - lufs(x)) / 20)


# ---------------------------------------------------------------- voz
def baixar_voz(pasta: pathlib.Path) -> pathlib.Path:
    pasta.mkdir(parents=True, exist_ok=True)
    base = "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/cadu/medium/"
    for ext in (".onnx", ".onnx.json"):
        arq = pasta / (VOZ + ext)
        if not arq.exists():
            print("baixando", arq.name)
            urllib.request.urlretrieve(base + VOZ + ext, arq)
    return pasta / (VOZ + ".onnx")


def falar(voz: PiperVoice, texto: str) -> np.ndarray:
    cfg = SynthesisConfig(length_scale=VELOCIDADE)
    a = np.concatenate([c.audio_float_array for c in voz.synthesize(texto, syn_config=cfg)])
    a = signal.resample_poly(a, SR, voz.config.sample_rate)
    idx = np.where(np.abs(a) > np.max(np.abs(a)) * 0.02)[0]
    folga = int(0.05 * SR)
    a = a[max(0, idx[0] - folga):min(len(a), idx[-1] + folga)].copy()
    f = int(0.015 * SR)                     # entrada e saída suaves, sem estalo
    a[:f] *= np.linspace(0, 1, f)
    a[-f:] *= np.linspace(1, 0, f)
    return a


def suavizar_voz(v):
    v = filtrar(
        v,
        ("passa-alta", 90, 0.7),
        ("grave", 220, 0.7, 2.0),           # mais corpo
        ("pico", 3000, 1.0, -3.0),          # menos agressiva
        ("agudo", 6000, 0.7, -6.0),         # menos chiado e som metálico
        ("passa-baixa", 9000, 0.7),
    )
    v = comprimir(v)
    return reverberar(v, resposta_sala(0.5, pre=0.01, corte=5000, semente=7), 0.12)


def montar_voz(voz):
    faixa = np.zeros(int(D * SR))
    comecos, fim_anterior, ok = [], 0.0, True
    for i, (inicio, fim_cena, texto) in enumerate(FALAS):
        a = falar(voz, texto)
        comeco = max(inicio if inicio is not None else 0.0, fim_anterior + PAUSA) if i else (inicio or 0.0)
        fim = comeco + len(a) / SR
        aviso = ""
        if fim > fim_cena + 0.05:
            aviso, ok = f"  <- passa do fim da cena ({fim_cena}s)", False
        print(f"{i:2d}  {comeco:5.2f}s -> {fim:5.2f}s  {texto}{aviso}")
        j = int(comeco * SR)
        faixa[j:j + len(a)] += a
        comecos.append(comeco)
        fim_anterior = fim
    if not ok:
        sys.exit("Alguma fala passou do fim da cena. Encurte o texto ou ajuste os tempos.")
    print("\ncomeço das legendas (lista caps):", [round(c - 0.1, 1) if c > 0.3 else 0 for c in comecos])
    return faixa


# ---------------------------------------------------------------- trilha
BPM = 110
TEMPO = 60 / BPM                            # uma batida
COMPASSO = 4 * TEMPO
ACORDES = [                                 # IV - V - iii - vi em dó maior
    ([53, 57, 60, 64], 41),                 # Fmaj7
    ([55, 59, 62, 64], 43),                 # G6
    ([52, 55, 59, 62], 40),                 # Em7
    ([57, 60, 64, 67], 45),                 # Am7
]
FINAL = ([48, 55, 59, 62, 64], 36)          # Cmaj9 para terminar
GROOVE = 6                                  # compasso em que a bateria entra (~13 s, marca open33)
OFERTA = 20                                 # compasso da oferta (~43,6 s)
rng = np.random.default_rng(33)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def colocar(buf, x, t0, pan=0.0, ganho=1.0):
    i = int(round(t0 * SR))
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    if x.ndim == 1:
        ang = (pan + 1) * math.pi / 4
        buf[i:i + len(x), 0] += x * ganho * math.cos(ang)
        buf[i:i + len(x), 1] += x * ganho * math.sin(ang)
    else:
        buf[i:i + len(x)] += x * ganho


def piano(f, dur, vel):
    """Piano elétrico por FM, no estilo Rhodes."""
    n = int((dur + 1.0) * SR)
    t = np.arange(n) / SR
    indice = 1.1 * np.exp(-t / 0.4) + 0.12
    x = np.sin(2 * np.pi * f * t + indice * np.sin(2 * np.pi * f * t))
    x += 0.08 * np.sin(2 * np.pi * f * 7 * t) * np.exp(-t / 0.05)
    env = np.exp(-t / 2.2)
    a = int(0.003 * SR)
    env[:a] *= np.linspace(0, 1, a)
    k = int(dur * SR)
    env[k:] *= np.exp(-(t[k:] - dur) / 0.18)
    return vel * x * env


_pads = {}


def pad(notas, brilho):
    """Tapete de acorde estéreo com vozes levemente desafinadas (guardado em cache)."""
    chave = (tuple(notas), brilho)
    if chave in _pads:
        return _pads[chave]
    dur = COMPASSO
    n = int((dur + 1.6) * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    r = np.random.default_rng(sum(notas))
    for m in notas:
        for desafino, pan in ((-0.004, -0.7), (0.0, 0.0), (0.004, 0.7)):
            f = hz(m) * (1 + desafino)
            fase = r.uniform(0, 2 * np.pi)
            v = np.zeros(n)
            for k in range(1, 9):
                if f * k > 4000:
                    break
                v += np.sin(2 * np.pi * f * k * t + fase * k) / k ** 1.6
            ang = (pan + 1) * math.pi / 4
            out[:, 0] += v * math.cos(ang)
            out[:, 1] += v * math.sin(ang)
    env = np.ones(n)
    a = int(0.6 * SR)
    env[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    k = int(dur * SR)
    env[k:] = np.exp(-(t[k:] - dur) / 0.45)
    out = filtrar(out * env[:, None], ("passa-baixa", 900 * brilho, 0.6))
    _pads[chave] = out
    return out


def baixo(f, dur, vel):
    n = int((dur + 0.12) * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) + 0.08 * np.sin(6 * np.pi * f * t)
    env = 0.75 + 0.25 * np.exp(-t / 0.25)
    a = int(0.006 * SR)
    env[:a] *= np.linspace(0, 1, a)
    k = int(dur * SR)
    env[k:] *= np.exp(-(t[k:] - dur) / 0.03)
    return filtrar(vel * x * env, ("passa-baixa", 700, 0.7))


def dedilhado(f, vel):
    """Nota curta de timbre macio, entre marimba e violão."""
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for k, (amp, tau) in enumerate(((1.0, 0.32), (0.45, 0.18), (0.2, 0.11), (0.1, 0.07)), start=1):
        x += amp * np.sin(2 * np.pi * f * k * t) * np.exp(-t / tau)
    a = int(0.002 * SR)
    x[:a] *= np.linspace(0, 1, a)
    return vel * x


def bumbo(vel):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 48 + 70 * np.exp(-t / 0.04)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    clique = filtrar(rng.standard_normal(n) * np.exp(-t / 0.002), ("passa-alta", 2000, 0.7)) * 0.2
    return vel * (x + clique)


def palma(vel):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    env = np.zeros(n)
    for atraso in (0.0, 0.011, 0.022):
        m = t >= atraso
        env[m] += np.exp(-(t[m] - atraso) / 0.007)
    m = t >= 0.03
    env[m] += 0.8 * np.exp(-(t[m] - 0.03) / 0.11)
    x = filtrar(rng.standard_normal(n) * env, ("passa-banda", 1400, 0.8), ("passa-alta", 600, 0.7))
    return vel * x


def chimbal(vel, aberto=False):
    dur, tau = (0.35, 0.12) if aberto else (0.08, 0.022)
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = filtrar(rng.standard_normal(n) * np.exp(-t / tau), ("passa-alta", 7500, 0.7), ("passa-alta", 7500, 0.7))
    return vel * x


def chocalho(vel):
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    env = (1 - np.exp(-t / 0.008)) * np.exp(-t / 0.045)
    return vel * filtrar(rng.standard_normal(n) * env, ("passa-banda", 6000, 0.7))


def subida(dur):
    """Ruído que cresce e fica mais agudo, preparando a entrada da bateria."""
    n = int(dur * SR)
    t = np.arange(n) / dur / SR
    ruido = rng.standard_normal(n)
    faixas = [filtrar(ruido, ("passa-banda", f, 0.9)) for f in (600, 1800, 5000)]
    pesos = [np.clip(1 - 2 * t, 0, 1), 1 - np.abs(2 * t - 1), np.clip(2 * t - 1, 0, 1)]
    x = sum(p * b for p, b in zip(pesos, faixas))
    return x * t ** 2


def impacto(vel):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    grave = np.sin(2 * np.pi * 55 * t) * np.exp(-t / 0.5)
    prato = filtrar(rng.standard_normal(n) * np.exp(-t / 0.6), ("passa-alta", 5000, 0.7))
    return vel * (grave + 0.25 * prato)


def trilha():
    n = int(D * SR)
    musica = np.zeros((n, 2))
    reverb_envio = np.zeros((n, 2))
    bateria = np.zeros((n, 2))
    batidas_bumbo = []
    total = math.ceil(D / COMPASSO)
    for c in range(total):
        t0 = c * COMPASSO
        notas, raiz = FINAL if c == total - 1 else ACORDES[c % 4]
        ultimo = c == total - 1
        groove = GROOVE <= c and not ultimo
        oferta = OFERTA <= c and not ultimo
        # tapete
        colocar(musica, pad(notas, 1.5 if oferta else 1.1 if groove else 0.8), t0, ganho=0.05)
        # piano elétrico
        if not groove:
            for m in notas:
                colocar(reverb_envio, piano(hz(m), COMPASSO * 0.95, 0.5 if ultimo else 0.4), t0, pan=0.0)
            if not ultimo:
                for m in notas[-2:]:
                    colocar(reverb_envio, piano(hz(m), TEMPO * 1.2, 0.22), t0 + 2.5 * TEMPO, pan=0.2)
        else:
            for beat, dur, vel in ((0, 1.2, 0.36), (1.5, 0.7, 0.26), (3, 0.8, 0.3)):
                for m in notas:
                    colocar(reverb_envio, piano(hz(m), dur * TEMPO, vel), t0 + beat * TEMPO, pan=-0.1)
        # baixo
        if groove or ultimo:
            padrao = ((0, 4, 0),) if ultimo else ((0, 1.5, 0), (1.5, 0.5, 0), (2, 1, 0), (3.5, 0.5, 12))
            for beat, dur, oit in padrao:
                colocar(musica, baixo(hz(raiz + oit), dur * TEMPO * 0.95, 0.5), t0 + beat * TEMPO)
        # dedilhado em colcheias, com eco que vai de um lado para o outro
        if groove:
            for k, idx in enumerate((0, 2, 1, 3, 2, 1, 3, 2)):
                nota = dedilhado(hz(notas[idx % len(notas)] + 12), 0.09)
                tt = t0 + k * TEMPO / 2
                pan = -0.35 if k % 2 == 0 else 0.35
                colocar(reverb_envio, nota, tt, pan=pan)
                for eco, g in ((1, 0.3), (2, 0.12)):     # eco em colcheia pontuada
                    colocar(reverb_envio, nota, tt + eco * 0.75 * TEMPO, pan=-pan, ganho=g)
        # chocalho na introdução
        if 2 <= c < GROOVE:
            for k in range(16):
                colocar(bateria, chocalho(0.1 if k % 2 else 0.16), t0 + k * TEMPO / 4, pan=0.3)
        # subida antes da bateria entrar
        if c == GROOVE - 1:
            colocar(musica, subida(COMPASSO), t0, ganho=0.12)
        # bateria
        if groove:
            chutes = [0, 2] + ([1.5] if c % 2 else [2.75])
            for b in chutes:
                colocar(bateria, bumbo(0.55), t0 + b * TEMPO)
                batidas_bumbo.append(t0 + b * TEMPO)
            for b in (1, 3):
                colocar(bateria, palma(0.2), t0 + b * TEMPO, pan=0.05)
                colocar(reverb_envio, palma(0.08), t0 + b * TEMPO)
            passos = 16 if (oferta and c >= OFERTA + 3) else 8
            for k in range(passos):
                fora = (k % 2 == 1) if passos == 8 else (k % 4 == 2)
                balanco = 0.08 * TEMPO if (passos == 8 and fora) else 0.0
                vel = (0.11 if fora else 0.07) if passos == 8 else (0.1 if k % 4 == 2 else 0.05)
                colocar(bateria, chimbal(vel), t0 + k * COMPASSO / passos + balanco, pan=0.25)
            if oferta:
                colocar(bateria, chimbal(0.05, aberto=True), t0 + 3.5 * TEMPO, pan=0.3)
            if c == total - 2:                  # virada antes do acorde final
                for k in range(4):
                    colocar(bateria, palma(0.06 + 0.03 * k), t0 + (3 + k / 4) * TEMPO, pan=0.05)
        if c == GROOVE:
            colocar(musica, impacto(0.18), t0)
        if ultimo:
            colocar(bateria, bumbo(0.5), t0)
            colocar(musica, impacto(0.12), t0)

    # o tapete e o baixo "respiram" com o bumbo
    bomba = np.ones(n)
    for tb in batidas_bumbo:
        i = int(tb * SR)
        k = min(n - i, int(0.35 * SR))
        bomba[i:i + k] = np.minimum(bomba[i:i + k], 1 - 0.3 * np.exp(-np.arange(k) / SR / 0.12))
    musica *= bomba[:, None]
    musica += reverberar(reverb_envio, resposta_sala(1.8, pre=0.02, corte=6000, semente=3), 0.28)
    musica += bateria
    return filtrar(musica, ("passa-alta", 35, 0.7))


def carregar_trilha(caminho):
    """Lê uma música, repete se for curta e corta em D segundos."""
    bruto = subprocess.run(
        [imageio_ffmpeg.get_ffmpeg_exe(), "-loglevel", "error", "-i", str(caminho),
         "-f", "s16le", "-ac", "2", "-ar", str(SR), "-"],
        capture_output=True, check=True,
    ).stdout
    x = np.frombuffer(bruto, dtype="<i2").reshape(-1, 2) / 32768
    n = int(D * SR)
    if len(x) < n:
        x = np.tile(x, (math.ceil(n / len(x)), 1))
    return x[:n].copy()


# ---------------------------------------------------------------- mixagem
def abaixar_sob_voz(musica, voz):
    """Abaixa a trilha enquanto a voz fala (ataque rápido, volta devagar)."""
    hop = int(0.01 * SR)
    n = len(voz) // hop * hop
    rms = np.sqrt(np.mean(voz[:n, 0].reshape(-1, hop) ** 2, axis=1) + 1e-12)
    ativo = (20 * np.log10(rms) > -50).astype(float)
    ca, cr = math.exp(-1 / 6), math.exp(-1 / 45)   # ~60 ms para abaixar, ~450 ms para voltar
    env, atual = np.empty_like(ativo), 0.0
    for i, v in enumerate(ativo):
        c = ca if v > atual else cr
        atual = c * atual + (1 - c) * v
        env[i] = atual
    fundo = 10 ** (-DUCK_DB / 20)
    ganho = np.repeat(1 - (1 - fundo) * env, hop)
    ganho = np.concatenate([ganho, np.full(len(musica) - len(ganho), ganho[-1])])
    return musica * ganho[:, None]


def main() -> None:
    voz = PiperVoice.load(str(baixar_voz(RAIZ / "ferramentas" / "vozes")))
    v = ajustar_volume(suavizar_voz(montar_voz(voz)), VOZ_LUFS)
    m = ajustar_volume(carregar_trilha(RAIZ / TRILHA_ARQUIVO) if TRILHA_ARQUIVO else trilha(), TRILHA_LUFS)
    fim = int(1.0 * SR)                     # a trilha some no último segundo
    m[-fim:] *= np.linspace(1, 0, fim)[:, None] ** 1.5
    mix = ajustar_volume(v + abaixar_sob_voz(m, v), FINAL_LUFS)
    wav = RAIZ / "ferramentas" / "vsl-audio.wav"
    pcm = (np.clip(mix, -1, 1) * 32767).astype("<i2")
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run([
        imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-i", str(wav),
        "-af", "alimiter=limit=0.89:attack=5:release=60:level=disabled",
        "-codec:a", "libmp3lame", "-b:a", "112k", "-t", str(D), str(SAIDA),
    ], check=True)
    wav.unlink()
    print(f"\npronto: {SAIDA.name}. No index.html, use data-price=\"{PRECO}\" na tag <audio class=\"vsl-audio\">.")


if __name__ == "__main__":
    main()
