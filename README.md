# open33 — página de vendas

Página única de vendas de acesso ao Claude Opus 5 por API, com plano mensal
em reais. Não precisa de build nem de biblioteca de JavaScript: abra
`index.html` no navegador ou publique a pasta em qualquer host estático
(Vercel, Netlify, Cloudflare Pages, GitHub Pages).

Visual em preto, azul e azul bebê.

## O que tem na página

1. **Hero em 3D**: "Claude Opus 5 no Claude Code / Cursor / Antigravity / seu
   app. Pagando em reais.", com a ferramenta girando em 3D. O globo em canvas
   gira com o mouse ou com o dedo e continua girando por inércia. Também há
   cartões de vidro flutuando e um piso em grade.
2. **VSL de 1 minuto**: animação com 7 cenas e legendas. Começa sozinha e sem
   som quando aparece na tela, e pausa quando sai. Tem barra de progresso com
   arraste e teclado, tela final com "Ver planos" e transcrição. No celular
   fica em formato vertical 4:5. O roteiro está em
   [`vsl-roteiro.md`](vsl-roteiro.md).
3. **Números** animados: 1.000.000 tokens de contexto, 128.000 por resposta,
   2 linhas para migrar e 100% em reais.
4. **Por que a open33**: comparação lado a lado entre pagar em dólar e pagar
   pela open33.
5. **Especial para devs**: 3 passos e uma janela de código em 3D. As abas são
   Claude Code, Python, TypeScript e cURL. Por último, 6 blocos de recursos.
6. **Planos mensais** (Start, Pro e Ultra), com preço por dia calculado
   sozinho e 7 dias de garantia. Depois vêm os blocos de garantia e de
   empresas. No celular, os planos viram um carrossel de deslizar que abre no Pro.
7. **5 perguntas frequentes** e uma chamada final com giroscópio 3D.

Também tem uma barra fixa de assinatura no celular, botões "magnéticos", uma
luz que segue o cursor, menu no celular e o botão de WhatsApp, que aparece
quando o número está configurado. A página respeita a opção "reduzir
movimento" do sistema.

## Configuração

No fim do `index.html` fica o objeto `CONFIG`:

| Campo | O que é |
|---|---|
| `endpoint` | Base URL da API. Já está como `https://api.open33.tech` e aparece em todos os exemplos de código. |
| `whatsapp` | Número só com dígitos, com DDI e DDD. Se ficar vazio, os botões abrem o e-mail. |
| `email` | E-mail de contato. Ainda está com `contato@seudominio.com.br`. |
| `checkout.start` / `pro` / `ultra` | Links de assinatura dos planos. Se ficarem vazios, os botões abrem o WhatsApp ou o e-mail com a mensagem já escrita. |
| `video.youtube` / `video.mp4` | Vídeo gravado para substituir a animação da VSL: um link do YouTube (pode ser não listado) ou o caminho de um `.mp4`. Se ficarem vazios, a animação aparece. Veja [`vsl-roteiro.md`](vsl-roteiro.md). |

## Revise antes de publicar

- **Compatibilidade**: o topo, a VSL e o FAQ citam Claude Code, Cursor e
  Antigravity. O Claude Code aceita base URL própria (`ANTHROPIC_BASE_URL`).
  Mantenha o Cursor e o Antigravity só se você testou que a sua API funciona
  neles.
- **Preços**: R$ 97, R$ 197 e R$ 497 por mês são exemplos. Ajuste nos cartões
  de plano, nas mensagens `data-msg` dos botões e no texto "a partir de
  R$ 97/mês" do topo e da barra fixa. O preço por dia se recalcula sozinho.
- **Garantia de 7 dias**: corresponde ao direito de arrependimento do Código de
  Defesa do Consumidor para compras online. Confirme que vai oferecer.
- **Limites dos planos**: "padrão", "ampliados" e "nosso maior limite" são
  descrições genéricas. Se tiver números (requisições por minuto, tokens por
  mês), coloque nos cartões. Toda conta da API da Anthropic tem rate limit,
  então nenhum plano pode ser chamado de ilimitado ou "Unlimited".
- **Afirmações sobre o serviço**: Pix e cartão, painel de consumo, chaves por
  projeto, suporte no WhatsApp, streaming, tool use, cache de prompt e nota
  fiscal para empresas. Deixe só o que você realmente entrega.
- **Ilustrações**: os cartões "POST /v1/messages" e "Plano Pro ativo" mostram
  a interface. Não são dados reais. A fatura da VSL está marcada como
  "exemplo".
- **VSL**: repete as promessas da página (Pix, preço fixo sem IOF, suporte,
  garantia, Cursor e Antigravity). Se mudar algo na página, ajuste também as
  cenas e as legendas (lista `caps` na função `vsl()`). O preço é lido do
  plano Start automaticamente.
- **Links do rodapé**: "Termos de uso" e "Política de privacidade" ainda
  apontam para `#`.
- **Marca**: mantenha o aviso de não afiliação à Anthropic, no rodapé e na
  primeira pergunta do FAQ. Não use logotipos de terceiros.

## Notas técnicas

- **Globo**: esfera de Fibonacci com 860 pontos (480 no celular), projetada em
  perspectiva e desenhada em duas passadas, primeiro a metade de trás e depois
  a da frente, com um corpo translúcido entre elas. Pausa quando sai da tela.
- **VSL**: a linha do tempo roda em JavaScript (`requestAnimationFrame`). As
  animações de CSS de cada cena usam `animation-delay: calc(var(--d) -
  var(--seek))`, então pular para qualquer ponto mostra o quadro certo. Os
  tamanhos são em `cqw` (container queries), e a cena escala como um vídeo.
- **Revelação**: usa a propriedade `translate`, para não conflitar com o
  `transform` da inclinação 3D.
- **Economia de bateria**: animações de seções fora da tela ficam pausadas.
- **Recursos externos**: só as fontes do Google, com fonte do sistema como
  alternativa.

## Histórico

As versões anteriores (UNBOUND, Órbita e a primeira da open33) continuam no
histórico do git.
