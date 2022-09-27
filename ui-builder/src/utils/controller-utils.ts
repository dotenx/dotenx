import { Component } from '../features/canvas-store'
import { controllers } from '../features/controllers'

const allControllers = controllers.flatMap((section) => section.items)

export function removeControllers(components: Component[]) {
	return components.map((component) => ({
		...component,
		controller: component.controller
			? { name: component.controller.constructor.name }
			: undefined,
	}))
}

export function addControllers(components: Component[]): Component[] {
	return components.map((component) => {
		const Controller = allControllers.find(
			(controller) => controller.name === component.controller?.name
		)

		return {
			...component,
			controller: Controller ? new Controller() : undefined,
		}
	})
}
