import produce from 'immer'
import { controllers } from '../features/controllers'
import { Element } from '../features/elements/element'

export function removeControllers(elements: Element[]) {
	return elements.map((element) => ({
		...element,
		controller: element.controller ? { name: element.controller.constructor.name } : undefined,
	}))
}

export function addControllers(elements: Element[]): Element[] {
	return produce(elements, (draft) => {
		for (const element of draft) {
			if (element.controller) {
				const Controller = controllers
					.flatMap((section) => section.items)
					.find((c) => c.name === element.controller?.name)
				if (Controller) element.controller = new Controller()
			}
		}
	})
}
