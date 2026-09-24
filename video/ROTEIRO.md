# Roteiro — Reels “Claude Code sem limite” (33 s)

## Brief

| | |
|---|---|
| **Produto** | API para Claude Code com uso ilimitado, que funciona em qualquer CLI ou IDE |
| **Marca** | UNBOUND (troque em `src/roteiro.ts`) |
| **Objetivo** | conversão: clique no link da bio ou comentário com a palavra-chave |
| **Público** | dev brasileiro que já usa Claude Code — no plano da assinatura ou na API paga em dólar |
| **Formato** | Reels 9:16 · 1080×1920 · 30 fps · 33 s · trilha própria a 120 bpm |

## O insight

Para quem vive no Claude Code, o limite não é um número na documentação — é uma
**barra de uso** que vai enchendo enquanto o agente trabalha e sempre acaba no pior
momento: no meio do refactor, na véspera da entrega. Todo mundo que usa conhece essa
barra. E ela tem três formas: a janela de 5 horas, o limite semanal e, para quem foge
dos dois pela API, a fatura em dólar.

## A ideia: a barra

O vídeo inteiro é a história de uma barra.

1. Ela enche até 100% e **acaba** — com o agente no meio da tarefa.
2. Cada forma do limite vira uma **fita de interdição** que amarra o terminal:
   o Claude Code, literalmente, amarrado. (UNBOUND quer dizer desamarrado.)
3. **Duas linhas** coladas no terminal e um Enter **rasgam as fitas** — o drop da
   música cai exatamente no Enter. A prova de que é fácil é o próprio clímax.
4. A barra, solta, **vira o ∞**. Mesma linha, mesmo lugar, mesma cor: ela só se abre.
5. A prova: nove agentes rodando ao mesmo tempo, cada um com o seu medidor de uso —
   que agora mostra ∞. Depois, a mesma janela trocando de ferramenta no ritmo da
   música, com a barra de status sempre “conectado · uso ∞”.
6. No fim, a barra volta uma última vez, e é **a única que acaba**: a do lote.
   *O acesso é limitado. O uso, nunca.*

Nada aparece uma vez só: a barra, as três dores e o ∞ voltam transformados. É isso
que faz o vídeo parecer uma peça única em vez de uma sequência de slides.

## Por que essa estrutura

- **Gancho sem texto para ler**: o primeiro quadro é um número (94%) e uma barra
  quase cheia. Tensão instantânea, entendida em meio segundo, com ou sem som.
- **Dor → amarra → soltura**: o problema não é descrito, é mostrado prendendo o
  terminal. A solução chega como gesto (colar duas linhas), não como adjetivo.
- **Prova antes da promessa**: agentes em paralelo e troca de IDE mostram “ilimitado”
  e “qualquer ferramenta” em vez de só dizer.
- **Objeções respondidas em 4 segundos**: preço (fixo, em reais), começo (minutos),
  risco (7 dias de garantia).
- **Escassez que fecha o conceito**: o lote é a única barra que acaba.
- **Uma frase por cena ganha marcador colorido** — é o que o olho lê primeiro.

---

## Cena a cena

Os quadros batem com `src/timeline.json`. As cenas se sobrepõem alguns quadros:
cada passagem é feita por continuidade, não por corte.

### Ato 1 · O limite — 0:00 a 0:11 (um plano só)

| Tempo | Tela | Visual | Som |
|---|---|---|---|
| 0:00 | **USO DO SEU PLANO · 94%** | Barra quase cheia, terminal do agente trabalhando embaixo. O número sobe um ponto a cada colcheia, a barra vai do laranja ao vermelho. | groove leve; um tique a cada ponto |
| 0:01,5 | **100%** · carimbo **ACABOU.** | O último passo falha, o terminal mostra *“Limite de uso atingido. Seu acesso volta em 4h 59min…”* contando, o selo vira BLOQUEADO, fundo vermelho, glitch. | a música perde rotação e para; falha digital; carimbo |
| 0:04 | fitas: **LIMITE DE 5 HORAS · LIMITE SEMANAL · FATURA EM DÓLAR** | Três fitas de interdição batem, uma por segundo, e amarram o terminal. | batimento grave; uma “fita” por batida |
| 0:07,4 | **Seu Claude Code, / amarrado.** | “amarrado.” em marcador amarelo. | |
| 0:09 | **Duas linhas / soltam tudo.** | “soltam tudo.” em marcador verde. No terminal são digitadas `export ANTHROPIC_BASE_URL=…` e `export ANTHROPIC_AUTH_TOKEN=…`; o selo vira LIBERADO. | subida; teclado |
| 0:10,9 | *Enter* | | Enter pesado |

### Ato 2 · O ∞ — 0:11 a 0:15 (drop)

| Tempo | Tela | Visual | Som |
|---|---|---|---|
| 0:11 | — | Clarão. As fitas **rasgam** e caem; os pedaços voam como confete. A barra vira uma linha de partículas vermelha, no mesmo lugar, e se abre em ∞ ganhando o degradê da marca. Raios giram atrás. | drop; rasgo; impacto |
| 0:11,5 | **UNBOUND** apresenta · **Claude Code / sem limite.** | “sem limite.” num adesivo branco com o degradê. | |
| 0:12,4 | as três fitas, pequenas, **riscadas de verde** | As dores voltam canceladas. | um pop por fita |
| 0:14,5 | — | A câmera mergulha no cruzamento do ∞. | whoosh |

### Ato 3 · A prova — 0:15 a 0:28

| Tempo | Tela | Visual | Som |
|---|---|---|---|
| 0:15 | **Rode quantos / agentes quiser.** · “9 agentes rodando · 0 limites” | Grade 3×3 de terminais, cada agente numa tarefa (testes, refactor, migração, docs, bug, frontend…), logs rolando. Cada painel tem um medidor de uso que mostra **∞**. | um pop por painel; groove com palmas e arpejo |
| 0:20 | **No terminal / ou na sua IDE.** | O painel do meio cresce e vira uma janela de editor. A cada batida ela troca de ferramenta — Claude Code, VS Code, Cursor, JetBrains, Zed, Neovim — com a cor de cada uma, e o código continua sendo escrito de onde parou (com a sugestão fantasma à frente do cursor). A barra de status nunca muda: *UNBOUND conectado · uso ∞ · fila 0*. O marcador do título troca de cor junto. | um pop por troca |
| 0:24 | **Do jeito que / devia ser.** · cartões | **Preço fixo** — em reais, todo mês · **Ativa em minutos** — sem call, sem fila de aprovação · **7 dias de garantia** — não gostou, devolvemos tudo. Um cartão por batida. | pops |

### Ato 4 · A oferta — 0:28 a 0:33

| Tempo | Tela | Visual | Som |
|---|---|---|---|
| 0:28 | UNBOUND · **Lote 07 · 46 de 150 chaves disponíveis** | Varredura com o degradê. A barra volta uma última vez: 104 vendidas em branco, 46 disponíveis em verde. | whoosh; impacto leve |
| 0:28,5 | **O acesso é limitado. / O uso, nunca.** | | |
| 0:29 | botão **Garanta sua chave →** · ↓ link na bio · 7 dias de garantia · aviso | Um brilho atravessa o botão. | |
| 0:31 | — | Um dedo aperta a seta no golpe final da música; o botão salta, confete sobe, o dedo sai. Os 2 últimos segundos ficam parados como cartaz. | toque; golpe final; acorde segurando até o fim |

---

## Locução (opcional — o vídeo foi feito para funcionar sem som)

> *(0:00)* Noventa e quatro… noventa e sete… cem.
> *(0:01,5)* Acabou. No meio da tarefa.
> *(0:04)* Limite de cinco horas. Limite semanal. Fatura em dólar.
> *(0:07,4)* Seu Claude Code, amarrado.
> *(0:09)* Mas duas linhas soltam tudo.
> *(0:11)* Claude Code, sem limite.
> *(0:15)* Rode quantos agentes quiser, ao mesmo tempo.
> *(0:20)* No terminal ou na sua IDE.
> *(0:24)* Preço fixo em reais, ativa em minutos, sete dias de garantia.
> *(0:28)* O acesso é limitado. O uso, nunca. Garanta sua chave no link da bio.

Grave por trecho — cada fala precisa caber na janela do tempo ao lado. Para colocar a
voz no vídeo, salve os arquivos em `public/voz/` e adicione
`<Html5Audio src={staticFile('voz/01.wav')} />` dentro de um `<Sequence>` no quadro
certo; baixe a trilha (`trilha: 0.6`) para a voz ficar na frente.

---

## Legenda do post

```
Seu Claude Code parou no meio da tarefa de novo?

Limite de 5 horas, limite semanal, fatura em dólar — com a UNBOUND nenhum deles existe.
Duas linhas no terminal e o Claude Code roda sem limite, com preço fixo em reais.

→ Funciona no terminal ou na sua IDE: Claude Code, VS Code, Cursor, JetBrains, Zed, Neovim
→ Rode quantos agentes quiser ao mesmo tempo
→ Ativa em minutos · 7 dias de garantia

Lote 07 aberto: as chaves são liberadas por lote.
Link na bio — ou comente CHAVE que eu te mando o acesso.

Serviço independente de provisionamento de acesso. Claude e Claude Code são marcas da Anthropic, citadas apenas para identificar o que é oferecido.

#claudecode #claude #ia #inteligenciaartificial #programacao #dev #desenvolvedor #vibecoding #agentesdeia #vscode #cursor #api
```

**Capa:** `entrega/capa.jpg` (o ∞ com “Claude Code sem limite.” e as três dores riscadas).

---

## Variações de gancho para teste A/B

O gancho é o rótulo, o número inicial e a palavra do carimbo — o resto do vídeo não
muda. Cada variação é um JSON em `variacoes/`:

```bash
npx remotion render Reels out/gancho-b.mp4 --props=variacoes/gancho-b.json
```

| Arquivo | Rótulo | Começa em | Carimbo | Ângulo |
|---|---|---|---|---|
| *(padrão)* | uso do seu plano | 94% | ACABOU. | a barra enchendo |
| `gancho-b.json` | sua sessão de 5 horas | 90% | DE NOVO? | a repetição que irrita |
| `gancho-c.json` | limite semanal | 96% | E AGORA? | o limite que dói mais |
| `gancho-d.json` | orçamento da API em dólar | 88% | ESTOUROU. | quem paga por token |

## Como medir

- **Retenção aos 3 s** (Insights do Reels): decide qual gancho fica. Compare as
  variações com o mesmo público e o mesmo orçamento.
- **Retenção no drop (0:11)**: se cair antes, o ato 1 está longo para o seu público —
  aproxime as marcas `fitas` em `src/timeline.json` (elas podem vir a cada meio segundo).
- **Comentários com a palavra-chave** e **cliques no link**: a métrica que paga.

---

## Continuação da série

O motivo da barra rende uma série com os mesmos componentes:

1. **“Quanto sobra?” (10 s)** — só o medidor: 97%, 98%, 99%… e corta. Legenda:
   *“Você conhece essa barra.”* Teaser para o vídeo principal.
2. **“24 horas” (15 s)** — o relógio acelerado de um dia inteiro, a grade de agentes
   rodando, o medidor em ∞ o tempo todo. *“O dia 31 custa o mesmo que o dia 1.”*
3. **“Configure em 20 s” (20 s)** — tutorial: o mesmo terminal da soltura, depois VS
   Code e Cursor. É o vídeo para mandar a quem comentou CHAVE.
4. **“Lote fechando” (8 s)** — só a barra do lote diminuindo com a contagem
   regressiva da página. Para os stories da última semana do lote.

---

## Antes de publicar — confira

O vídeo usa números da página de vendas, e a própria página avisa que eles são
**exemplos de layout**. Troque pelos reais ou tire a afirmação:

- [ ] Lote, chaves restantes e total (`oferta.lote`, `restantes`, `total`)
- [ ] Endpoint e formato da chave (`endpoint`, `chave`)
- [ ] “Preço fixo em reais”, “ativa em minutos” e a garantia de 7 dias (`confianca.cartoes`)
- [ ] Ferramentas — deixe só as que vocês testaram (`editores.nomes`)
- [ ] “Uso ilimitado” está sujeito à política de uso justo da página — se houver
      letra miúda, ela vai na legenda
- [ ] Mantenha o aviso de não afiliação: ele protege a marca de parecer oficial
