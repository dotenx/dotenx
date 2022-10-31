import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/team-round-left.png'
import { deserializeElement } from '../../utils/deserialize'
import { Controller, ElementOptions } from './controller'
import { SimpleComponentOptionsProps } from './helpers'

import { BarChart } from '../elements/extensions/chart-bar'
import { TableSelect, useColumnsQuery } from './create-form'
import { useInputState } from '@mantine/hooks'
import { useAtomValue } from 'jotai'
import { projectTagAtom } from '../page/top-bar'
import { HttpMethod } from '../data-bindings/data-source-store'
import { useAddDataSource } from '../data-bindings/data-source-form'
import { Select } from '@mantine/core'
import { inteliText } from '../ui/intelinput'

export class ChartBar extends Controller {
	name = 'Bar chart'
	image = imageUrl
	defaultData = deserializeElement(defaultData)
	data: { tableName: string | null } = { tableName: null }

	renderOptions(options: ElementOptions): ReactNode {
		return <ChartBarOptions options={options} controller={this} />
	}
}

// =============  renderOptions =============

function ChartBarOptions({
	options,
	controller,
}: {
	options: ElementOptions
	controller: ChartBar
}) {
	const element = options.element as BarChart

	const [selectedTable, setSelectedTable] = useInputState(controller.data.tableName)

	const projectTag = useAtomValue(projectTagAtom)
	const { addDataSource } = useAddDataSource({ mode: 'add' })
	const dataSourceName = `${options.element.id}_data`
	const columnsQuery = useColumnsQuery({
		tableName: selectedTable,
		onSuccess: () => {
			if (!selectedTable) return
			addDataSource({
				isPrivate: true,
				body: JSON.stringify({ columns: [] }),
				fetchOnload: true,
				headers: '',
				method: HttpMethod.Post,
				stateName: dataSourceName,
				url: inteliText(
					`https://api.dotenx.com/database/query/select/project/${projectTag}/table/${selectedTable}`
				),
			})
			controller.data.tableName = selectedTable
		},
	})

	const columns = columnsQuery.data?.data.columns.map((col) => col.name) ?? []

	return (
		<div className="space-y-6">
			<TableSelect
				description="Table which you want to get data from"
				value={selectedTable}
				onChange={setSelectedTable}
			/>
			<Select
				disabled={!selectedTable}
				size="xs"
				label="Labels"
				description="Get title from"
				data={columns}
				value={element.data.axisFrom.x.propName}
				onChange={(value) => {
					options.set(
						produce(element, (draft) => {
							draft.data.axisFrom.x = {
								listName: `${dataSourceName}.rows`,
								propName: value ?? '',
							}
						})
					)
				}}
			/>
			<Select
				disabled={!selectedTable}
				size="xs"
				label="Data"
				description="Get name from"
				data={columns}
				value={element.data.axisFrom.y.propName}
				onChange={(value) => {
					options.set(
						produce(element, (draft) => {
							draft.data.axisFrom.y = {
								listName: `${dataSourceName}.rows`,
								propName: value ?? '',
							}
						})
					)
				}}
			/>
		</div>
	)
}

// =============  defaultData =============

const chart = new BarChart().serialize()

const defaultData = chart
