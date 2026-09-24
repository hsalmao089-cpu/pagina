# Vídeo — Reels “Claude Code ilimitado”

Reels de 33 s (1080×1920, 30 fps) para a mesma oferta da página: API para
Claude Code com uso ilimitado, em qualquer CLI ou IDE. Feito em
[Remotion](https://www.remotion.dev) — o vídeo é código React, então texto,
números e marca mudam sem abrir editor de vídeo.

O roteiro completo (cena a cena, locução, legenda do post, variações de gancho e
os próximos vídeos da série) está em **[ROTEIRO.md](ROTEIRO.md)**.

## Direção

A mesma da página: preto de estúdio, osso, e cor só quando significa algo —
verde para “funciona”, vermelho para “travou”. Mesmas fontes (Bricolage
Grotesque, Instrument Sans, Spline Sans Mono), mesmo campo de fluxo em canvas,
mesma entrada de manchete por corte de máscara. Quem vê o Reels e clica no link
cai numa página que parece continuação do vídeo.

## Rodar

```bash
cd video
npm install
npm run dev              # Remotion Studio: pré-visualização + textos editáveis
npm run render           # out/reels-claude-code.mp4
npm run render:sem-trilha  # sem música, só efeitos — para usar um áudio do Instagram
npm run capa             # out/capa.jpg, para a capa do Reels
```

`npm run audio` roda sozinho antes do Studio e do render: gera a trilha e os
efeitos em `public/audio/` (arquivos gerados, fora do git).

Se o Remotion não conseguir baixar o Chrome, aponte para um já instalado:
`npx remotion render Reels out/video.mp4 --browser-executable=/caminho/do/chrome`.

## Onde mexer

| O quê | Onde |
|---|---|
| Todo texto da tela, marca, endpoint, lote, CTA, aviso | `src/roteiro.ts` — ou no painel direito do Studio |
| Volume da trilha e dos efeitos, guias de área segura | props `trilha`, `efeitos`, `guias` |
| Duração e ordem das cenas | `src/timeline.json` (em quadros, 30 por segundo) |
| Uma cena específica | `src/cenas/*.tsx` |
| Cores e fontes | `src/tema.ts` — tokens idênticos aos da página |
| Música e efeitos | `scripts/gerar-audio.mjs` |

Para trocar só o gancho, há três variações prontas em `variacoes/`:

```bash
npx remotion render Reels out/gancho-b.mp4 --props=variacoes/gancho-b.json
```

Ligue `guias: true` no Studio para ver o que a interface do Reels cobre
(topo, legenda e coluna de botões). Todo texto importante fica fora dessas áreas.

## Som

Nada é sample: a trilha (120 bpm, lá menor) e os efeitos são sintetizados pelo
script, com semente fixa — rodar de novo gera os mesmos arquivos. A trilha é
montada sobre a linha do tempo do vídeo: groove leve, **tape stop** no quadro do
erro, drone de tensão, subida, **drop** no quadro 300 e golpe final em 0:32.
Cada efeito é posicionado dentro da própria cena, ao lado da animação que ele
acompanha.

Para usar uma música do próprio Instagram (ajuda o alcance), exporte com
`npm run render:sem-trilha`: os efeitos continuam sincronizados.

## Estrutura

```
src/
  roteiro.ts        textos e dados (esquema zod → editável no Studio)
  timeline.json     quadros de cada cena, lido também pelo gerador de áudio
  tema.ts           tokens, fontes e curvas de animação
  Video.tsx         monta as cenas, o campo de fundo, grão, vinheta e trilha
  cenas/            Gancho, Custo, Virada, Revelacao, Demo, Compat, Beneficios, Oferta
  componentes/      Terminal, CampoDeFluxo, Infinito, Cut, Glitch, Som, Ui…
scripts/
  gerar-audio.mjs   síntese da trilha e dos efeitos
variacoes/          JSONs de gancho alternativo para teste A/B
entrega/            MP4 final (com e sem trilha) e a capa, prontos para subir
```

## Antes de publicar

Os números vêm da página e são exemplos de layout lá também (lote, chaves
restantes, 0,00 % de erro 429, garantia). Confira a lista em
[ROTEIRO.md](ROTEIRO.md#antes-de-publicar--confira).
