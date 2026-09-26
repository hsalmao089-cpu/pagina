# VSL da open33 — roteiro

O vídeo de vendas (VSL) fica na seção "Assista em 1 minuto", logo depois do
topo. O botão "Assistir em 1 min" do topo leva até ele.

É uma **animação feita no próprio site, com narração em áudio**
(`vsl-narracao.mp3`). São 7 cenas em 58 segundos, com legendas.

- **Começa sozinho e sem som** quando aparece na tela, porque nenhum navegador
  deixa um site tocar som sem um clique. Por cima aparece o aviso
  "Seu vídeo já começou · Clique para ouvir", que vai para o canto depois de
  6 segundos.
- **Um clique** no aviso, na capa ou em qualquer parte do vídeo liga o som e
  volta o vídeo para o começo, para a pessoa ouvir tudo.
- Na barra ficam o play/pausa, o botão de som (atalho: tecla M), o avanço e o
  tempo. Tem também tela final com "Ver planos" e transcrição.
- A animação segue o tempo do áudio. Se o áudio demorar para carregar, ela
  espera junto.
- No celular, a animação muda para o formato vertical 4:5.

O preço e o valor por dia mostrados na tela vêm do plano Start da página.

## Roteiro

| Tempo | Na tela | Narração |
|---|---|---|
| 0:00–0:06 | "Você usa o Claude para programar?" e uma moeda de dólar girando. Depois, "E paga em dólar?" | Você usa o Claude para programar? E paga em dólar, no cartão internacional? |
| 0:06–0:13 | Fatura de cartão de **exemplo** em 3D, com câmbio, IOF e total mudando. Ao lado: "Cartão internacional. IOF. Câmbio do dia. Todo mês, um valor diferente." | Aí vem o IOF, o câmbio do dia… e todo mês a fatura chega com um valor diferente. |
| 0:13–0:21 | Planeta 3D, a marca **open33** e "Claude Opus 5 com plano mensal em reais." | Com a open33 é diferente. Você usa o Claude Opus 5 com plano mensal em reais. |
| 0:21–0:34 | Terminal digitando `ANTHROPIC_BASE_URL="https://api.open33.tech"`, a chave e `claude --model claude-opus-5`. Depois aparecem os nomes Claude Code, Cursor, Antigravity e Seu app. | Para começar, é só trocar a URL e a chave. Duas linhas no terminal e o Claude Code está pronto. Também funciona no Cursor, no Antigravity e no seu app. |
| 0:34–0:43 | "Tudo em reais:" com 4 cartões: Pix ou cartão nacional; Preço fixo, sem IOF; 1M tokens de contexto; Suporte em português. | Você paga no Pix ou no cartão, com preço fixo e sem pagar IOF. Tem 1 milhão de tokens de contexto e suporte em português. |
| 0:43–0:53 | "Planos a partir de R$ 97/mês", "cerca de R$ 3,23 por dia" e o selo "7 dias de garantia". | Os planos começam em R$ 97 por mês, cerca de R$ 3,23 por dia. E você ainda tem 7 dias de garantia. |
| 0:53–0:58 | "Escolha seu plano agora." e o botão "Ver planos". | Escolha seu plano logo abaixo e comece hoje. |

## A narração

- A voz é sintética. É a voz "cadu", em português do Brasil, do
  [Piper](https://github.com/OHF-Voice/piper1-gpl), um sistema de voz aberto.
  Ela foi treinada num conjunto de dados CC0 e pode ser usada em site
  comercial.
- Cada frase começa junto com o que aparece na tela.
- **Se mudar o preço do plano Start, refaça a narração.** O áudio fala
  "noventa e sete reais". Se o preço da página for outro, o site deixa o vídeo
  sem som e mostra só as legendas, para o vídeo não dizer um preço e a página
  outro. Para refazer:
  1. `pip install piper-tts imageio-ffmpeg numpy`
  2. Ajuste `PRECO`, `FALA_PRECO` e `FALA_DIA` em
     `ferramentas/gerar_narracao.py`.
  3. Rode `python ferramentas/gerar_narracao.py`.
  4. No `index.html`, troque `data-price="97"` da tag
     `<audio class="vsl-audio">` pelo preço novo.

## Trocar pela sua voz

Voz de gente de verdade costuma converter mais que voz sintética. Há dois
caminhos.

**Só o áudio, mantendo a animação:**

1. Grave a narração da tabela acima no celular, num lugar silencioso, num
   ritmo calmo.
2. Me mande o arquivo. Eu ajusto as legendas e as cenas ao tempo da sua fala.
3. Se preferir fazer sozinho: grave cada frase começando no tempo da tabela.
   Salve como `vsl-narracao.mp3`, com 58 segundos, e substitua o arquivo.

**Vídeo gravado, no lugar da animação:** grave na horizontal (16:9,
1920×1080), com legendas no próprio vídeo. Depois cole o link no `CONFIG`, no
fim do `index.html`:

```js
video: {
  youtube: "https://youtu.be/SEU_ID", // aceita link normal, youtu.be, shorts ou só o ID
  mp4: "",                            // ou o caminho de um arquivo, ex.: "video/vsl.mp4"
},
```

- **YouTube**: suba como "Não listado". O player usa o domínio
  `youtube-nocookie.com`.
- **MP4**: use H.264, 1080p e até uns 25 MB.

Com um vídeo configurado, a animação, a narração, a barra própria e a
transcrição saem e entra o player do vídeo. Se o link ficar vazio, a animação
volta.

## Antes de publicar

Vale para a animação, para a narração e para um vídeo gravado.

- **Nada de "ilimitado" ou "sem limite"**: todo plano tem limite de uso. Se
  quiser falar de limite, use o número real do plano.
- **Cursor e Antigravity**: o vídeo diz que funciona neles. O Claude Code aceita
  URL própria (`ANTHROPIC_BASE_URL`). Só mantenha os outros dois se você testou
  com a sua API. Para tirar, é preciso mudar:
  - o chip na cena 4;
  - a legenda "Também funciona no Cursor…" na lista `caps` da função `vsl()`;
  - a narração.
- **Fatura**: é um exemplo e está marcada assim na tela. O câmbio varia e o
  IOF usado (3,5%) é só ilustração.
- **Garantia de 7 dias, Pix, cartão, preço fixo e suporte em português**:
  confirme que você oferece tudo isso. Se não oferecer, tire da tela, das
  legendas e da narração.
- **Marcas**: o vídeo usa só texto, sem logotipos da Anthropic, do Cursor ou
  do Google. Mantenha assim também num vídeo gravado.
