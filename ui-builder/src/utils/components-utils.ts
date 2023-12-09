import { produce } from 'immer'
import { COMPONENTS } from '../features/components'
import { Element } from '../features/elements/element'

export function removeComponents(elements: Element[]) {
	return elements.map((element) => ({
		...element,
		controller: element.controller ? { name: element.controller.constructor.name } : undefined,
	}))
}

export function addComponents(elements: Element[]): Element[] {
	return produce(elements, (draft) => {
		for (const element of draft) {
			if (element.controller) {
				const Component = COMPONENTS.flatMap((section) => section.items).find(
					(c) => c.name === element.controller?.name
				)
				if (Component) element.controller = new (Component as any)()
			}
		}
	})
}
