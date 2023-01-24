import { Button, CloseButton, NumberInput, SegmentedControl, TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import { TbLayoutColumns, TbPlus } from 'react-icons/tb'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BackgroundsEditor } from '../../style/background-editor'
import { simpleFlexAligns } from '../../style/layout-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { useEditStyle } from '../../style/use-edit-style'
import { getStyleNumber } from '../../ui/style-input'
import { Element, RenderFn } from '../element'
import { useElementsStore, useSetElement } from '../elements-store'
import { Style } from '../style'
import { BoxElement } from './box'

export class ColumnsElement extends Element {
	name = 'Columns'
	icon = (<TbLayoutColumns />)
	children: Element[] = [new BoxElement(), new BoxElement()]
	style: Style = {
		desktop: {
			default: {
				display: 'grid',
				gridTemplateColumns: '1fr 1fr',
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
				<ColumnsSettings />
				<BackgroundsEditor simple />
				<SpacingEditor />
			</div>
		)
	}
}

function ColumnsSettings() {
	const set = useSetElement()
	const addElement = useElementsStore((store) => store.add)
	const { style: styles, editStyle } = useEditStyle()
	const element = useSelectedElement() as ColumnsElement
	const cols = styles.gridTemplateColumns?.toString().split(' ') ?? []
	const space = getStyleNumber(styles.gap?.toString())
	if (!element) return null

	return (
		<div className="space-y-6">
			<TextInput
				size="xs"
				label="As HTML element"
				value={element.data.as}
				onChange={(event) => set(element, (draft) => (draft.data.as = event.target.value))}
			/>
			<NumberInput
				size="xs"
				label="Space"
				value={space}
				onChange={(value) => editStyle('gap', `${value}px`)}
			/>
			<div className="grid items-center grid-cols-12">
				<p className="col-span-3">Align</p>
				<SegmentedControl
					className="col-span-9"
					size="xs"
					fullWidth
					data={simpleFlexAligns}
					value={styles.alignItems}
					onChange={(value) => editStyle('alignItems', value)}
				/>
			</div>
			<div className="grid items-center grid-cols-12">
				<p className="col-span-3">Justify</p>
				<SegmentedControl
					className="col-span-9"
					size="xs"
					fullWidth
					data={simpleFlexAligns}
					value={styles.justifyItems}
					onChange={(value) => editStyle('justifyItems', value)}
				/>
			</div>
			<div>
				<Button
					mb="xs"
					size="xs"
					leftIcon={<TbPlus />}
					onClick={() => {
						editStyle('gridTemplateColumns', `${styles.gridTemplateColumns} 1fr`)
						if (element.children.length <= cols.length)
							addElement(new BoxElement(), { id: element.id, mode: 'in' })
					}}
				>
					Column
				</Button>
				<div className="space-y-1">
					{cols.map((col, index) => {
						const colNumber = getStyleNumber(col)
						return (
							<div className="flex items-center gap-1" key={index}>
								<NumberInput
									size="xs"
									placeholder="Width"
									title="Width"
									className="w-full"
									value={colNumber}
									rightSection={<p>fr</p>}
									onChange={(value) =>
										editStyle(
											'gridTemplateColumns',
											produce(cols, (draft) => {
												draft[index] = value + 'fr'
											}).join(' ')
										)
									}
								/>
								<CloseButton
									size="xs"
									onClick={() =>
										editStyle(
											'gridTemplateColumns',
											cols.filter((_, i) => i !== index).join(' ')
										)
									}
								/>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
