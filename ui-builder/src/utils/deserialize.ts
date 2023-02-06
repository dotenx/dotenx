import _ from 'lodash'
import { uuid } from '.'
import { mapStyleToCamelCaseStyle } from '../api/mapper'
import { ACTIONS } from '../features/actions'
import { Action, AnimationAction } from '../features/actions/action'
import { Easing } from '../features/animations/options'
import { Animation } from '../features/animations/schema'
import { CONTROLLERS } from '../features/controllers'
import { Controller } from '../features/controllers/controller'
import { ECOMMERCE_COMPONENTS } from '../features/ecommerce'
import { ELEMENTS } from '../features/elements'
import { Element } from '../features/elements/element'
import { ImageElement } from '../features/elements/extensions/image'
import { LinkElement } from '../features/elements/extensions/link'
import { TextElement } from '../features/elements/extensions/text'
import { Expression } from '../features/states/expression'
import { SerializedAnimation } from './serialize'

export function deserializeElement(serialized: any): Element {
	const Constructor = ELEMENTS.find((Element) => {
		const instance = new Element()
		return instance.name === serialized.kind
	})
	if (!Constructor) throw new Error(`Element ${serialized.kind} not found`)
	const element = new Constructor()
	element.id = serialized.id ? serialized.id : element.id
	element.style = serialized.data?.style ? mapStyleToCamelCaseStyle(serialized.data?.style) : {}
	element.children =
		serialized.components?.map((child: any) => deserializeElement(child)) ?? element.children
	element.classes = serialized.classNames ?? []
	element.repeatFrom = serialized.repeatFrom ?? null
	element.events =
		serialized.events?.map((event: any) => ({
			...event,
			actions: event.actions.map(deserializeAction),
		})) ?? []
	element.bindings = serialized.bindings ?? {}
	element.controller = serialized.controller ? deserializeController(serialized.controller) : null
	element.data = serialized.data ?? {}
	element.tagId = serialized.tagId
	if (element instanceof ImageElement) {
		const src = serialized.data?.src ?? ''
		element.data.src = _.isString(src)
			? Expression.fromString(src)
			: _.assign(new Expression(), src)
	}
	if (element instanceof TextElement) {
		const text = serialized.data?.text ?? ''
		element.data.text = _.isString(text)
			? Expression.fromString(text)
			: _.assign(new Expression(), text)
	}
	if (element instanceof LinkElement) {
		const href = serialized.data?.href ?? ''
		element.data.href = _.isString(href)
			? Expression.fromString(href)
			: _.assign(new Expression(), href)
	}
	element.elementId = serialized.elementId
	element.script = serialized.script
	return element
}

function deserializeController(data: any): Controller {
	const Constructor = [...CONTROLLERS, ...ECOMMERCE_COMPONENTS]
		.flatMap((controller) => controller.items)
		.find((controller) => new (controller as any)().name === data.name)
	if (!Constructor) throw new Error(`Controller ${data.name} not found`)
	const controller = new (Constructor as any)()
	controller.data = data.data
	return controller
}

export function deserializeAction(data: any) {
	if (data.kind === 'Animation') {
		const animation = new AnimationAction(data.animationName)
		animation.target = data.target
		return animation
	}
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
						isState: !!value && mode !== 'text',
						value: value ? (mode === 'text' ? value : `$store.${mode}.${value}`) : '',
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

export function deserializeAnimation(data: SerializedAnimation): Animation {
	const { delay, duration, direction, stagger, loop, easing, ...cssProperties } = data.options
	const easingFn = easing === 'linear' ? 'linear' : (easing.split('(')[0] as Easing)
	const easingParams =
		easing === 'linear'
			? []
			: easing
					.split('(')[1]
					.split(')')[0]
					.split(',')
					.map((param) => +param)

	return {
		id: data.id,
		name: data.name,
		delay,
		duration,
		direction,
		stagger,
		loop,
		easing: easingFn,
		easingParams,
		properties: _.toPairs(cssProperties).map(([key, value]) => ({
			id: uuid(),
			name: key,
			keyframes: value,
		})),
	}
}
