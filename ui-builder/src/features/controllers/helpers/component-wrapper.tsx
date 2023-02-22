import { ReactNode } from 'react'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { AlignmentEditor } from '../../style/alignment-editor'
import { ComponentName } from '../helpers'
import { OptionsWrapper } from './options-wrapper'

export function ComponentWrapper({
	children,
	name,
	stylers,
	stylerOptions,
}: {
	children?: ReactNode
	name: string
	stylers?: Array<'alignment' | 'backgrounds' | 'borders' | 'spacing' | 'typography'>
	stylerOptions?: {
		alignment?: {
			direction?: 'row' | 'column'
		}
	}
}) {
	const wrapper = useSelectedElement()!

	return (
		<OptionsWrapper>
			<ComponentName name={name} />
			<BoxStyler label="Container" element={wrapper} stylers={stylers} stylerOptions={stylerOptions} />
			{children}
		</OptionsWrapper>
	)
}
