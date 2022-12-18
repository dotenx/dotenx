import { Button, Select, Switch, ColorInput } from '@mantine/core'
import produce from 'immer'
import React, { ReactNode, useMemo } from 'react'
import imageUrl from '../../assets/components/comparison-table-simple.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { Controller, ElementOptions } from './controller'
import {
	ComponentName,
	Divider,
	DividerCollapsible,
	repeatObject,
	SimpleComponentOptionsProps,
} from './helpers'

import { Element } from '../elements/element'
import { useAtomValue } from 'jotai'
import { viewportAtom } from '../viewport/viewport-store'
import { Intelinput, inteliText } from '../ui/intelinput'
import ColorOptions from './basic-components/color-options'

export class ComparisonTableSimple extends Controller {
	name = 'Simple comparison table'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <ComparisonTableSimpleOptions options={options} />
	}
}

// =============  renderOptions =============

function ComparisonTableSimpleOptions({ options }: SimpleComponentOptionsProps) {
	const viewport = useAtomValue(viewportAtom)

	const gridDiv = options.element as BoxElement

	const [selectedRow, setSelectedRow] = React.useState(1)
	const [selectedColumn, setSelectedColumn] = React.useState(1)

	const rows = useMemo(() => {
		const totalCells = gridDiv.children.length
		const colsCount = gridDiv.style
			.desktop!.default!.gridTemplateColumns!.toString()
			.split('1fr').length
		return repeatObject(0, totalCells / colsCount).map((_, i) => i + 1 + '')
	}, [gridDiv.children.length, gridDiv.style.desktop!.default!.gridTemplateColumns])
	const cols = useMemo(() => {
		const colsCount = gridDiv.style
			.desktop!.default!.gridTemplateColumns!.toString()
			.split('1fr').length
		return repeatObject(0, colsCount).map((_, i) => i + 1 + '')
	}, [gridDiv.style.desktop!.default!.gridTemplateColumns])

	const selectedTile = useMemo(() => {
		return (selectedRow - 1) * cols.length + selectedColumn - 1
	}, [selectedColumn, selectedRow, cols.length])

	const [isRow, setIsRow] = React.useState(true)

	if (viewport === 'mobile') {
		return <div>Not displayed in mobile mode</div>
	}

	return (
		<div className="space-y-6">
			<ComponentName name="Simple comparison table" />
			<Divider title="Layout" />
			<Switch
				size="lg"
				onLabel="Row"
				offLabel="Column"
				checked={isRow}
				onChange={(event) => setIsRow(event.currentTarget.checked)}
			/>
			{isRow ? (
				<Select
					label="Row"
					placeholder="Select a row"
					data={rows}
					onChange={(val) => {
						setSelectedRow(parseInt(val ?? '0'))
					}}
					value={selectedRow + ''}
				/>
			) : (
				<Select
					label="Column"
					placeholder="Select a column"
					data={cols}
					onChange={(val) => {
						setSelectedColumn(parseInt(val ?? '0'))
					}}
					value={selectedColumn + ''}
				/>
			)}
			<div className="flex justify-between">
				<Button
					className="mt-2"
					size="xs"
					disabled={isRow ? selectedRow === 1 || rows.length === 1 : cols.length === 1}
					onClick={() => {
						options.set(
							produce(gridDiv, (draft) => {
								if (isRow) {
									draft.children?.splice(
										(selectedRow - 1) * cols.length,
										cols.length
									)
								} else {
									const remaining: Element[] = []
									draft.children.map((child, i) => {
										if ((i - (selectedColumn - 1)) % cols.length != 0) {
											remaining.push(child)
										}
										draft.children = remaining
									})

									// Remove one 1fr from the gridTemplateColumns
									const templateColumns = draft.style
										.desktop!.default!.gridTemplateColumns!.toString()
										.split('1fr')
									templateColumns.splice(templateColumns.length - 1, 1) // We know that always the last one is 1fr
									draft.style.desktop!.default!.gridTemplateColumns =
										templateColumns.join('1fr')
								}
							})
						)
						setSelectedColumn(1)
						setSelectedRow(1)
					}}
				>
					X Delete {isRow ? 'row' : 'column'}
				</Button>
				<Button
					disabled={!isRow && cols.length === 6}
					className="mt-2"
					size="xs"
					onClick={() => {
						options.set(
							produce(gridDiv, (draft) => {
								if (isRow) {
									for (let i = 0; i < cols.length; i++) {
										draft.children.push(createElement('New Cell'))
									}
								} else {
									const children: Element[] = []
									for (let i = 0; i < rows.length; i++) {
										children.push(
											...draft.children.slice(
												i * cols.length,
												(i + 1) * cols.length
											)
										)
										if (i === 0) {
											children.push(createTitle('New Column'))
										} else {
											children.push(createElement('New Cell'))
										}
									}
									draft.children = children
									draft.style.desktop!.default!.gridTemplateColumns = `${
										draft.style.desktop!.default!.gridTemplateColumns
									} 1fr`
								}
							})
						)
					}}
				>
					Add {isRow ? 'row' : 'column'}
				</Button>
			</div>
			<Divider title="Cell" />
			<div className="flex">
				<Select
					label="Row"
					placeholder="Select a row"
					data={rows}
					onChange={(val) => {
						setSelectedRow(parseInt(val ?? '0'))
					}}
					value={selectedRow + ''}
				/>
				<Select
					label="Column"
					placeholder="Select a column"
					data={cols}
					onChange={(val) => {
						setSelectedColumn(parseInt(val ?? '0'))
					}}
					value={selectedColumn + ''}
				/>
			</div>

			<Intelinput
				label="Cell content"
				placeholder="Cell content"
				onChange={(value) => {
					options.set(
						produce(
							gridDiv.children?.[selectedTile]?.children?.[0] as TextElement,
							(draft) => {
								draft.data.text = value
							}
						)
					)
				}}
				value={(gridDiv.children?.[selectedTile].children?.[0] as TextElement).data.text}
			/>
			<DividerCollapsible closed title="color">
				{ColorOptions.getBackgroundOption({ options, wrapperDiv: options.element })}
				{ColorOptions.getTextColorOption({
					options,
					wrapperDiv: options.element,
					title: 'Text color',
				})}
				<ColorInput
					value={gridDiv.style.desktop!.default!.borderColor}
					label="Border color"
					onChange={(value: any) => {
						options.set(
							produce(gridDiv as BoxElement, (draft) => {
								draft.style.desktop!.default!.borderColor = value
							})
						)
					}}
					className="col-span-9"
					size="xs"
					format="hsla"
				/>
			</DividerCollapsible>
		</div>
	)
}

// #region defaultData

/*
This component renders a table with a grid of divs.
*/

const wrapperDiv = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			fontFamily: 'Rubik',
			display: 'grid',
			gridTemplateColumns: '25% 1fr 1fr 1fr 1fr',
			gap: '0px',
			marginLeft: '10%',
			marginRight: '10%',
			paddingTop: '40px',
			paddingBottom: '40px',
			borderRadius: '15px',
			borderWidth: '1px',
			borderStyle: 'solid',
			borderColor: 'rgb(142, 142, 142)',
			backgroundColor: 'white',
			color: 'black',
		},
	}
	draft.style.mobile = {
		default: {
			display: 'none',
		},
	}
}).serialize()

const newElement = (element: BoxElement): BoxElement =>
	produce(element, (draft) => {
		draft.style.desktop = {
			default: {
				fontSize: '14px',
				borderTopWidth: '1px',
				borderTopStyle: 'solid',
				borderColor: 'inherit',
				float: 'left',
				padding: '10px',
				wordBreak: 'break-all',
			},
		}

		const text = produce(new TextElement(), (draft) => {
			draft.data.text = inteliText('Feature')
		})
		draft.children = [text]
	})

const title = produce(newElement(new BoxElement()), (draft) => {
	draft.style.desktop = {
		default: {
			...draft.style.desktop!.default,
			fontSize: '20px',
			fontWeight: '600',
			padding: '10px',
			wordBreak: 'break-all',
		},
	}
})

const createTitle = (text: string) =>
	produce(title, (draft) => {
		;(draft.children[0] as TextElement).data.text = inteliText(text)
	})

const createElement = (text: string) =>
	produce(newElement(new BoxElement()), (draft) => {
		;(draft.children[0] as TextElement).data.text = inteliText(text)
	})

const titleRow = [
	createTitle('Usage').serialize(),
	createTitle('Free').serialize(),
	createTitle('Basic').serialize(),
	createTitle('Pro').serialize(),
	createTitle('Enterprise').serialize(),
]

const row1 = [
	createElement('Projects').serialize(),
	createElement('1').serialize(),
	createElement('10').serialize(),
	createElement('Unlimited').serialize(),
	createElement('Unlimited').serialize(),
]

const row2 = [
	createElement('Storage').serialize(),
	createElement('1GB').serialize(),
	createElement('10GB').serialize(),
	createElement('Unlimited').serialize(),
	createElement('Unlimited').serialize(),
]

const row3 = [
	createElement('Collaborators').serialize(),
	createElement('1').serialize(),
	createElement('10').serialize(),
	createElement('Unlimited').serialize(),
	createElement('Unlimited').serialize(),
]

const row4 = [
	createElement('Retention').serialize(),
	createElement('').serialize(),
	createElement('✓').serialize(),
	createElement('10 days').serialize(),
	createElement('Unlimited').serialize(),
]

const defaultData = {
	...wrapperDiv,
	components: [...titleRow, ...row1, ...row2, ...row3, ...row4],
}

// #endregion
