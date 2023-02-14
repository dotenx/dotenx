import { ReactNode } from 'react'
import { TbTemplate } from 'react-icons/tb'
import { Element, RenderFn } from '../element'

export class TemplateElement extends Element {
	name = 'Template'
	icon = (<TbTemplate />)
	children: Element[] = []

	render(renderFn: RenderFn): ReactNode {
		return renderFn(this)
	}

	renderOptions(): ReactNode {
		return null
	}
}
