import { Button, ColorInput, Select, Switch } from '@mantine/core'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { ReactNode, useState } from 'react'
import { TbMinus, TbPlus } from 'react-icons/tb'
import imageUrl from '../../assets/components/comparison-table-simple.png'
import { deserializeElement } from '../../utils/deserialize'
import { Element } from '../elements/element'
import { useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { BoxElementInput } from '../ui/box-element-input'
import { inteliText } from '../ui/intelinput'
import { TextElementInput } from '../ui/text-element-input'
import { viewportAtom } from '../viewport/viewport-store'
import { Controller, ElementOptions } from './controller'
import { ComponentName, Divider, DividerCollapsible, repeatObject } from './helpers'
import { OptionsWrapper } from './helpers/options-wrapper'

export class ComparisonTableSimple extends Controller {
	name = 'Simple comparison table'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <ComparisonTableSimpleOptions />
	}
}

// =============  renderOptions =============

function ComparisonTableSimpleOptions() {
	const set = useSetElement()
	const component = useSelectedElement<BoxElement>()!
	const viewport = useAtomValue(viewportAtom)
	const [selectedRow, setSelectedRow] = useState(1)
	const [selectedColumn, setSelectedColumn] = useState(1)
	const [isRow, setIsRow] = useState(true)

	const totalCells = component.children.length
	const columnsCount = component.style
		.desktop!.default!.gridTemplateColumns!.toString()
		.split('1fr').length
	const rows = repeatObject(0, totalCells / columnsCount).map((_, i) => i + 1 + '')
	const columns = repeatObject(0, columnsCount).map((_, i) => i + 1 + '')
	const selectedTile = (selectedRow - 1) * columns.length + selectedColumn - 1
	const disableDelete = isRow ? selectedRow === 1 || rows.length === 1 : columns.length === 1
	const disableAdd = !isRow && columns.length === 6
	const cellContent = component.children?.[selectedTile]?.children?.[0] as TextElement

	const handleDelete = () => {
		set(component, (draft) => {
			if (isRow) {
				draft.children?.splice((selectedRow - 1) * columns.length, columns.length)
			} else {
				const remaining: Element[] = []
				draft.children.map((child, i) => {
					if ((i - (selectedColumn - 1)) % columns.length != 0) remaining.push(child)
					draft.children = remaining
				})
				// Remove one 1fr from the gridTemplateColumns
				const templateColumns = draft.style
					.desktop!.default!.gridTemplateColumns!.toString()
					.split('1fr')
				templateColumns.splice(templateColumns.length - 1, 1) // We know that always the last one is 1fr
				draft.style.desktop!.default!.gridTemplateColumns = templateColumns.join('1fr')
			}
		})
		setSelectedColumn(1)
		setSelectedRow(1)
	}

	const handleAdd = () => {
		set(component, (draft) => {
			if (isRow) {
				for (let i = 0; i < columns.length; i++) {
					draft.children.push(createElement('New Cell'))
				}
			} else {
				const children: Element[] = []
				for (let i = 0; i < rows.length; i++) {
					children.push(
						...draft.children.slice(i * columns.length, (i + 1) * columns.length)
					)
					if (i === 0) children.push(createTitle('New Column'))
					else children.push(createElement('New Cell'))
				}
				draft.children = children
				draft.style.desktop!.default!.gridTemplateColumns = `${
					draft.style.desktop!.default!.gridTemplateColumns
				} 1fr`
			}
		})
	}

	const setBorderColor = (value: string) => {
		set(component, (draft) => (draft.style.desktop!.default!.borderColor = value))
	}

	if (viewport === 'mobile') return <p>Not displayed in mobile mode</p>

	return (
		<OptionsWrapper>
			<ComponentName name="Simple comparison table" />
			<Divider title="Layout" />
			<Switch
				size="xs"
				label={isRow ? 'Row' : 'Column'}
				checked={isRow}
				onChange={(event) => setIsRow(event.currentTarget.checked)}
			/>
			{isRow ? (
				<Select
					size="xs"
					label="Row"
					placeholder="Select a row"
					data={rows}
					onChange={(value) => setSelectedRow(_.parseInt(value ?? '0'))}
					value={selectedRow.toString()}
				/>
			) : (
				<Select
					size="xs"
					label="Column"
					placeholder="Select a column"
					data={columns}
					onChange={(value) => setSelectedColumn(_.parseInt(value ?? '0'))}
					value={selectedColumn.toString()}
				/>
			)}
			<div className="flex justify-between">
				<Button
					className="mt-2"
					size="xs"
					disabled={disableDelete}
					onClick={handleDelete}
					leftIcon={<TbMinus />}
				>
					Delete {isRow ? 'row' : 'column'}
				</Button>
				<Button
					disabled={disableAdd}
					className="mt-2"
					size="xs"
					onClick={handleAdd}
					leftIcon={<TbPlus />}
				>
					Add {isRow ? 'row' : 'column'}
				</Button>
			</div>
			<Divider title="Cell" />
			<div className="flex gap-6">
				<Select
					size="xs"
					label="Row"
					placeholder="Select a row"
					data={rows}
					onChange={(value) => setSelectedRow(_.parseInt(value ?? '0'))}
					value={selectedRow.toString()}
				/>
				<Select
					size="xs"
					label="Column"
					placeholder="Select a column"
					data={columns}
					onChange={(value) => setSelectedColumn(_.parseInt(value ?? '0'))}
					value={selectedColumn.toString()}
				/>
			</div>
			<TextElementInput
				label="Cell content"
				element={cellContent}
			/>
			<DividerCollapsible closed title="color">
				<BoxElementInput element={component} label="Background color" />
				<ColorInput
					value={component.style.desktop?.default?.borderColor}
					label="Border color"
					onChange={setBorderColor}
					size="xs"
					format="hsla"
				/>
			</DividerCollapsible>
		</OptionsWrapper>
	)
}

/*
This component renders a table with a grid of boxes.
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
		const textElement = draft.children[0] as TextElement
		textElement.data.text = inteliText(text)
	})

const createElement = (text: string) =>
	produce(newElement(new BoxElement()), (draft) => {
		const textElement = draft.children[0] as TextElement
		textElement.data.text = inteliText(text)
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
