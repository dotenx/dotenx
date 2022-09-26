import { Cta } from './cta'
import { Hero } from './hero'

export const controllers = [
	{ title: 'Base', items: [Hero] },
	{ title: 'Others', items: [Cta] },
] as const
