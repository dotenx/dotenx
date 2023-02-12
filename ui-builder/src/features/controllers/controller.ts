import { ReactNode } from 'react'
import { regenElement } from '../clipboard/copy-paste'
import { Element } from '../elements/element'
import { BoxElement } from '../elements/extensions/box'

export abstract class Controller {
	abstract name: string
	abstract image: string
	protected abstract defaultData?: Element
	abstract renderOptions(options?: ElementOptions): ReactNode
	data: unknown

	transform(): Element {
		const newElement = regenElement(this.defaultData ?? new BoxElement())
		newElement.controller = this
		newElement.onDelete = () => this.onDelete()
		return newElement
	}

	serialize() {
		return {
			name: this.name,
			data: this.data,
		}
	}

	onDelete() {
		// noop
	}

	onCreate(root: Element, options: OnCreateOptions) {
		// noop
	}
}

export type OnCreateOptions = {
	projectTag: string
}

export interface ElementOptions<T extends Element = Element> {
	element: T
	set: (element: Element) => void
}
