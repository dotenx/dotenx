import { Loader } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/hero.png'
import { uuid } from '../../utils'
import { useAddDataSource } from '../data-bindings/data-source-form'
import { HttpMethod } from '../data-bindings/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import { projectTagAtom } from '../page/top-bar'
import { useSelectedElement } from '../selection/use-selected-component'
import { Controller } from './controller'
import { TableSelect, useColumnsQuery } from './create-form'

export class List extends Controller {
	name = 'List'
	image = imageUrl
	defaultData = new BoxElement()
	data: { tableName: string | null } = { tableName: null }

	renderOptions(): ReactNode {
		return <ListOptions controller={this} />
	}
}

function ListOptions({ controller }: { controller: List }) {
	const boxElement = useSelectedElement() as BoxElement
	const set = useElementsStore((store) => store.set)
	const [selectedTable, setSelectedTable] = useInputState(controller.data.tableName)
	const { addDataSource } = useAddDataSource({ mode: 'add' })
	const projectTag = useAtomValue(projectTagAtom)
	const columnsQuery = useColumnsQuery({
		tableName: selectedTable,
		onSuccess: (data) => {
			if (!selectedTable) return
			const sourceId = uuid()
			const dataSourceName = `list_${selectedTable}_${sourceId}`
			addDataSource({
				body: JSON.stringify({ columns: [] }),
				fetchOnload: true,
				headers: '',
				method: HttpMethod.Post,
				stateName: dataSourceName,
				url: `https://api.dotenx.com/database/query/select/project/${projectTag}/table/${selectedTable}`,
			})
			controller.data.tableName = selectedTable
			const columns =
				data.data.columns.filter((col) => col.name !== 'id' && col.name !== 'creator_id') ??
				[]
			set(
				produce(boxElement, (draft) => {
					draft.repeatFrom = {
						name: `$store-${dataSourceName}.rows`,
						iterator: `${dataSourceName}.rowsItem`,
					}
					draft.children = columns.map((col) => {
						const text = new TextElement()
						text.bindings.text = {
							fromStateName: `${dataSourceName}.rowsItem.${col.name}`,
						}
						return text
					})
				})
			)
		},
	})

	return (
		<div>
			<TableSelect
				description="Table which you want to get data from"
				value={selectedTable}
				onChange={setSelectedTable}
			/>
			{columnsQuery.isLoading && <Loader size="xs" mx="auto" my="xs" />}
		</div>
	)
}
