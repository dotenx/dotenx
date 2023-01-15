export const PROPERTIES = [
	'translateX',
	'translateY',
	'scale',
	'scaleX',
	'scaleY',
	'rotate',
	'rotateX',
	'rotateY',
	'skew',
	'skewX',
	'skewY',
	'opacity',
	'backgroundColor',
	'borderColor',
	'borderWidth',
	'borderRadius',
	'color',
	'height',
	'width',
	'padding',
	'margin',
	'fontSize',
	'letterSpacing',
	'lineHeight',
	'textShadow',
	'boxShadow',
]

export const DIRECTIONS = ['normal', 'reverse', 'alternate'] as const

export const EASINGS = ['linear', 'spring', 'cubicBezier', 'steps'] as const

export const EASING_PARAMS = {
	linear: [],
	spring: [1, 80, 10, 0],
	cubicBezier: [0.5, 0.05, 0.1, 0.3],
	steps: [5],
}

export type Easing = (typeof EASINGS)[number]
