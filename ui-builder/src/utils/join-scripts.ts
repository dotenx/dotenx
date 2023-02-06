import { Element } from '../features/elements/element'

export function joinScripts(elements: Element[]): string {
	if (elements.length === 0) {
		return ''
	}

	return elements
		.map((element) => joinScripts(element.children ?? []) + '\n' + (element.script ?? ''))
		.join('\n')
}
