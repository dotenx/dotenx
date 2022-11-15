import _ from 'lodash'
import { mapStyleToCamelCaseStyle } from '../api/mapper'
import { ACTIONS } from '../features/actions'
import { Action } from '../features/actions/action'
import { controllers } from '../features/controllers'
import { Controller } from '../features/controllers/controller'
import { ELEMENTS } from '../features/elements'
import { Element } from '../features/elements/element'
import { ImageElement } from '../features/elements/extensions/image'
import { LinkElement } from '../features/elements/extensions/link'
import { TextElement } from '../features/elements/extensions/text'
import { Expression } from '../features/states/expression'

export function deserializeElement(serialized: any): Element {
	const Constructor = ELEMENTS.find((Element) => {
		const instance = new Element()
		return instance.name === serialized.kind
	})
	if (!Constructor) throw new Error(`Element ${serialized.kind} not found`)
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
	if (element instanceof ImageElement) {
		const src = serialized.data.src
		element.data.src = _.isString(src)
			? Expression.fromString(serialized.data.src)
			: _.assign(new Expression(), src)
	}
	if (element instanceof TextElement) {
		const text = serialized.data.text
		element.data.text = _.isString(text)
			? Expression.fromString(serialized.data.text)
			: _.assign(new Expression(), text)
	}
	if (element instanceof LinkElement) {
		const href = serialized.data.href
		element.data.href = _.isString(href)
			? Expression.fromString(serialized.data.href)
			: _.assign(new Expression(), href)
	}
	element.elementId = serialized.elementId
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

export function deserializeAction(data: any) {
	const Constructor = ACTIONS.find((action) => new action().name === data.kind)
	if (!Constructor) throw new Error(`Action ${data.name} not found`)
	const action = new Constructor() as Action
	const deserialized = _.fromPairs(
		_.map(_.omit(data, 'kind'), (data, key) => {
			if (_.isObject(data) && 'value' in data && 'isState' in data && 'mode' in data) {
				const { value, mode } = data as any
				return [
					key,
					{
						...data,
						isState: !!value,
						value: value ? `$store.${mode}.${value}` : '',
					},
				]
			}
			return [key, data]
		})
	)
	_.assign(action, deserialized)
	return action
}

export function deserializeExpression(data: any): Expression {
	return _.assign(new Expression(), data)
}
