import {loadFont} from '@remotion/fonts';
import bricolage from '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2';
import instrument from '@fontsource-variable/instrument-sans/files/instrument-sans-latin-standard-normal.woff2';
import spline from '@fontsource-variable/spline-sans-mono/files/spline-sans-mono-latin-wght-normal.woff2';

// As três famílias da página, empacotadas localmente: o render não depende de
// rede e não existe quadro com fonte de fallback. loadFont segura o render
// (delayRender) até cada arquivo estar carregado.
export const fontesProntas = Promise.all([
	loadFont({
		family: 'Bricolage Grotesque',
		url: bricolage,
		weight: '200 800',
		stretch: '75% 100%',
	}),
	loadFont({
		family: 'Instrument Sans',
		url: instrument,
		weight: '400 700',
		stretch: '75% 100%',
	}),
	loadFont({
		family: 'Spline Sans Mono',
		url: spline,
		weight: '300 700',
	}),
]);
