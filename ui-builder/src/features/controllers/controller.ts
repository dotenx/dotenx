import { ReactNode } from 'react'
import { ROOT_ID } from '../canvas'
import { Component } from '../canvas-store'
import { regenComponent } from '../droppable'

export abstract class Controller {
	public abstract name: string
	public abstract image: string
	protected abstract defaultData: Component

	public transform(): Component {
		return { ...regenComponent(this.defaultData, ROOT_ID), controller: this }
	}

	public abstract renderOptions(options: ComponentOptions): ReactNode
}

export interface ComponentOptions {
	component: Component
	set: (id: string, component: Component) => void
}
