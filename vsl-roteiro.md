# VSL da open33 — roteiro

O vídeo de vendas (VSL) fica na seção "Assista em 1 minuto", logo depois do
topo. O botão "Assistir em 1 min" do topo leva até ele.

Hoje o vídeo é uma **animação feita no próprio site**, sem arquivo de vídeo.
São 7 cenas em 1min06, com legendas na tela. Começa sozinha e sem som
quando aparece na tela, e pausa quando sai. Também tem barra de progresso,
tela final com "Ver planos" e transcrição. No celular, a animação muda para o
formato vertical 4:5.

O preço das cenas 6 e 7 é lido do plano Start da página. Se você mudar o
preço lá, o vídeo acompanha.

## Roteiro

Cerca de 120 palavras em 66 segundos, num ritmo calmo.

| Tempo | Na tela | Narração |
|---|---|---|
| 0:00–0:07 | "Você usa o Claude para programar?" e uma moeda de dólar girando. Depois, "E paga em dólar?" | Você usa o Claude para programar? E paga em dólar, no cartão internacional? |
| 0:07–0:17 | Fatura de cartão de **exemplo** em 3D, com câmbio, IOF e total mudando. Ao lado: "Cartão internacional. IOF. Câmbio do dia. Todo mês, um valor diferente." | Aí vem o IOF, o câmbio do dia… e todo mês a fatura chega com um valor diferente. |
| 0:17–0:25 | Planeta 3D, a marca **open33** e "Claude Opus 5 com plano mensal em reais." | Com a open33 é diferente. Você usa o Claude Opus 5 com plano mensal em reais. |
| 0:25–0:40 | Terminal digitando `ANTHROPIC_BASE_URL="https://api.open33.tech"`, a chave e `claude --model claude-opus-5`. Depois aparecem os nomes Claude Code, Cursor, Antigravity e Seu app. | Para começar, é só trocar a URL e a chave. Duas linhas no terminal e o Claude Code está pronto. Também funciona no Cursor, no Antigravity e no seu app. |
| 0:40–0:50 | "Tudo em reais:" com 4 cartões: Pix ou cartão nacional; Preço fixo, sem IOF; 1M tokens de contexto; Suporte em português. | Você paga no Pix ou no cartão, com preço fixo e sem IOF. Tem 1 milhão de tokens de contexto e suporte em português. |
| 0:50–0:59 | "Planos a partir de R$ 97/mês", "cerca de R$ 3,23 por dia" e o selo "7 dias de garantia". | Os planos começam em R$ 97 por mês, cerca de R$ 3,23 por dia. E você ainda tem 7 dias de garantia. |
| 0:59–1:06 | "Escolha seu plano agora." e o botão "Ver planos". | Escolha seu plano logo abaixo e comece hoje. |

## Trocar por um vídeo gravado

Um vídeo com voz de verdade costuma converter mais. Você pode gravar seguindo
o roteiro acima de duas formas:

- **Tela com narração**: grave a própria animação com o OBS ou com o gravador
  do sistema e narre por cima.
- **Você falando**: grave falando para a câmera e use a animação como imagem
  de apoio entre as falas.

Dicas de gravação:

- Grave na **horizontal (16:9, 1920×1080)**. O vídeo gravado aparece em 16:9
  também no celular.
- Use um microfone de lapela, num lugar silencioso.
- Coloque legendas no próprio vídeo, porque muita gente assiste sem som.
- Nos primeiros 3 segundos, vá direto à pergunta, sem apresentação.
- Deixe a primeira imagem forte (o título ou o seu rosto). Ela aparece antes
  do play.

Para colocar no site, edite o `CONFIG` no fim do `index.html`:

```js
video: {
  youtube: "https://youtu.be/SEU_ID", // aceita link normal, youtu.be, shorts ou só o ID
  mp4: "",                            // ou o caminho de um arquivo, ex.: "video/vsl.mp4"
},
```

- **YouTube**: suba como "Não listado" e cole o link. O player usa o domínio
  `youtube-nocookie.com`.
- **MP4**: coloque o arquivo na pasta do site. Use H.264, 1080p, com até uns
  25 MB para carregar rápido.

Com um vídeo configurado, a animação, a barra própria e a transcrição saem, e
entra o player do vídeo. Se o link ficar vazio, a animação volta.

## Antes de publicar (vale para a animação e para o vídeo gravado)

- **Nada de "ilimitado" ou "sem limite"**: todo plano tem limite de uso. Se
  quiser falar de limite, use o número real do plano.
- **Cursor e Antigravity**: a cena 4 diz que funciona neles. O Claude Code
  aceita URL própria (`ANTHROPIC_BASE_URL`). Só mantenha os outros dois se você
  testou com a sua API. Para tirar, apague o chip na cena 4 e ajuste a legenda
  "Também funciona no Cursor…" na lista `caps`, dentro da função `vsl()`.
- **Fatura**: é um exemplo e está marcada assim na tela. O câmbio varia e o
  IOF usado (3,5%) é só ilustração.
- **Garantia de 7 dias, Pix, cartão, preço fixo e suporte em português**:
  confirme que você oferece tudo isso. Se não oferecer, tire da cena 5, da
  cena 6 e da legenda.
- **Preço**: a animação atualiza sozinha, mas um vídeo gravado precisa ser
  refeito se o preço mudar.
- **Marcas**: o vídeo usa só texto, sem logotipos da Anthropic, do Cursor ou
  do Google. Mantenha assim também no vídeo gravado.
