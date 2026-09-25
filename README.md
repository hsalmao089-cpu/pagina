# Órbita API — página de vendas

Página única de vendas de acesso à API do Claude, com pagamento em reais.
Não precisa de build nem de biblioteca de JavaScript: abra `index.html` no
navegador ou publique a pasta em qualquer host estático (Vercel, Netlify,
Cloudflare Pages, GitHub Pages).

"Órbita" é um nome provisório. Troque pela sua marca com buscar e substituir.

## O que tem na página

- **Hero em 3D**: globo desenhado em canvas (malha de pontos em perspectiva,
  anéis orbitais com pacotes de dados e arcos entre nós), cartões de vidro
  flutuando com paralaxe do mouse e piso em grade com perspectiva.
- **Recursos** em grade bento. Os cartões inclinam em 3D e as camadas internas
  saltam para a frente quando o mouse passa. Tem também uma moeda 3D feita em CSS.
- **Modelos Claude** com o ID de cada um pronto para copiar.
- **Como funciona**, com uma janela de código em 3D e abas de Python,
  TypeScript, cURL e `.env`.
- **Planos** de recarga com bônus, uma calculadora de recarga sob medida e uma
  faixa para empresas.
- **Perguntas frequentes** e uma chamada final com um giroscópio 3D.
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
| `checkout.start` / `pro` / `scale` | Links de pagamento dos planos. Se ficarem vazios, os botões abrem o WhatsApp ou o e-mail com a mensagem já escrita. |
| `checkout.custom` | Link da recarga sob medida. O trecho `{valor}` é trocado pelo valor escolhido. |
| `bonus` | Faixas de bônus que a calculadora usa, da maior para a menor. |

## Revise antes de publicar

- **Preços e bônus**: R$ 50, R$ 200 e R$ 1.000, com bônus de 5% e 10%, são
  exemplos. Ajuste nos cartões de plano e em `CONFIG.bonus`.
- **Afirmações sobre o serviço**: Pix e cartão, painel de consumo, chaves por
  projeto, limites por plano, suporte no WhatsApp, recursos da API (streaming,
  tool use, cache de prompt) e faturamento com nota fiscal. Deixe só o que você
  realmente entrega.
- **Modelos**: confira o catálogo com o seu fornecedor. Os IDs e as janelas de
  contexto seguem a documentação da Anthropic de setembro de 2026.
- **Ilustrações**: os cartões "POST /v1/messages" e "Recarga confirmada", o
  saldo e o gráfico de consumo mostram a interface. Não são dados reais.
- **Links do rodapé**: "Termos de uso" e "Política de privacidade" ainda
  apontam para `#`.
- **Limites**: a página informa que cada plano tem limite de requisições. Toda
  conta da API da Anthropic tem rate limit, então não prometa uso ilimitado.
- **Marca**: mantenha o aviso de que a Órbita não é afiliada à Anthropic. Ele
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

A versão anterior da página (UNBOUND) continua no histórico do git.
