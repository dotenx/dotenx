import { Animation } from '../features/animations/schema'
import { Element } from '../features/elements/element'

export function joinScripts(elements: Element[]): string {
	if (elements.length === 0) {
		return ''
	}

	return elements
		.map((element) => joinScripts(element.children ?? []) + '\n' + (element.script ?? ''))
		.join('\n')
}

export function joinAnimations(elements: Element[]): Animation[] {
	if (elements.length === 0) {
		return []
	}

	return elements
		.map((element) =>
			joinAnimations(element.children ?? []).concat(element.animation?.data ?? [])
		)
		.flat()
		.map(addSpringParams)
}

const addSpringParams = (animation: Animation): Animation => {
	if (animation.easing === 'spring') return { ...animation, easingParams: [1, 100, 10, 0] }
	return animation
}

export function joinStyles(elements: Element[]): string {
	if (elements.length === 0) {
		return ''
	}

	return elements
		.map((element) => joinStyles(element.children ?? []) + '\n' + (element.style ?? ''))
		.join('\n')
}
