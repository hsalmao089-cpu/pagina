# Página de vendas — acesso ilimitado a API

Página única, sem build: abra `index.html` no navegador ou sirva a pasta em
qualquer host estático (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3).

## Direção visual

Folha de especificação, não landing page. A venda é de infraestrutura, então a
página se apresenta como documento técnico: seções numeradas `§00`–`§10`, grade
de 12 colunas com as guias visíveis, tabelas no lugar de cards decorativos.

- **Cor** — papel `#F7F7F6`, tinta `#131315`, fios `#E3E3E0`. Nenhum tom
  decorativo. Cor só carrega significado: `#1F6B4C` disponível, `#9C3B2C`
  encerrado. O único gesto forte da página é a chapa preta.
- **Tipo** — Schibsted Grotesk (texto e display) e Spline Sans Mono (dados,
  rótulos, código).
- **Grade** — trilho de 1280px em 12 colunas. As guias aparecem onde a página
  quer parecer documento; o índice fixo vive na margem esquerda.

## Stack

- HTML único, sem etapa de build
- **Tailwind compilado e embutido no arquivo** — nenhum script externo
- Sem bibliotecas de JS: índice que acompanha a leitura, painel que troca
  conforme o passo entra em tela, contadores, acordeão nativo `<details>`,
  contagem regressiva e alternância de ciclo são código próprio

O único recurso externo é a fonte (Google Fonts), e ela tem pilha de fallback.
A página renderiza corretamente mesmo sem rede.

### Por que o CSS está embutido

Antes o arquivo carregava `<script src="https://cdn.tailwindcss.com">`. Esse
Play CDN monta o CSS em tempo de execução por avaliação dinâmica — o que falha
sob política de segurança restritiva (`Content-Security-Policy` sem
`unsafe-eval`) e derruba **a página inteira** quando o CDN não carrega: sem
Preflight, links voltam a ficar azuis sublinhados, listas ganham marcadores e
nenhuma classe utilitária aplica.

### Como regerar o CSS

Só é necessário se você **adicionar ou trocar classes utilitárias do Tailwind**
no HTML. Editar texto, cores dos tokens em `:root` ou o CSS próprio não exige
nada disso.

```bash
npx tailwindcss@3 -i entrada.css -o saida.css --content index.html --minify
```

com `entrada.css` contendo `@tailwind base; @tailwind components; @tailwind utilities;`
e o tema estendido em `tailwind.config.js` (as cores estão listadas no topo do
`index.html`). Depois, substitua o conteúdo do `<style>` marcado como
`TAILWIND COMPILADO`.

## O que trocar antes de publicar

| Marcação | O que é |
|---|---|
| `[MARCA]` | Nome, símbolo e domínio da empresa |
| `[NUMERO]` | Prova social, vagas do lote, contadores |
| `[PRECO]` | Valores dos planos (mensal e anual) |
| `[CTA]` | Links de checkout / contato |
| `[ENDPOINT]` | `api.unbound.ai` → seu endpoint real |
| `[PRAZO]` | Encerramento do lote, na constante `LOTE_FECHA` |

## Revise antes de ir ao ar

Uso, uptime, latência, quantidade de chaves por lote, preços, nomes de clientes
e a política de dados no FAQ são **exemplos de layout**. Substitua por dados
reais — ou remova a afirmação.

O aviso de não-afiliação no rodapé deixa explícito que o serviço provisiona
acesso e não representa os detentores das marcas dos modelos. Vale manter.

## Formulário da lista de espera

Sem backend, o envio abre o cliente de e-mail do visitante. Para capturar de
verdade, troque o handler do `#waitForm` por um `fetch()` para o seu endpoint.

## Versão anterior

A primeira direção (dark, roxo e azul elétrico, cards com brilho) está no
histórico do git, no commit anterior a esta reescrita.
