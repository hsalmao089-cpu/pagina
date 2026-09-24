import React from 'react';
import {Composition} from 'remotion';
import './fontes';
import {esquema, roteiroPadrao} from './roteiro';
import {ALTURA, DURACAO, FPS, LARGURA} from './tema';
import {Video} from './Video';

export const Root: React.FC = () => (
	<Composition
		id="Reels"
		component={Video}
		durationInFrames={DURACAO}
		fps={FPS}
		width={LARGURA}
		height={ALTURA}
		schema={esquema}
		defaultProps={roteiroPadrao}
	/>
);
