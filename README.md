# Página de vendas — acesso ilimitado a API

Página única, sem build: abra `index.html` no navegador ou sirva a pasta em
qualquer host estático (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3).

## Direção visual

Preto de estúdio. A cor só aparece quando significa alguma coisa — verde para
disponível, vermelho para esgotado. Nenhum tom decorativo: o peso vem de
escala tipográfica, profundidade real e luz, não de néon nem de gradiente.

- **Cor** — breu `#060507`, osso `#F2EFE9`, fios `rgba(242,239,233,.09)`.
- **Tipo** — Bricolage Grotesque (display), Instrument Sans (texto),
  Spline Sans Mono (dados e código).
- **Arte** — campo de fluxo desenhado em canvas: partículas seguindo
  correntes, deixando rastro. É gerado na hora, sem nenhuma imagem externa.
  O campo é pré-composto antes do primeiro quadro, para quem chega ver a
  arte pronta em vez de um retângulo preto que se preenche depois.
- **Profundidade** — sombra difusa por baixo e um fio de luz de 1px na aresta
  de cima. É esse fio que faz a superfície parecer sólida.

## Stack

Nenhuma dependência. Sem framework CSS, sem biblioteca de JS, sem build.
O único recurso remoto é a fonte, com pilha de fallback — a página renderiza
corretamente mesmo sem rede.

Tudo é código próprio: campo de fluxo, gráfico de vazão, painel que troca
conforme o passo entra em tela, contadores, acordeão nativo `<details>`,
contagem regressiva e alternância de ciclo.

> Versões anteriores usavam Tailwind pelo CDN. Foi removido: o Play CDN monta
> o CSS em tempo de execução por avaliação dinâmica, o que falha sob política
> de segurança restritiva e derruba a página inteira. Agora não há esse risco.

## O que trocar antes de publicar

| Marcação | O que é |
|---|---|
| `[MARCA]` | Nome e domínio da empresa |
| `[NUMERO]` | Prova social, vagas do lote, contadores |
| `[PRECO]` | Valores dos planos (mensal e anual) |
| `[CTA]` | Links de checkout / contato |
| `[ENDPOINT]` | `api.unbound.ai` → seu endpoint real |
| `[PRAZO]` | Encerramento do lote, na constante `FECHA` |

## Revise antes de ir ao ar

Uso, uptime, latência, quantidade de chaves por lote, preços, nomes de
clientes e a política de dados no FAQ são **exemplos de layout**. Substitua
por dados reais — ou remova a afirmação.

O aviso de não-afiliação no rodapé deixa explícito que o serviço provisiona
acesso e não representa os detentores das marcas dos modelos. Vale manter.

## Vídeo para Instagram

`video/` tem um Reels de 33 s da oferta de Claude Code ilimitado, na mesma
direção visual desta página (tokens, fontes e o campo de fluxo). É um projeto
Remotion à parte, com `package.json` próprio — a página continua sem build.
Roteiro completo em `video/ROTEIRO.md`; o MP4 pronto e a capa ficam em
`video/entrega/`.

## Formulário da lista de espera

Sem backend, o envio abre o cliente de e-mail do visitante. Para capturar de
verdade, troque o handler do `#waitForm` por um `fetch()` para o seu endpoint.

## Histórico

Duas direções anteriores estão no histórico do git: uma dark com roxo e azul
elétrico, e uma neutra em papel e tinta.
