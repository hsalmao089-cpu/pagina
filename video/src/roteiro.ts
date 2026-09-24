import {z} from 'zod';

/* ==========================================================================
   ROTEIRO EM DADOS
   Todo texto que aparece na tela mora aqui. Edite pelo painel direito do
   Remotion Studio (`npm run dev`) ou passe um JSON com --props no render.
   O roteiro completo — ideia, locução, legenda do post — está em ROTEIRO.md.
   ========================================================================== */

const linhas = z.array(z.string());

export const esquema = z.object({
	marca: z.string(),
	/** [ENDPOINT] da página. */
	endpoint: z.string(),
	/** Chave mascarada exibida no terminal. */
	chave: z.string(),

	/** Ato 1 · a barra enche até acabar. */
	gancho: z.object({
		rotulo: z.string(),
		/** Porcentagem do primeiro quadro; sobe de 1 em 1 até 100. */
		inicio: z.number().int().min(80).max(99),
		carimbo: z.string(),
		pasta: z.string(),
		pedido: z.string(),
		passos: linhas,
		erro: z.string(),
		volta: z.string(),
	}),
	/** Ato 1 · as amarras: uma fita de interdição por dor. */
	amarras: z.object({
		fitas: linhas,
		titulo: linhas,
	}),
	/** Ato 1 · a soltura: duas linhas coladas no terminal soltam tudo. */
	soltura: z.object({
		titulo: linhas,
	}),
	/** Ato 2 · a barra vira ∞. As fitas voltam riscadas. */
	revelacao: z.object({
		titulo: linhas,
	}),
	agentes: z.object({
		titulo: linhas,
		tarefas: linhas,
	}),
	editores: z.object({
		titulo: linhas,
		nomes: linhas,
	}),
	confianca: z.object({
		titulo: linhas,
		cartoes: z.array(z.object({titulo: z.string(), sub: z.string()})),
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
	/** Volume dos efeitos sonoros. */
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
		rotulo: 'uso do seu plano',
		inicio: 94,
		carimbo: 'Acabou.',
		pasta: '~/loja-api',
		pedido: 'refatore o checkout e rode os testes',
		passos: ['Lendo 48 arquivos', 'Editando checkout/pagamento.ts', 'Rodando 212 testes'],
		erro: 'Limite de uso atingido.',
		volta: 'Seu acesso volta em',
	},
	amarras: {
		fitas: ['Limite de 5 horas', 'Limite semanal', 'Fatura em dólar'],
		titulo: ['Seu Claude Code,', 'amarrado.'],
	},
	soltura: {
		titulo: ['Duas linhas', 'soltam tudo.'],
	},
	revelacao: {
		titulo: ['Claude Code', 'sem limite.'],
	},
	agentes: {
		titulo: ['Rode quantos', 'agentes quiser.'],
		tarefas: ['testes', 'refactor', 'migração', 'docs', 'bug #481', 'frontend', 'revisão', 'infra', 'i18n'],
	},
	editores: {
		titulo: ['No terminal', 'ou na sua IDE.'],
		nomes: ['Claude Code', 'VS Code', 'Cursor', 'JetBrains', 'Zed', 'Neovim'],
	},
	confianca: {
		titulo: ['Do jeito que', 'devia ser.'],
		cartoes: [
			{titulo: 'Preço fixo', sub: 'em reais, todo mês'},
			{titulo: 'Ativa em minutos', sub: 'sem call, sem fila de aprovação'},
			{titulo: '7 dias de garantia', sub: 'não gostou, devolvemos tudo'},
		],
	},
	oferta: {
		lote: 'Lote 07',
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
