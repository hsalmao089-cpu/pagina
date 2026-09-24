import {z} from 'zod';

/* ==========================================================================
   ROTEIRO EM DADOS
   Todo texto que aparece na tela mora aqui. Edite pelo painel direito do
   Remotion Studio (`npm run dev`) ou passe um JSON com --props no render.
   O roteiro completo, com locução e legenda do post, está em ROTEIRO.md.
   ========================================================================== */

const linhas = z.array(z.string());

export const esquema = z.object({
	marca: z.string(),
	/** [ENDPOINT] da página. */
	endpoint: z.string(),
	/** Chave mascarada exibida no terminal. */
	chave: z.string(),

	gancho: z.object({
		antes: linhas,
		depois: linhas,
		pasta: z.string(),
		pedido: z.string(),
		passos: linhas,
		erro: z.string(),
		volta: z.string(),
	}),
	custo: z.object({
		secao: z.string(),
		golpes: z.array(z.object({palavra: z.string(), codigo: z.string()})),
		rotulo: z.string(),
		prazo: linhas,
	}),
	virada: z.object({linhas}),
	revelacao: z.object({
		apresenta: z.string(),
		titulo: linhas,
		sub: z.string(),
	}),
	demo: z.object({
		secao: z.string(),
		titulo: linhas,
		pedido: z.string(),
		saida: linhas,
		fim: z.string(),
	}),
	compat: z.object({
		secao: z.string(),
		titulo: linhas,
		ferramentas: z.array(linhas),
		fecho: z.string(),
	}),
	beneficios: z.object({
		secao: z.string(),
		titulo: linhas,
		itens: z.array(
			z.object({rotulo: z.string(), valor: z.string(), nota: z.string()}),
		),
	}),
	oferta: z.object({
		lote: z.string(),
		restantes: z.number().int().min(0),
		total: z.number().int().min(1),
		titulo: linhas,
		cta: z.string(),
		ctaSub: z.string(),
		garantia: z.string(),
		aviso: z.string(),
	}),

	/** Volume da trilha (0 = sem música, para usar um áudio do próprio Instagram). */
	trilha: z.number().min(0).max(1),
	/** Volume dos efeitos sonoros (teclas, impactos, glitch). */
	efeitos: z.number().min(0).max(1),
	/** Mostra as áreas cobertas pela interface do Reels. Só para conferência. */
	guias: z.boolean(),
});

export type Roteiro = z.infer<typeof esquema>;

export const roteiroPadrao: Roteiro = {
	marca: 'UNBOUND',
	endpoint: 'api.unbound.ai',
	chave: 'sk-unb-••••7f2a',

	gancho: {
		antes: ['Claude Code', 'a todo vapor…'],
		depois: ['…até bater', 'no limite.'],
		pasta: '~/loja-api',
		pedido: 'refatore o checkout e rode os testes',
		passos: ['Lendo 48 arquivos', 'Editando checkout/pagamento.ts', 'Rodando 212 testes'],
		erro: 'Limite de uso atingido.',
		volta: 'Seu acesso volta em 4h 59min.',
	},
	custo: {
		secao: 'o custo do limite',
		golpes: [
			{palavra: 'Cota.', codigo: '402 quota_exceeded'},
			{palavra: 'Fila.', codigo: '529 overloaded_error'},
			{palavra: '429.', codigo: '429 too_many_requests'},
		],
		rotulo: 'o limite volta em',
		prazo: ['O seu prazo,', 'não.'],
	},
	virada: {linhas: ['E se o limite', 'não existisse?']},
	revelacao: {
		apresenta: 'apresenta',
		titulo: ['Claude Code', 'ilimitado.'],
		sub: 'API com uso ilimitado. Sem rate limit, sem cota de tokens, sem fila.',
	},
	demo: {
		secao: 'configuração',
		titulo: ['Troque 2 linhas.', 'Pronto.'],
		pedido: 'crie a API de pedidos com testes',
		saida: ['6 agentes em paralelo', '128 arquivos editados', '212 testes passando'],
		fim: 'pronto · 0 limites atingidos',
	},
	compat: {
		secao: 'onde funciona',
		titulo: ['Qualquer CLI.', 'Qualquer IDE.'],
		ferramentas: [
			['Claude Code', 'OpenCode', 'Aider', 'Codex CLI', 'Goose', 'Crush'],
			['VS Code', 'Cursor', 'JetBrains', 'Zed', 'Neovim', 'Emacs'],
			['Cline', 'Roo Code', 'Kilo Code', 'Continue', 'Avante'],
		],
		fecho: 'Uma chave. Todas as ferramentas.',
	},
	beneficios: {
		secao: 'o que vem com a chave',
		titulo: ['Use sem', 'contar.'],
		itens: [
			{rotulo: 'Rate limit', valor: '—', nota: 'não existe'},
			{rotulo: 'Cota de tokens', valor: '—', nota: 'não existe'},
			{rotulo: 'Fila', valor: '0', nota: 'nenhuma'},
			{rotulo: 'Erros 429', valor: '0,00 %', nota: 'últimos 30 dias'},
			{rotulo: 'Preço', valor: 'fixo', nota: 'por mês'},
		],
	},
	oferta: {
		lote: 'Lote 07 aberto',
		restantes: 46,
		total: 150,
		titulo: ['O acesso é limitado.', 'O uso, nunca.'],
		cta: 'Garanta sua chave',
		ctaSub: 'link na bio',
		garantia: '7 dias de garantia incondicional',
		aviso:
			'Serviço independente de provisionamento de acesso. Claude e Claude Code são marcas da Anthropic, citadas apenas para identificar o que é oferecido.',
	},

	trilha: 1,
	efeitos: 1,
	guias: false,
};
