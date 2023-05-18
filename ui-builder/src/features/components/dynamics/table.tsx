import { useAtomValue } from 'jotai'
import _ from 'lodash'
import componentImage from '../../../assets/components/faq/faq-1.png'
import { box, grid, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement, useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { projectTagAtom } from '../../page/top-bar'
import componentScript from '../../scripts/dynamic/table.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { cmn } from '../common'
import { Component, OnCreateOptions } from '../component'
import { TableSelect } from '../create-form'
import { ComponentWrapper } from '../helpers/component-wrapper'

export class DynamicTable extends Component {
	name = 'Dynamic Table'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(componentScript)
		const script = compiled({
			id: root.id,
			projectTag: options.projectTag,
			tableName: root.internal.tableName ?? '',
		})
		setElement(root, (draft) => (draft.script = script))
	}
}

function Options() {
	const root = useSelectedElement() as BoxElement
	const setElement = useSetElement()
	const projectTag = useAtomValue(projectTagAtom)

	return (
		<ComponentWrapper>
			<TableSelect
				value={(root.internal.tableName as string) ?? ''}
				onChange={(value) => {
					const compiled = _.template(componentScript)
					const script = compiled({
						id: root.id,
						projectTag: projectTag,
						tableName: value,
						columns: JSON.stringify(root.internal.columns ?? []),
					})
					setElement(root, (draft) => {
						draft.internal.tableName = value
						draft.script = script
					})
				}}
			/>
		</ComponentWrapper>
	)
}

const tags = {
	head: 'head',
	row: 'row',
}

const component = () => cmn.ppr.el([box([head(), row(), row(), row()]).class('table')])

const head = () =>
	grid(3)
		.populate([txt('Column'), txt('Column'), txt('Column')])
		.css({
			gap: '1rem',
			marginBottom: '1rem',
			fontWeight: 'bold',
		})
		.tag(tags.head)
		.class('head')

const row = () =>
	grid(3)
		.populate([txt('Cell'), txt('Cell'), txt('Cell')])
		.css({
			gap: '1rem',
			marginBottom: '1rem',
		})
		.tag(tags.row)
		.class('row')
