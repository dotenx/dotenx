import { immerable } from 'immer'
import { ReactNode } from 'react'
import { mapStyleToKebabCaseStyle } from '../../api/mapper'
import { uuid } from '../../utils'
import { Controller } from '../controllers/controller'
import { ElementEvent } from './event'
import { Style } from './style'

export type RenderFn = (element: Element) => ReactNode

export abstract class Element {
	[immerable] = true

	abstract readonly name: string
	abstract readonly icon: ReactNode
	abstract render(renderFn: RenderFn): ReactNode
	abstract renderOptions(options: RenderOptions): ReactNode
	id: string = uuid()
	style: Style = {}
	classes: string[] = []
	events: ElementEvent[] = []
	bindings: Bindings = {}
	children: Element[] | null = null
	repeatFrom: RepeatFrom | null = null
	controller: Controller | null = null
	data?: Record<string, unknown>

	isContainer() {
		return this.children !== null
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
			events: this.events,
			bindings: this.bindings,
			controller: this.controller?.serialize(),
			data: { ...this.data, style: mapStyleToKebabCaseStyle(this.style) },
		}
	}

	generateClasses() {
		return `${this.classes.join(' ')} ${this.id}`
	}
}

export interface RenderOptions {
	set: Setter
}

export type Setter<T extends Element = Element> = (element: T) => void

type Bindings = Partial<Record<BindingKind, Binding | null>>

export interface Binding {
	fromStateName: string
}

export enum BindingKind {
	Text = 'text',
	Hide = 'hide',
	Show = 'show',
	Link = 'link',
}

export const bindingKinds = [BindingKind.Text, BindingKind.Hide, BindingKind.Show, BindingKind.Link]

export interface RepeatFrom {
	name: string
	iterator: string
}
