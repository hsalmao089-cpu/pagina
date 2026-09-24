# Roteiro — Reels “Claude Code ilimitado” (33 s)

**Produto:** API para Claude Code com uso ilimitado, que funciona em qualquer CLI ou IDE.
**Marca:** UNBOUND (a mesma da página de vendas deste repositório — troque em `src/roteiro.ts`).
**Formato:** Reels 9:16 · 1080×1920 · 30 fps · 33 s · trilha a 120 bpm.
**Objetivo:** conversão — clique no link da bio (ou comentário com palavra-chave).

## A ideia em uma linha

Todo dev que usa Claude Code já viu o trabalho parar no meio por limite de uso.
O vídeo começa exatamente nesse instante, transforma a dor em três golpes secos e
vira a chave com uma pergunta: *e se o limite não existisse?* A resposta é o ∞ —
e daí em diante é prova, compatibilidade, benefício e oferta.

Estrutura: **gancho → dor → virada → revelação → prova → abrangência → benefício → oferta.**
A cor segue a regra da página: verde só quando algo funciona, vermelho só quando
algo trava. O resto é preto e osso.

---

## Cena a cena

Os tempos batem com `src/timeline.json`. A locução é opcional: o vídeo foi
feito para funcionar **sem som**, porque a maior parte do Reels é vista no mudo.

### 1 · Gancho — 0:00 a 0:03

| | |
|---|---|
| **Tela** | “Claude Code / a todo vapor…” → no 1,5 s troca para “…até bater / **no limite.**” (vermelho) |
| **Visual** | O terminal já está trabalhando no primeiro quadro: pedido digitado, passos ficando verdes. No 1,5 s o último passo falha, entra o bloco vermelho *“Limite de uso atingido. Seu acesso volta em 4h 59min.”*, o selo muda de EXECUTANDO para INTERROMPIDO e a tela dá um glitch. |
| **Som** | Groove leve rodando → a música perde rotação e para (tape stop) no exato quadro do erro + ruído digital de falha. |
| **Locução** | “Seu Claude Code a todo vapor… até bater no limite.” |

> Por que funciona: começa no meio da ação (o feed mostra movimento desde o
> quadro 0) e o público-alvo se reconhece no erro em menos de dois segundos.

### 2 · O custo do limite — 0:03 a 0:08

| | |
|---|---|
| **Tela** | §01 · o custo do limite. Três golpes, um por tempo da música: **Cota.** `402 quota_exceeded` · **Fila.** `529 overloaded_error` · **429.** `429 too_many_requests`. Depois o relógio: “o limite volta em **04:59:59**” descontando, barra “cota 100%”, e a frase **“O seu prazo, / não.”** |
| **Visual** | Cada palavra entra grande e desfocada e assenta com tremor de câmera. O relógio pula o segundo a cada batida. |
| **Som** | Golpe grave a cada palavra; batimento grave por baixo; tique de relógio sincronizado com os segundos. |
| **Locução** | “Cota. Fila. Erro 429. O limite volta em cinco horas. O seu prazo, não.” |

### 3 · A virada — 0:08 a 0:10

| | |
|---|---|
| **Tela** | “E se o limite / não existisse?” — a palavra *limite* é riscada em vermelho. |
| **Visual** | O campo de partículas (a arte da página) começa a acender por trás. No último meio segundo o texto é sugado para a câmera e a tela estoura em branco. |
| **Som** | Subida de ruído + rufar acelerando; um instante de silêncio antes do drop. |
| **Locução** | “E se o limite não existisse?” |

### 4 · Revelação — 0:10 a 0:14 (drop)

| | |
|---|---|
| **Tela** | UNBOUND apresenta · **Claude Code / ilimitado.** · “API com uso ilimitado. Sem rate limit, sem cota de tokens, sem fila.” |
| **Visual** | Um ∞ feito de partículas nasce do cruzamento como um cometa e fecha o laço — de um ponto ao infinito. O campo de fluxo corre no fundo. |
| **Som** | Impacto grave com brilho agudo no drop; a música entra inteira (bumbo, baixo, pad). |
| **Locução** | “Claude Code ilimitado. API sem rate limit, sem cota e sem fila.” |

### 5 · Prova — 0:14 a 0:20

| | |
|---|---|
| **Tela** | §02 · configuração · **“Troque 2 linhas. / Pronto.”** (Pronto em verde) |
| **Visual** | Terminal digitando `export ANTHROPIC_BASE_URL=https://api.unbound.ai` e `export ANTHROPIC_AUTH_TOKEN=…`, depois `claude`. Entra “conectado · uso ilimitado · fila 0”, o pedido ao agente, três passos ficando verdes (6 agentes em paralelo, 128 arquivos editados, 212 testes passando) e “pronto · 0 limites atingidos”. Embaixo, contadores subindo: requisições, tokens e **limites: 0**. |
| **Som** | Teclado de verdade (cada comando tem o som do tamanho dele), enter, tique de confirmação a cada passo, acorde de sucesso no fim. A trilha abaixa para o teclado aparecer. |
| **Locução** | “Troque duas linhas de configuração e pronto. Seus agentes rodam em paralelo, sem bater em nada.” |

### 6 · Qualquer CLI, qualquer IDE — 0:20 a 0:25

| | |
|---|---|
| **Tela** | §03 · onde funciona · **“Qualquer CLI. / Qualquer IDE.”** · “Uma chave. Todas as ferramentas.” |
| **Visual** | Três esteiras correndo em sentidos alternados, com ponto verde em cada ferramenta: Claude Code, OpenCode, Aider, Codex CLI, Goose, Crush · VS Code, Cursor, JetBrains, Zed, Neovim, Emacs · Cline, Roo Code, Kilo Code, Continue, Avante. |
| **Som** | Entra o arpejo na trilha; um blip por esteira. |
| **Locução** | “Funciona em qualquer CLI e em qualquer IDE. Uma chave, todas as ferramentas.” |

### 7 · Benefícios — 0:25 a 0:29

| | |
|---|---|
| **Tela** | §04 · o que vem com a chave · **“Use sem / contar.”** + painel: Rate limit **—** (não existe) · Cota de tokens **—** (não existe) · Fila **0** · Erros 429 **0,00 %** · Preço **fixo** por mês. |
| **Visual** | A régua de instrumentos do herói da página. O traço no lugar do número é desenhado — é o argumento: não é “alto”, é “não existe”. |
| **Som** | Um blip por linha. |
| **Locução** | “Sem rate limit, sem cota, sem fila. Preço fixo por mês. Use sem contar.” |

### 8 · Oferta — 0:29 a 0:33

| | |
|---|---|
| **Tela** | UNBOUND · ● Lote 07 aberto — 46 chaves de 150 (barra: vendidas em cinza, disponíveis em verde) · “O acesso é limitado.” / **“O uso, nunca.”** · botão **Garanta sua chave →** · ↓ link na bio · 7 dias de garantia incondicional · aviso de não afiliação. |
| **Visual** | O último quadro é um cartaz completo: se a pessoa pausar, a oferta inteira está na tela. O botão pulsa no golpe final da trilha (0:32). |
| **Som** | Impacto leve na entrada, golpe final com prato e acorde, sino de sucesso. |
| **Locução** | “O acesso é limitado. O uso, nunca. Garanta sua chave no link da bio.” |

---

## Locução corrida (≈ 95 palavras, ritmo rápido)

> Seu Claude Code a todo vapor… até bater no limite.
> Cota. Fila. Erro 429. O limite volta em cinco horas. O seu prazo, não.
> E se o limite não existisse?
> Claude Code ilimitado. API sem rate limit, sem cota e sem fila.
> Troque duas linhas de configuração e pronto. Seus agentes rodam em paralelo, sem bater em nada.
> Funciona em qualquer CLI e em qualquer IDE. Uma chave, todas as ferramentas.
> Sem rate limit, sem cota, sem fila. Preço fixo por mês. Use sem contar.
> O acesso é limitado. O uso, nunca. Garanta sua chave no link da bio.

Grave por cena, não de uma vez: cada trecho precisa caber na janela da cena.
Para colocar a voz no vídeo, salve os arquivos em `public/voz/` (a pasta
`public/audio/` é regenerada pelo script) e, em cada cena, adicione
`<Html5Audio src={staticFile('voz/cena-1.wav')} />` — e baixe a trilha
(`trilha: 0.6`) para a voz ficar na frente.

---

## Legenda do post

```
Seu Claude Code parou no meio da tarefa de novo?

Com a UNBOUND você usa Claude Code sem rate limit, sem cota de tokens e sem fila — com preço fixo por mês.

→ Funciona em qualquer CLI ou IDE: Claude Code, Cursor, VS Code, JetBrains, Zed, Neovim e mais
→ Configuração em 2 linhas
→ 7 dias de garantia

Lote 07 aberto. As chaves são liberadas por lote.
Link na bio — ou comente CHAVE que eu te mando o acesso.

Serviço independente de provisionamento de acesso. Claude e Claude Code são marcas da Anthropic, citadas apenas para identificar o que é oferecido.

#claudecode #claude #ia #inteligenciaartificial #programacao #dev #desenvolvedor #vibecoding #vscode #cursor #api #agentesdeia
```

**Capa:** use `entrega/capa.jpg` (quadro do ∞ com “Claude Code ilimitado.”). O recorte
3:4 do grid do perfil mantém o ∞ e a manchete inteiros.

---

## Variações de gancho para teste A/B

Os primeiros 3 segundos decidem o alcance. Rode duas ou três versões com o mesmo
restante e fique com a que segura mais gente no 3º segundo (Insights → retenção).
Cada variação é um JSON em `variacoes/`:

```bash
npx remotion render Reels out/gancho-b.mp4 --props=variacoes/gancho-b.json
```

| Arquivo | Manchete antes do erro | Manchete depois do erro | Ângulo |
|---|---|---|---|
| *(padrão)* | Claude Code / a todo vapor… | …até bater / no limite. | narrativa |
| `gancho-b.json` | Faltava só / o último teste… | …e o limite / chegou antes. | frustração concreta |
| `gancho-c.json` | Quanto custa / esperar 5 horas? | Seu deploy / parado. | custo do tempo |
| `gancho-d.json` | Você paga / o plano máximo… | …e ainda / bate no limite. | objeção de preço |

---

## Continuação da série

Um vídeo só não fecha venda de produto técnico. A sequência abaixo reaproveita os
mesmos componentes (terminal, campo de fluxo, ∞, painel) — cada um é uma cena nova
em `src/cenas/` e uma `<Composition>` a mais em `src/Root.tsx`.

**2 · “Lado a lado” (20 s) — prova por comparação**
Tela dividida, o mesmo pedido nos dois terminais. À esquerda, API comum: 429 no
segundo 4, contador de espera subindo. À direita, UNBOUND: passos verdes até o fim.
Fecho: “A diferença não é de preço. É de permissão.” (frase da página).

**3 · “24 horas sem parar” (15 s) — prova de carga**
Timelapse de um agente rodando um dia inteiro: relógio acelerado, contadores de
requisições e tokens subindo, “limites atingidos: 0” parado em verde o tempo todo.
Fecho: “O dia 31 custa o mesmo que o dia 1.”

**4 · “Configure em 20 segundos” (20–30 s) — tutorial que vende**
Três cortes: Claude Code (2 variáveis de ambiente), Cursor (base URL + chave),
VS Code com Cline. Cada corte termina em “funcionando”. É o vídeo para mandar a
quem comentou “CHAVE”.

**5 · “Ilimitado mesmo?” (3 × 8 s) — objeções**
Uma pergunta por vídeo, resposta tirada do FAQ da página: *Ilimitado é ilimitado
mesmo?* · *Funciona no meu editor?* · *E se eu não gostar?* (7 dias de garantia).

**Stories de apoio (no dia da publicação)**
1. Repost do Reels com enquete: “Quantas vezes você bateu no limite esta semana?”
2. Contagem regressiva do lote (figurinha de contagem).
3. Print do terminal “0 limites atingidos” + figurinha de link.

---

## Antes de publicar — confira

O vídeo usa números da página de vendas, e a própria página avisa que eles são
**exemplos de layout**. Troque pelos reais ou tire a afirmação:

- [ ] Lote, chaves restantes e total (`oferta.lote`, `restantes`, `total`)
- [ ] Endpoint e formato da chave (`endpoint`, `chave`)
- [ ] “Erros 429: 0,00 % nos últimos 30 dias” (`beneficios.itens`)
- [ ] Lista de ferramentas — deixe só as que vocês testaram (`compat.ferramentas`)
- [ ] Garantia de 7 dias e as condições dela
- [ ] “Uso ilimitado” está sujeito à política de uso justo da página — se houver
      letra miúda, ela vai na legenda
- [ ] Mantenha o aviso de não afiliação: ele protege a marca de parecer oficial
