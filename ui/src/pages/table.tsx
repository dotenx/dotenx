import _ from 'lodash'
import { useState } from 'react'
import { IoAdd, IoFilter, IoList, IoPencil, IoSearch, IoTrash } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Navigate, useParams } from 'react-router-dom'
import { CellProps } from 'react-table'
import {
	API_URL,
	deleteColumn,
	deleteRecord,
	getColumns,
	getProject,
	getTableRecords,
	GetTableRecordsRequest,
	QueryKey,
	TableRecord,
} from '../api'
import {
	ColumnForm,
	EditRecordForm,
	QueryBuilder,
	QueryBuilderValues,
	RecordForm,
	TableDeletion,
	TableEndpoints,
} from '../features/database'
import { Modals, useModal } from '../features/hooks'
import { Button, ContentWrapper, Drawer, Endpoint, JsonCode, Modal, Table } from '../features/ui'

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
	const records =
		recordsQuery.data?.data?.map((record) =>
			_.fromPairs(
				_.toPairs(record).map(([key, value]) =>
					typeof value === 'boolean' ? [key, value ? 'Yes' : 'No'] : [key, value]
				)
			)
		) ?? []
	const columns = columnsQuery.data?.data.columns.map((column) => column.name) ?? []
	const headers =
		columns.map((column) => ({
			Header: <Column projectName={projectName} tableName={tableName} name={column} />,
			accessor: column,
		})) ?? []
	const tableHeaders = [
		...headers,
		{
			Header: 'Actions',
			accessor: '___actions___',
			Cell: (props: CellProps<TableRecord>) => (
				<RecordActions
					projectTag={projectTag}
					tableName={tableName}
					data={props.row.original}
				/>
			),
		},
	]
	const formColumns = columns.filter((column) => column !== 'id')

	return (
		<>
			<ContentWrapper>
				<Table
					title={`Table ${tableName}`}
					columns={tableHeaders}
					data={records}
					actionBar={<ActionBar projectName={projectName} tableName={tableName} />}
					loading={recordsQuery.isLoading || columnsQuery.isLoading}
					emptyText="There's no record yet"
				/>
			</ContentWrapper>
			<Modal kind={Modals.NewColumn} title="New Column">
				<ColumnForm projectName={projectName} tableName={tableName} />
			</Modal>
			<Modal kind={Modals.NewRecord} title="New Record">
				<RecordForm columns={formColumns} projectTag={projectTag} tableName={tableName} />
			</Modal>
			<Drawer kind={Modals.TableEndpoints} title="Endpoints">
				<TableEndpoints projectTag={projectTag} tableName={tableName} />
			</Drawer>
			<Modal kind={Modals.QueryBuilder} title="Query Builder" size="lg">
				<QueryTable
					projectName={projectName}
					projectTag={projectTag}
					tableName={tableName}
				/>
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
			<Modal kind={Modals.EditRecord} title="Edit Record">
				{({ id, data }: { id: string; data: TableRecord }) => (
					<EditRecordForm
						projectTag={projectTag}
						tableName={tableName}
						rowId={id}
						defaultValues={data}
						columns={formColumns}
					/>
				)}
			</Modal>
		</>
	)
}

function QueryTable({
	projectName,
	projectTag,
	tableName,
}: {
	projectName: string
	projectTag: string
	tableName: string
}) {
	return (
		<QueryBuilder projectName={projectName} tableName={tableName}>
			{(values) => (
				<div className="space-y-6">
					<Endpoint
						method="POST"
						label="Get records"
						url={`${API_URL}/database/query/select/project/${projectTag}/table/${tableName}`}
					/>
					<JsonCode code={{ columns: [], filters: values }} />
				</div>
			)}
		</QueryBuilder>
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
			<Button className="w-32" type="button" onClick={() => modal.open(Modals.NewRecord)}>
				<IoAdd />
				New Record
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
		onSuccess: () => {
			client.invalidateQueries(QueryKey.GetColumns)
			client.invalidateQueries(QueryKey.GetTableRecords)
		},
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

function RecordActions({
	projectTag,
	tableName,
	data,
}: {
	projectTag: string
	tableName: string
	data: TableRecord
}) {
	const rowId = data.id
	const client = useQueryClient()
	const mutation = useMutation(() => deleteRecord(projectTag, tableName, rowId), {
		onSuccess: () => client.invalidateQueries(QueryKey.GetTableRecords),
	})
	const modal = useModal()

	return (
		<div className="flex justify-end gap-1">
			<Button
				variant="icon"
				type="button"
				onClick={() =>
					modal.open(Modals.EditRecord, { id: rowId, data: _.omit(data, 'id') })
				}
			>
				<IoPencil />
			</Button>
			<Button
				variant="icon"
				loading={mutation.isLoading}
				type="button"
				onClick={() => mutation.mutate()}
			>
				<IoTrash />
			</Button>
		</div>
	)
}
