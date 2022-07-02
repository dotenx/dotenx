import { useState } from 'react'
import { IoAdd, IoFilter, IoList, IoSearch, IoTrash } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Navigate, useParams } from 'react-router-dom'
import {
	deleteColumn,
	getColumns,
	getProject,
	getTableRecords,
	GetTableRecordsRequest,
	QueryKey,
} from '../api'
import { JsonCode } from '../features/automation/json-code'
import { ColumnForm, TableDeletion, TableEndpoints } from '../features/database'
import QueryBuilder, { QueryBuilderValues } from '../features/database/query-builder'
import { Modals, useModal } from '../features/hooks'
import { Button, ContentWrapper, Modal, Table } from '../features/ui'

export default function TablePage() {
	const { projectName, tableName } = useParams()
	if (!projectName || !tableName) return <Navigate to="/builder/projects" replace />

	return <TableContent projectName={projectName} tableName={tableName} />
}

function TableContent({ projectName, tableName }: { projectName: string; tableName: string }) {
	const modal = useModal()
	const [filters, setFilters] = useState<GetTableRecordsRequest>({ columns: [] })
	const projectDetails = useQuery(QueryKey.GetProject, () => getProject(projectName))
	const projectTag = projectDetails.data?.data.tag ?? ''
	const columnsQuery = useQuery(QueryKey.GetColumns, () => getColumns(projectName, tableName))
	const recordsQuery = useQuery(
		[QueryKey.GetTableRecords, projectTag, tableName, filters],
		() => getTableRecords(projectTag, tableName, filters),
		{ enabled: !!projectTag }
	)
	const records = recordsQuery.data?.data ?? [{}]
	const headers =
		columnsQuery.data?.data.columns.map((column) => ({
			Header: <Column projectName={projectName} tableName={tableName} name={column.name} />,
			accessor: column.name,
		})) ?? []

	return (
		<>
			<ContentWrapper>
				<Table
					title={`Table ${tableName}`}
					columns={headers}
					data={records}
					actionBar={<ActionBar projectName={projectName} tableName={tableName} />}
					loading={recordsQuery.isLoading || columnsQuery.isLoading}
					emptyText="There's no record yet"
				/>
			</ContentWrapper>
			<Modal kind={Modals.NewColumn} title="New Column">
				<ColumnForm projectName={projectName} tableName={tableName} />
			</Modal>
			<Modal kind={Modals.TableEndpoints} title="Endpoints" size="xl">
				<TableEndpoints projectTag={projectTag} tableName={tableName} />
			</Modal>
			<Modal kind={Modals.QueryBuilder} title="Query Builder" size="lg">
				<QueryBuilder projectName={projectName} tableName={tableName}>
					{(values) => <JsonCode code={{ columns: [], filters: values }} />}
				</QueryBuilder>
			</Modal>
			<Modal kind={Modals.TableFilter} title="Filter Records" size="lg">
				<RecordFilter
					projectName={projectName}
					tableName={tableName}
					defaultValues={filters.filters}
					onSubmit={(values) => {
						setFilters({ columns: [], filters: values })
						recordsQuery.refetch()
						modal.close()
					}}
				/>
			</Modal>
		</>
	)
}

function ActionBar({ projectName, tableName }: { projectName: string; tableName: string }) {
	const modal = useModal()

	return (
		<div className="flex gap-2 text-xs">
			<TableDeletion projectName={projectName} tableName={tableName} />
			<Button className="w-32" type="button" onClick={() => modal.open(Modals.TableFilter)}>
				<IoFilter />
				Filter
			</Button>
			<Button className="w-32" type="button" onClick={() => modal.open(Modals.QueryBuilder)}>
				<IoSearch />
				Query Builder
			</Button>
			<Button
				className="w-32"
				type="button"
				onClick={() => modal.open(Modals.TableEndpoints)}
			>
				<IoList />
				Endpoints
			</Button>
			<Button className="w-32" type="button" onClick={() => modal.open(Modals.NewColumn)}>
				<IoAdd />
				New Column
			</Button>
		</div>
	)
}

interface ColumnProps {
	projectName: string
	tableName: string
	name: string
}

function Column({ projectName, tableName, name }: ColumnProps) {
	const client = useQueryClient()
	const deleteMutation = useMutation(() => deleteColumn(projectName, tableName, name), {
		onSuccess: () => client.invalidateQueries(QueryKey.GetColumns),
	})
	const showDelete = name !== 'id'

	return (
		<div className="flex items-center gap-2">
			{name}
			{showDelete && (
				<button type="button" onClick={() => deleteMutation.mutate()}>
					<IoTrash />
				</button>
			)}
		</div>
	)
}

function RecordFilter({
	projectName,
	tableName,
	defaultValues,
	onSubmit,
}: {
	projectName: string
	tableName: string
	defaultValues?: QueryBuilderValues
	onSubmit: (values: QueryBuilderValues) => void
}) {
	return (
		<QueryBuilder projectName={projectName} tableName={tableName} defaultValues={defaultValues}>
			{(values) => (
				<Button type="button" onClick={() => onSubmit(values)}>
					Apply Filter
				</Button>
			)}
		</QueryBuilder>
	)
}
