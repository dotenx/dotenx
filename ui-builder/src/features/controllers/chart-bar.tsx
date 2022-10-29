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

export class ChartBar extends Controller {
	name = 'Bar chart'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <ChartBarOptions options={options} />
	}
}

// =============  renderOptions =============

function ChartBarOptions({ options }: SimpleComponentOptionsProps) {
	const element = options.element as BarChart

	const [selectedTable, setSelectedTable] = useInputState('')

	const projectTag = useAtomValue(projectTagAtom)
	const { addDataSource } = useAddDataSource({ mode: 'add' })

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
				stateName: options.element.id + '_data',
				url: `https://api.dotenx.com/database/query/select/project/${projectTag}/table/${selectedTable}`,
			})
			// controller.data.tableName = selectedTable
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
				label="Title"
				description="Get title from"
				data={columns}
				// value={titleFrom}
				onChange={(value) => {
					options.set(
						produce(element, (draft) => {
							draft.data.axisFrom.x = {
								listName: `$store.${options.element.id}_data`,
								propName: value ?? '',
							}
						})
					)
				}}
			/>
			<Select
				disabled={!selectedTable}
				size="xs"
				label="Name"
				description="Get name from"
				data={columns}
				// value={nameFrom}
				onChange={(value) => {
					options.set(
						produce(element, (draft) => {
							draft.data.axisFrom.y = {
								listName: `$store.${options.element.id}_data`,
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
