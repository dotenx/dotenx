import { SegmentedControl, TextInput } from '@mantine/core'
import { ReactNode } from 'react'
import { TbStack } from 'react-icons/tb'
import { useSelectedElement } from '../../selection/use-selected-component'
import { simpleFlexAligns } from '../../style/layout-editor'
import { ShadowsEditor } from '../../style/shadow-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { useEditStyle } from '../../style/use-edit-style'
import { InputWithUnit } from '../../ui/style-input'
import { Element, RenderFn } from '../element'
import { useSetElement } from '../elements-store'
import { Style } from '../style'

export class StackElement extends Element {
	name = 'Stack'
	icon = (<TbStack />)
	children: Element[] = []
	style: Style = {
		desktop: {
			default: {
				height: '150px',
				display: 'flex',
				flexDirection: 'column',
				gap: '10px',
			},
		},
	}
	data = { as: 'div' }

	render(renderFn: RenderFn): ReactNode {
		return renderFn(this)
	}

	renderOptions(): ReactNode {
		return (
			<div className="space-y-6">
				<StackSettings />
				<SpacingEditor />
				<ShadowsEditor />
			</div>
		)
	}
}

function StackSettings() {
	const { style, editStyle } = useEditStyle()
	const element = useSelectedElement() as StackElement
	const set = useSetElement()

	return (
		<div className="space-y-6">
			<TextInput
				size="xs"
				label="As HTML element"
				value={element.data.as}
				onChange={(event) => set(element, (draft) => (draft.data.as = event.target.value))}
			/>
			<InputWithUnit
				value={style.gap?.toString()}
				onChange={(value) => editStyle('gap', value)}
				label="Gap"
			/>
			<div className="flex items-center gap-4">
				<p>Align</p>
				<SegmentedControl
					data={simpleFlexAligns}
					className="grow"
					fullWidth
					size="xs"
					value={style.alignItems}
					onChange={(value) => editStyle('alignItems', value)}
				/>
			</div>
		</div>
	)
}
