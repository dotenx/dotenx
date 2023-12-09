import { Loader } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import { produce } from 'immer'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import { API_URL } from '../../api'
import imageUrl from '../../assets/components/hero.png'
import { uuid } from '../../utils'
import { useAddDataSource } from '../data-source/data-source-form'
import { HttpMethod } from '../data-source/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { projectTagAtom } from '../page/top-bar'
import { useSelectedElement } from '../selection/use-selected-component'
import { Expression } from '../states/expression'
import { inteliState, inteliText } from '../ui/intelinput'
import { Component } from './component'
import { TableSelect, useColumnsQuery } from './create-form'
import { ComponentName } from './helpers'

export class List extends Component {
	name = 'List'
	image = imageUrl
	defaultData = new BoxElement()
	data: { tableName: string | null } = { tableName: null }

	renderOptions(): ReactNode {
		return <ListOptions component={this} />
	}
}

function ListOptions({ component }: { component: List }) {
	const boxElement = useSelectedElement() as BoxElement
	const set = useElementsStore((store) => store.set)
	const [selectedTable, setSelectedTable] = useInputState(component.data.tableName)
	const { addDataSource } = useAddDataSource({ mode: 'add' })
	const projectTag = useAtomValue(projectTagAtom)
	const columnsQuery = useColumnsQuery({
		tableName: selectedTable,
		onSuccess: (data) => {
			if (!selectedTable) return
			const sourceId = uuid()
			const dataSourceName = `list_${selectedTable}_${sourceId}`
			addDataSource({
				body: Expression.fromString(JSON.stringify({ columns: [] })),
				fetchOnload: true,
				headers: '',
				method: HttpMethod.Post,
				stateName: dataSourceName,
				url: inteliText(
					`${API_URL}/database/query/select/project/${projectTag}/table/${selectedTable}`
				),
				isPrivate: true,
			})
			component.data.tableName = selectedTable
			const columns =
				data.data.columns.filter((col) => col.name !== 'id' && col.name !== 'creator_id') ??
				[]
			set(
				produce(boxElement, (draft) => {
					draft.repeatFrom = {
						name: `$store.source.${dataSourceName}.rows`,
						iterator: `${dataSourceName}-rowsItem`,
					}
					draft.children = columns.map((col) => {
						const text = new TextElement()
						text.data.text = inteliState(`${dataSourceName}.rowsItem.${col.name}`)
						return text
					})
				})
			)
		},
	})

	return (
		<div>
			<ComponentName name="List" />

			<TableSelect
				description="Table which you want to get data from"
				value={selectedTable}
				onChange={setSelectedTable}
			/>
			{columnsQuery.isLoading && <Loader size="xs" mx="auto" my="xs" />}
		</div>
	)
}
