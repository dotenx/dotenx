import { immerable } from 'immer'
import _ from 'lodash'
import { CSSProperties, ReactNode } from 'react'
import { mapCustomStyleToKebabCaseStyle, mapStyleToKebabCaseStyle } from '../../api/mapper'
import { uuid } from '../../utils'
import { Animation } from '../animations/schema'
import { Component } from '../components/component'
import { Expression } from '../states/expression'
import { ElementEvent } from './event'
import { CustomStyle, Style } from './style'

export type RenderFn = (element: Element) => ReactNode

export type RenderFnOptions = {
	isSimple?: boolean
}

export abstract class Element {
	[immerable] = true

	abstract readonly name: string
	abstract readonly icon: ReactNode
	abstract render(renderFn: RenderFn, options?: RenderFnOptions): ReactNode
	abstract renderOptions(options: RenderOptions): ReactNode
	id: string = uuid()
	style: Style = {}
	customStyle: CustomStyle = {}
	classes: string[] = []
	events: ElementEvent[] = []
	bindings: Bindings = {}
	children: Element[] | null = null
	repeatFrom: RepeatFrom | null = null
	controller: Component | null = null
	data?: Record<string, unknown>
	elementId?: string
	tagId?: string
	hidden?: boolean
	script?: string
	animation?: {
		data: Animation
		event: 'onVisible' | 'onHover'
	}
	unlocked?: boolean
	internal: Record<string, unknown> = {} // This property should be only for internal use, such as some options in simple mode. It should not be rendered.
	imports: string[] = []
	rawStyle = ''

	unlock() {
		this.unlocked = true
		return this
	}

	isContainer() {
		return !(this.children === null || this.children === undefined)
	}

	hasChildren() {
		return this.children && this.children.length > 0
	}

	serialize(): any {
		return {
			kind: this.name,
			id: this.id,
			components: this.children?.map((child) => child.serialize()),
			classNames: this.classes,
			repeatFrom: this.repeatFrom,
			events: this.events.map((event) => ({
				...event,
				actions: event.actions.map((action) => action.serialize()),
			})),
			bindings: this.bindings,
			controller: this.controller?.serialize(),
			data: {
				...this.data,
				style: mapStyleToKebabCaseStyle(this.style),
				customStyle: mapCustomStyleToKebabCaseStyle(this.customStyle),
			},
			elementId: this.elementId,
			tagId: this.tagId,
			script: this.script,
			animation: this.animation,
			unlocked: this.unlocked,
			internal: this.internal,
			imports: this.imports,
			rawStyle: this.rawStyle,
		}
	}

	generateClasses() {
		return `${this.classes.join(' ')} ${this.id}`.trim()
	}

	renderPreview(renderFn: RenderFn, style: CSSProperties = {}) {
		return (
			<div style={style} className={this.generateClasses()} id={this.elementId}>
				{this.render(renderFn, { isSimple: false })}
			</div>
		)
	}

	onDelete() {
		// noop
	}

	find<T extends Element = Element>(tagId: string): T | undefined {
		if (this.tagId === tagId) return this as Element as T
		if (this.children) {
			for (const child of this.children) {
				const found = child._findByTagIdRecursive(tagId)
				if (found) return found as T
			}
		}
		console.info(`Element with tagId ${tagId} not found`)
	}

	_findByTagIdRecursive(tagId: string): Element | undefined {
		if (this.tagId === tagId) return this

		if (this.children) {
			for (const child of this.children) {
				const found = child._findByTagIdRecursive(tagId)
				if (found) return found
			}
		}
	}

	findAll<T extends Element = Element>(tagId: string): T[] {
		const all: T[] = []
		if (this.tagId === tagId) all.push(this as Element as T)
		for (const child of this.children ?? []) {
			const founds = child.findAll(tagId) as T[]
			all.push(...founds)
		}
		return all
	}

	css(css: CSSProperties) {
		const merged = _.assign({}, this.style.desktop?.default, css)
		_.set(this.style, 'desktop.default', merged)
		return this
	}

	cssTablet(css: CSSProperties) {
		const merged = _.assign({}, this.style.tablet?.default, css)
		_.set(this.style, 'tablet.default', merged)
		return this
	}

	cssMobile(css: CSSProperties) {
		const merged = _.assign({}, this.style.mobile?.default, css)
		_.set(this.style, 'mobile.default', merged)
		return this
	}
	customCss(selector: string, css: CSSProperties) {
		const merged = _.assign({}, this.customStyle.desktop?.[selector], css)
		_.set(this.customStyle, `desktop.["${selector}"]`, merged)
		return this
	}

	customCssTablet(selector: string, css: CSSProperties) {
		const merged = _.assign({}, this.customStyle.tablet?.[selector], css)
		_.set(this.customStyle, `tablet.["${selector}"]`, merged)
		return this
	}

	customCssMobile(selector: string, css: CSSProperties) {
		const merged = _.assign({}, this.customStyle.mobile?.[selector], css)
		_.set(this.customStyle, `mobile.["${selector}"]`, merged)
		return this
	}

	cssHover(css: CSSProperties) {
		const merged = _.assign({}, this.style.desktop?.hover, css)
		_.set(this.style, 'desktop.hover', merged)
		return this
	}

	cssHoverTablet(css: CSSProperties) {
		const merged = _.assign({}, this.style.tablet?.hover, css)
		_.set(this.style, 'tablet.hover', merged)
		return this
	}

	tag(tagId: string) {
		this.tagId = tagId
		return this
	}

	populate(children: Element[]) {
		this.children = children
		return this
	}

	setScript(script: string) {
		this.script = script
		return this
	}

	unstyled() {
		this.style = {}
		return this
	}

	class(classes: string[] | string) {
		this.classes = [classes].flat()
		return this
	}

	as(type: string) {
		this.data = { ...this.data, as: type }
		return this
	}

	setImports(imports: string[]) {
		this.imports = imports
		return this
	}
}

export interface RenderOptions {
	set: Setter
}

export type Setter<T extends Element = Element> = (element: T) => void

type Bindings = Partial<Record<BindingKind, Binding | null>>

export interface Binding {
	fromStateName: string
	condition?: Condition
	value?: Expression
	class?: string
}

export enum BindingKind {
	Hide = 'hide',
	Show = 'show',
	Class = 'class',
}

export const bindingKinds = [BindingKind.Hide, BindingKind.Show, BindingKind.Class]

export interface RepeatFrom {
	name: string
	iterator: string
}

export enum Condition {
	Equals = 'equals',
	NotEquals = 'not equals',
	Contains = 'contains',
	NotContains = 'not contains',
}

export const CONDITIONS = [
	Condition.Equals,
	Condition.NotEquals,
	Condition.Contains,
	Condition.NotContains,
]
