import { produce } from 'immer'
import _ from 'lodash'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/comparison-table-1.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { setElement, useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { color } from '../simple/palette'
import { BoxStyler, BoxStylerSimple } from '../simple/stylers/box-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component, ElementOptions, OnCreateOptions } from './component'
import { OptionsWrapper } from './helpers/options-wrapper'
import script from '../scripts/comparison-table-1.js?raw'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs, swap } from './helpers/dnd-tabs'


export class ComparisonTable1 extends Component {
	name = 'Comparison table 1'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <ComparisonTable1Options />
	}

	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(script)
		const scr = compiled({
			id: root.id,
		})
		setElement(root, (draft) => (draft.script = scr))
	}
}

// =============  renderOptions =============

function ComparisonTable1Options() {
	const set = useSetElement()
	const root = useSelectedElement<BoxElement>()!
	const table = root.find<BoxElement>(tagIds.table)!
	const thead = table.find<BoxElement>(tagIds.thead)!
	const headRow = thead.find<BoxElement>(tagIds.tr)!
	const tbody = root.find<BoxElement>(tagIds.tbody)!

	return (
		<ComponentWrapper name="Form" stylers={['alignment', 'backgrounds', 'borders', 'spacing']}>
			<BoxStyler label="Header" element={thead} />
			<DndTabs
				containerElement={headRow}
				renderItemOptions={(element) => <HeadCellOption element={element} />}
				insertElement={() => newHead('Label')}
				onInsert = {()=>{
					const columns = tbody.children[0].children!.length
					set(table, (draft) => {
						console.log('1fr '.repeat(columns + 1).trim())
						draft.customStyle!.desktop!['.table-row'] = {
							gridTemplateColumns: '1fr '.repeat(columns + 1).trim(),
						}
					})
					// Add the new cell to all rows of the tbody
					set(tbody, (draft) => {
						const rows = tbody.children
						const newRows:Element[] = []
						for (let i = 0; i < rows.length; i++) {
							const newRow = produce(rows[i], (draft) => {
								draft.children!.push(newCell('Value'))
							})
							newRows.push(newRow)
						}
						draft.children = newRows
					})
					// Add the new cell to the head row. NOTE: THIS IS NOT SUPPOSED TO BE NEEDED BUT UPDATING TABLE CANCELS THE CHANGE IN insertElement
					set(headRow, (draft) => {
						draft.children!.push(newHead('Label'))
					})
				}}
				onSwap={(oldIndex, newIndex) => {
					// Swap the columns in all rows of the tbody
					set(tbody, (draft) => {
						const rows = tbody.children
						const newRows:Element[] = []
						for (let i = 0; i < rows.length; i++) {
							const newRow = produce(rows[i], (draft) => {
								draft.children = swap(draft.children as Element[], oldIndex, newIndex)
							})
							newRows.push(newRow)
						}
						draft.children = newRows
					})
				}}
				onDelete={(index) => {

					const columns = tbody.children[0].children!.length
					set(table, (draft) => {
						draft.customStyle!.desktop!['.table-row'] = {
							gridTemplateColumns: '1fr '.repeat(columns - 1).trim(),
						}
					})

					// Delete the column in all rows of the tbody
					set(tbody, (draft) => {
						const rows = tbody.children
						const newRows:Element[] = []
						for (let i = 0; i < rows.length; i++) {
							const newRow = produce(rows[i], (draft) => {
								draft.children!.splice(index, 1)
							})
							newRows.push(newRow)
						}
						draft.children = newRows
					})
					// Delete the cell from the head row. NOTE: THIS IS NOT SUPPOSED TO BE NEEDED BUT UPDATING TABLE CANCELS THE INTERNAL onDelete
					set(headRow, (draft) => {
						draft.children!.splice(index, 1)
					})
				}}

			/>
			<DndTabs
				containerElement={tbody}
				renderItemOptions={(element) => <RowOptions element={element} />}
				insertElement={() => newRow(tbody.children[0].children!.length)}

			/>
		</ComponentWrapper>
	)
}

function HeadCellOption({ element }: { element: Element }) {
	const text = element.find<TextElement>(tagIds.thText)!
	return (
		<OptionsWrapper>
			<TextStyler label="Header" element={text} />
		</OptionsWrapper>
	)
}

function RowOptions({ element }: { element: Element }) {
	return (
		<OptionsWrapper>
			{element.children!.map((cell, index) => {
				const text = cell.find<TextElement>(tagIds.tdText)!
				return (
					<TextStyler key={index} label={`Cell ${index + 1}`} element={text} />
				)
			})}
		</OptionsWrapper>
	)
}

const tagIds = {
	thText: 'thText',
	tr: 'tr',
	thead: 'thead',
	table: 'table',
	tbody: 'tbody',
	tdText: 'tdText',
}

// =============  defaultData =============

const frame = box([])
	.css({
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		paddingTop: '40px',
		paddingBottom: '40px',
		paddingLeft: '15%',
		paddingRight: '15%',
	})
	.cssTablet({
		paddingLeft: '10%',
		paddingRight: '10%',
		paddingTop: '30px',
		paddingBottom: '30px',
	})
	.cssMobile({
		paddingLeft: '5%',
		paddingRight: '5%',
		paddingTop: '20px',
		paddingBottom: '20px',
	})
	.serialize()

const newHead = (text: string) =>
	box([txt(text).class('cell-label').tag(tagIds.thText).css({
		float: 'left'
	})])
		.as('th')
		.css({
			padding: '1rem',
		})

const thead = box([
	box([
		newHead('Plan'),
		newHead('Price'),
		newHead('Features'),
		newHead('Category'),
		newHead('Theme'),
	])
		.tag(tagIds.tr)
		.as('tr')
		.css({
			display: 'grid',
		})
		.class(['table-row']),
])
	.tag(tagIds.thead)
	.as('thead')
	.css({
		display: 'table-header-group',
		backgroundColor: color('primary'),
		color: 'hsl(0, 0%, 100%)',
	})
	.cssTablet({
		display: 'none',
	})

const newCell = (text: string) => {
	let cell = box([
		txt('Label').class('cell-label').cssTablet({
			display: 'block',
		}),
		txt(text).tag(tagIds.tdText),
	])
		.as('td')
		.css({
			padding: '1rem',
		})
		.cssTablet({
			display: 'flex',
			justifyContent: 'space-between',
		})
	cell = produce(cell, (draft) => {
		draft.customStyle.desktop = {
			'.cell-label': {
				display: 'none',
				alignSelf: 'start'
			},
		}
		draft.customStyle.tablet = {
			'.cell-label': {
				display: 'block',
			},
		}
	})
	return cell
}

const newRow = (columns: number) =>
	box(
		Array.from({ length: columns }, () => newCell('Value'))
	)
		.tag(tagIds.tr)
		.as('tr')
		.css({
			display: 'grid',
		})
		.class(['table-row'])

const tbody = box([newRow(5), newRow(5), newRow(5), newRow(5), newRow(5)])
	.tag(tagIds.tbody)
	.as('tbody')
	.css({
		display: 'table-body',
	})

const table = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'table',
			borderRadius: '10px',
			width: '100%',
			borderCollapse: 'collapse',
			overflow: 'hidden',
			boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.16)',
		},
	}

	draft.customStyle.desktop = {
		'.table-row': {
			gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
		},
		'.table-row:not(:last-child)': {
			borderBottom: '1px solid #edeef2',
		},
		'.cell-label': {
			fontWeight: 'bold',
		},
	}

	draft.customStyle.tablet = {
		'.table-row': {
			gridTemplateColumns: '1fr',
		},
	}
	draft.children = [thead, tbody]
	draft.tagId = tagIds.table
	draft.data.as = 'table'
}).serialize()

const defaultData = {
	...frame,
	components: [table],
}
