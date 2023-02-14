import { ReactNode } from 'react'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { ComponentName } from '../helpers'
import { OptionsWrapper } from './options-wrapper'

export function ComponentWrapper({ children, name }: { children?: ReactNode; name: string }) {
	const wrapper = useSelectedElement()!

	return (
		<OptionsWrapper>
			<ComponentName name={name} />
			<BoxStyler label="Container" element={wrapper} />
			{children}
		</OptionsWrapper>
	)
}
