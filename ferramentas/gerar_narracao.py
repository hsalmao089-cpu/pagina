"""Gera vsl-narracao.mp3, a narração da VSL, com voz sintética em português.

Quando usar: se mudar o preço do plano Start, a narração precisa ser refeita.
Enquanto o preço falado for diferente do preço da página, o site deixa o vídeo
sem som.

Como usar:
  1. pip install piper-tts imageio-ffmpeg numpy
  2. Ajuste PRECO, FALA_PRECO e FALA_DIA abaixo.
  3. Na pasta do site: python ferramentas/gerar_narracao.py
  4. No index.html, troque data-price="97" da tag <audio class="vsl-audio">
     pelo novo preço.

A voz é a "cadu" do Piper (https://github.com/OHF-Voice/piper1-gpl), treinada
num conjunto de dados CC0. Ela é baixada na primeira execução (~63 MB).

Os tempos precisam bater com as cenas (data-start/data-end) e com a lista caps
da função vsl() no index.html. Se uma fala passar do fim da cena, o script avisa.
"""
import pathlib
import subprocess
import sys
import urllib.request
import wave

import imageio_ffmpeg
import numpy as np
from piper import PiperVoice, SynthesisConfig

PRECO = 97                                  # preço do plano Start, em reais
FALA_PRECO = "noventa e sete reais"         # como o preço é falado
FALA_DIA = "três reais e vinte e três"      # preço dividido por 30, falado

VOZ = "pt_BR-cadu-medium"
D = 58.0                                    # duração do vídeo (data-duration)
SR = 22050
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
    (43.4, 53.4, f"Os planos começam em {FALA_PRECO} por mês. Cerca de {FALA_DIA} por dia."),
    (None, 53.4, "E você ainda tem sete dias de garantia."),
    (53.7, D, "Escolha seu plano logo abaixo, e comece hoje."),
]
PAUSA = 0.3                                 # silêncio mínimo entre falas


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
    a = np.concatenate([c.audio_float_array for c in voz.synthesize(texto, syn_config=SynthesisConfig())])
    idx = np.where(np.abs(a) > np.max(np.abs(a)) * 0.02)[0]
    folga = int(0.05 * SR)
    a = a[max(0, idx[0] - folga):min(len(a), idx[-1] + folga)].copy()
    f = int(0.012 * SR)                     # entrada e saída suaves, sem estalo
    a[:f] *= np.linspace(0, 1, f)
    a[-f:] *= np.linspace(1, 0, f)
    return a


def main() -> None:
    voz = PiperVoice.load(str(baixar_voz(RAIZ / "ferramentas" / "vozes")))
    faixa = np.zeros(int(D * SR), dtype=np.float32)
    fim_anterior, ok = 0.0, True
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
        fim_anterior = fim
    if not ok:
        sys.exit("Alguma fala passou do fim da cena. Encurte o texto ou ajuste os tempos.")

    wav = RAIZ / "ferramentas" / "narracao.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(faixa, -1, 1) * 32767).astype("<i2").tobytes())
    subprocess.run([
        imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-i", str(wav),
        "-af", "highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11",
        "-ar", "44100", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "64k", "-t", str(D), str(SAIDA),
    ], check=True)
    wav.unlink()
    print(f"\npronto: {SAIDA.name}. No index.html, use data-price=\"{PRECO}\" na tag <audio class=\"vsl-audio\">.")


if __name__ == "__main__":
    main()
