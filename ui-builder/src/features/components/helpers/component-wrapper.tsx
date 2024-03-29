import { ReactNode } from 'react'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { ComponentName } from '../helpers'
import { OptionsWrapper } from './options-wrapper'

export function ComponentWrapper({
	children,
	name,
	stylers,
	stylerOptions,
}: {
	children?: ReactNode
	name?: string
	stylers?: Array<
		| 'alignment'
		| 'backgrounds'
		| 'borders'
		| 'spacing'
		| 'typography'
		| 'animation'
		| 'background-image'
		| 'shadow'
	>
	stylerOptions?: {
		alignment?: {
			direction?: 'row' | 'column'
		}
	}
}) {
	const component = useSelectedElement()!
	const componentName = name ? name : component.controller?.name ?? 'Component'

	return (
		<OptionsWrapper>
			<ComponentName name={componentName} />
			<BoxStyler
				label="Frame"
				element={component}
				stylers={stylers}
				stylerOptions={stylerOptions}
			/>
			{children}
		</OptionsWrapper>
	)
}
