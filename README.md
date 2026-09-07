# Página de vendas — acesso ilimitado a API

Página única, sem build: abra `index.html` no navegador ou sirva a pasta em
qualquer host estático (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3).

## Stack

- HTML único, sem dependência de build
- Tailwind via CDN (`cdn.tailwindcss.com`) com tema estendido no próprio arquivo
- Archivo · IBM Plex Sans · IBM Plex Mono (Google Fonts)
- Sem bibliotecas de JS: gráfico de vazão, fundo animado, contadores,
  acordeão e alternância de ciclo são código próprio (~250 linhas)

> A página depende do CDN do Tailwind em tempo de execução. Se o CDN estiver
> bloqueado na rede do visitante, o layout cai. Para eliminar isso, gere um
> CSS compilado do Tailwind e troque a tag `<script src="https://cdn.tailwindcss.com">`
> por um `<link rel="stylesheet">`.

## O que trocar antes de publicar

Procure estas marcações dentro de `index.html`:

| Marcação | O que é |
|---|---|
| `[MARCA]` | Nome, símbolo e domínio da empresa |
| `[NUMERO]` | Prova social, vagas do lote, contadores |
| `[PRECO]` | Valores dos planos (mensal e anual) |
| `[CTA]` | Links de checkout / WhatsApp — hoje apontam para `#planos` e `#espera` |
| `[ENDPOINT]` | `api.unbound.ai` → seu endpoint real |
| `[PRAZO]` | Data de encerramento do lote, na constante `LOTE_FECHA` |

## Revise antes de ir ao ar

Os números de uso, uptime, latência, quantidade de chaves por lote, preços,
nomes de clientes e a política de dados no FAQ são **exemplos de layout**.
Substitua por dados reais — ou remova a afirmação.

O aviso de não-afiliação no rodapé deixa explícito que o serviço provisiona
acesso e não representa os detentores das marcas dos modelos. Vale manter.

## Formulário da lista de espera

Sem backend, o envio abre o cliente de e-mail do visitante. Para capturar de
verdade, troque o handler do `#waitForm` por um `fetch()` para o seu endpoint
(RD Station, Brevo, Formspree, etc.).
