# open33 — página de vendas

Página única de vendas de acesso ao Claude Opus 5 por API, com plano mensal
em reais. Não precisa de build nem de biblioteca de JavaScript: abra
`index.html` no navegador ou publique a pasta em qualquer host estático
(Vercel, Netlify, Cloudflare Pages, GitHub Pages).

Visual em preto, azul e azul bebê.

## O que tem na página

- **Hero em 3D**: título com uma palavra que gira em 3D (app, SaaS, agente,
  chatbot, produto). O globo é desenhado em canvas e gira com o mouse ou o dedo,
  com inércia. Há também cartões de vidro flutuando com paralaxe e um piso em
  grade com perspectiva.
- **Números** que sobem quando aparecem na tela: 1.000.000 tokens de contexto,
  128.000 por resposta, 2 linhas para migrar e 100% em reais.
- **Recursos** em grade bento. Os cartões inclinam em 3D e as camadas internas
  saltam para a frente quando o mouse passa. Tem também uma moeda 3D feita em CSS.
- **Especial para devs**: passo a passo, uma janela de código em 3D com abas de
  Python, TypeScript, cURL e `.env`, e oito blocos com recursos para
  desenvolvedores.
- **Claude Opus 5** em destaque, com as especificações do modelo e o ID pronto
  para copiar.
- **Dólar x open33**: comparação lado a lado, logo antes dos preços.
- **Planos mensais** (Start, Pro e Ultra). Cada plano mostra o preço por dia,
  calculado sozinho a partir do valor mensal, e o selo de 7 dias de garantia.
  Depois vêm a tabela comparativa, o bloco de garantia e a faixa para empresas.
- **Perguntas frequentes** e uma chamada final com um giroscópio 3D.
- **Conversão**: botões principais "magnéticos", uma luz que segue o cursor e
  uma barra fixa de assinatura no celular. A barra aparece depois do topo e some
  perto dos planos.
- Menu no celular, barra de progresso de leitura, botão flutuante de WhatsApp
  (aparece quando o número está configurado) e suporte à preferência de
  "reduzir movimento" do sistema.

## Configuração

No fim do `index.html` fica o objeto `CONFIG`:

| Campo | O que é |
|---|---|
| `endpoint` | Base URL da sua API. Aparece em todos os exemplos de código. |
| `whatsapp` | Número só com dígitos, com DDI e DDD. Se ficar vazio, os botões abrem o e-mail. |
| `email` | E-mail de contato. |
| `checkout.start` / `pro` / `ultra` | Links de assinatura dos planos. Se ficarem vazios, os botões abrem o WhatsApp ou o e-mail com a mensagem já escrita. |

## Revise antes de publicar

- **Preços**: R$ 97, R$ 197 e R$ 497 por mês são exemplos. Ajuste nos cartões
  de plano, na tabela comparativa, nas mensagens `data-msg` dos botões e no
  texto "a partir de R$ 97/mês" do topo e da barra fixa. O preço por dia se
  recalcula sozinho.
- **Garantia de 7 dias**: aparece no topo, nos planos, na tabela, no FAQ e na
  chamada final. Corresponde ao direito de arrependimento do Código de Defesa
  do Consumidor para compras online. Confirme que vai oferecer.
- **Limites dos planos**: "padrão", "ampliados" e "os maiores" são descrições
  genéricas. Se tiver números (requisições por minuto, tokens por mês),
  coloque nos cartões.
- **Afirmações sobre o serviço**: Pix e cartão, painel de consumo, chaves por
  projeto, suporte no WhatsApp, recursos da API (streaming, tool use, JSON
  estruturado, cache de prompt), erro 429 ao atingir o limite e faturamento com
  nota fiscal. Deixe só o que você realmente entrega.
- **Ilustrações**: os cartões "POST /v1/messages" e "Plano Pro ativo", o
  medidor de uso, o gráfico de consumo e a barra de contexto mostram a
  interface. Não são dados reais.
- **Links do rodapé**: "Termos de uso" e "Política de privacidade" ainda
  apontam para `#`.
- **Limites**: a página informa que cada plano tem limites de uso, inclusive o
  Ultra ("nosso maior limite de uso"). Toda conta da API da Anthropic tem rate
  limit, então não chame nenhum plano de ilimitado ou "Unlimited".
- **Marca**: mantenha o aviso de que a open33 não é afiliada à Anthropic. Ele
  aparece no rodapé e na primeira pergunta do FAQ. Não use o logotipo nem a
  identidade visual da Anthropic.

## Notas técnicas

- **Globo**: esfera de Fibonacci com 860 pontos (480 no celular), projetada em
  perspectiva. O desenho é feito em duas passadas, com um corpo translúcido
  entre elas: primeiro a metade de trás, depois a da frente. Isso dá
  profundidade real ao globo. Ele pausa quando sai da tela ou quando a aba fica
  oculta.
- **Inclinação 3D**: variáveis CSS `--rx` e `--ry` atualizadas a cada quadro.
  Só funciona em dispositivos com mouse.
- **Animação ao rolar**: a revelação usa a propriedade `translate`, para não
  conflitar com o `transform` da inclinação.
- **Economia de bateria**: animações de seções fora da tela ficam pausadas, e o
  piso anima só com `transform`, que é composto pela GPU.
- **Recursos externos**: só as fontes do Google (Space Grotesk, Inter e
  JetBrains Mono), com fonte do sistema como alternativa.

## Histórico

As versões anteriores (UNBOUND e Órbita) continuam no histórico do git.
