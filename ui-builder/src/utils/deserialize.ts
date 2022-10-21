import _ from 'lodash'
import { mapStyleToCamelCaseStyle } from '../api/mapper'
import { controllers } from '../features/controllers'
import { Controller } from '../features/controllers/controller'
import { ELEMENTS } from '../features/elements'
import { Action, actions } from '../features/elements/action'
import { Element } from '../features/elements/element'
import { IntelinputValueKind } from '../features/ui/intelinput'

export function deserializeElement(serialized: any): Element {
	const Constructor = ELEMENTS.find((Element) => {
		const instance = new Element()
		return instance.name === serialized.kind
	})
	if (!Constructor) throw new Error(`Element ${name} not found`)
	const element = new Constructor()
	element.id = serialized.id
	element.style = mapStyleToCamelCaseStyle(serialized.data.style)
	element.children = serialized.components?.map((child: any) => deserializeElement(child))
	element.classes = serialized.classNames
	element.repeatFrom = serialized.repeatFrom
	element.events = serialized.events.map((event: any) => ({
		...event,
		actions: event.actions.map(deserializeAction),
	}))
	element.bindings = serialized.bindings
	element.controller = serialized.controller ? deserializeController(serialized.controller) : null
	element.data = serialized.data
	return element
}

function deserializeController(data: any): Controller {
	const Constructor = controllers
		.flatMap((controller) => controller.items)
		.find((controller) => new controller().name === data.name)
	if (!Constructor) throw new Error(`Controller ${data.name} not found`)
	const controller = new Constructor()
	controller.data = data.data
	return controller
}

function deserializeAction(data: any) {
	const Constructor = actions.find((action) => new action().name === data.kind)
	if (!Constructor) throw new Error(`Action ${data.name} not found`)
	const action = new Constructor() as Action
	const deserialized = _.omit(data, 'kind')
	_.assign(action, deserialized)
	return action
}
