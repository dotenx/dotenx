import { ActionIcon, Loader, Select, TextInput } from '@mantine/core'
import { useInputState } from '@mantine/hooks'
import { useQuery } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { ReactNode } from 'react'
import { TbTrash } from 'react-icons/tb'
import { useParams } from 'react-router-dom'
import { getColumns, GetColumnsResponse, getTables, QueryKey } from '../../api'
import imageUrl from '../../assets/components/hero.png'
import { uuid } from '../../utils'
import { HttpMethod, useDataSourceStore } from '../data-bindings/data-source-store'
import { useElementsStore } from '../elements/elements-store'
import { FormElement } from '../elements/extensions/form'
import { InputElement } from '../elements/extensions/input'
import { SubmitElement } from '../elements/extensions/submit'
import { projectTagAtom } from '../page/top-bar'
import { useSelectedElement } from '../selection/use-selected-component'
import { inteliText } from '../ui/intelinput'
import { Controller } from './controller'
import { ComponentName } from './helpers'

export class CreateForm extends Controller {
	name = 'Create Form'
	image = imageUrl
	defaultData = new FormElement()
	data: { tableName: string | null } = { tableName: null }

	renderOptions(): ReactNode {
		return <CreateFormOptions controller={this} />
	}
}

function CreateFormOptions({ controller }: { controller: CreateForm }) {
	const formElement = useSelectedElement() as FormElement
	const projectTag = useAtomValue(projectTagAtom)
	const addDataSource = useDataSourceStore((store) => store.add)
	const { set, remove } = useElementsStore((store) => ({ set: store.set, remove: store.remove }))
	const [selectedTable, setSelectedTable] = useInputState(controller.data.tableName)
	const columnsQuery = useColumnsQuery({
		tableName: selectedTable,
		onSuccess: (data) => {
			if (!formElement || !selectedTable) return
			controller.data.tableName = selectedTable
			const columns =
				data.data.columns.filter((col) => col.name !== 'id' && col.name !== 'creator_id') ??
				[]
			const sourceId = uuid()
			const sourceName = `create_${selectedTable}_${sourceId}`
			addDataSource({
				id: sourceId,
				body: '',
				headers: '',
				fetchOnload: false,
				method: HttpMethod.Post,
				properties: [],
				stateName: sourceName,
				url: inteliText(
					`https://api.dotenx.com/database/query/insert/project/${projectTag}/table/${selectedTable}`
				),
			})
			const inputs = columns.map((col) => {
				const input = new InputElement()
				input.data.name = col.name
				input.data.placeholder = col.name
				return input
			})
			const submit = new SubmitElement()
			submit.data.text = `Create ${_.capitalize(selectedTable)}`
			set(
				produce(formElement, (draft) => {
					draft.children = inputs
					draft.children.push(submit)
					draft.data.dataSourceName = sourceName
				})
			)
		},
	})

	return (
		<div className="space-y-6">
			<ComponentName name="Create Form" />

			<TableSelect
				description="The table you want to create form for"
				value={selectedTable}
				onChange={setSelectedTable}
			/>
			{columnsQuery.isLoading && <Loader size="xs" mx="auto" my="xs" />}
			<div className="space-y-4">
				{formElement.children
					.filter((element): element is InputElement => element instanceof InputElement)
					.map((inputElement) => (
						<div key={inputElement.id}>
							<ActionIcon
								size="sm"
								ml="auto"
								onClick={() => remove([inputElement.id])}
							>
								<TbTrash />
							</ActionIcon>
							<TextInput
								size="xs"
								label="Placeholder"
								value={inputElement.data.placeholder}
								onChange={(event) =>
									set(
										produce(inputElement, (draft) => {
											draft.data.placeholder = event.target.value
										})
									)
								}
							/>
						</div>
					))}
			</div>
		</div>
	)
}

export const useColumnsQuery = ({
	tableName,
	onSuccess,
}: {
	tableName: string | null
	onSuccess: (data: AxiosResponse<GetColumnsResponse>) => void
}) => {
	const { projectName = '' } = useParams()
	return useQuery(
		[QueryKey.Columns, projectName, tableName],
		() => getColumns({ projectName, tableName: tableName ?? '' }),
		{
			enabled: !!tableName && !!projectName,
			onSuccess: onSuccess,
		}
	)
}

export function TableSelect({
	value,
	onChange,
	description,
}: {
	value: string | null
	onChange: (value: string | null) => void
	description: string
}) {
	const { projectName = '' } = useParams()
	const tablesQuery = useQuery([QueryKey.Tables, projectName], () => getTables({ projectName }))
	const tables = tablesQuery.data?.data.tables ?? []

	if (tablesQuery.isLoading) {
		return <Loader size="xs" className="mx-auto" my="xs" />
	}

	return (
		<Select
			label="Table"
			description={description}
			size="xs"
			data={tables.map((table) => table.name)}
			value={value}
			onChange={onChange}
		/>
	)
}
