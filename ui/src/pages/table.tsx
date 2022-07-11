/* eslint-disable no-mixed-spaces-and-tabs */
import { ActionIcon, Button } from '@mantine/core'
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
import { ContentWrapper, Drawer, Endpoint, Modal, NewModal, Table } from '../features/ui'

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
	const records = recordsQuery.data?.data?.map((record) =>
		_.fromPairs(
			_.toPairs(record).map(([key, value]) =>
				typeof value === 'boolean' ? [key, value ? 'Yes' : 'No'] : [key, value]
			)
		)
	) ?? [{}]
	const columns = columnsQuery.data?.data.columns ?? []
	const headers =
		columns.map((column) => ({
			Header: <Column projectName={projectName} tableName={tableName} name={column.name} />,
			accessor: column.name,
		})) ?? []
	const tableHeaders = !records[0]?.id
		? headers
		: [
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
	const formColumns = columns.filter((column) => column.name !== 'id')

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
			<NewModal kind={Modals.NewColumn} title="New Column">
				<ColumnForm projectName={projectName} tableName={tableName} />
			</NewModal>
			<NewModal kind={Modals.NewRecord} title="New Record">
				<RecordForm columns={formColumns} projectTag={projectTag} tableName={tableName} />
			</NewModal>
			<Drawer kind={Modals.TableEndpoints} title="Endpoints">
				<TableEndpoints projectTag={projectTag} tableName={tableName} />
			</Drawer>
			<NewModal kind={Modals.QueryBuilder} title="Query Builder" size="1100px">
				<QueryTable
					projectName={projectName}
					projectTag={projectTag}
					tableName={tableName}
				/>
			</NewModal>
			<NewModal kind={Modals.TableFilter} title="Filter Records" size="1100px">
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
			</NewModal>
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
				<Endpoint
					method="POST"
					label="Get records"
					url={`${API_URL}/database/query/select/project/${projectTag}/table/${tableName}`}
					code={{ columns: [], filters: values }}
				/>
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
				size="xs"
				leftIcon={<IoFilter />}
				type="button"
				onClick={() => modal.open(Modals.TableFilter)}
			>
				Filter
			</Button>
			<Button
				size="xs"
				leftIcon={<IoSearch />}
				type="button"
				onClick={() => modal.open(Modals.QueryBuilder)}
			>
				Query Builder
			</Button>
			<Button
				size="xs"
				leftIcon={<IoList />}
				type="button"
				onClick={() => modal.open(Modals.TableEndpoints)}
			>
				Endpoints
			</Button>
			<Button
				size="xs"
				leftIcon={<IoAdd />}
				type="button"
				onClick={() => modal.open(Modals.NewRecord)}
			>
				New Record
			</Button>
			<Button
				size="xs"
				leftIcon={<IoAdd />}
				type="button"
				onClick={() => modal.open(Modals.NewColumn)}
			>
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
				<ActionIcon type="button" onClick={() => deleteMutation.mutate()}>
					<IoTrash />
				</ActionIcon>
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
			<ActionIcon
				type="button"
				onClick={() =>
					modal.open(Modals.EditRecord, { id: rowId, data: _.omit(data, 'id') })
				}
			>
				<IoPencil />
			</ActionIcon>
			<ActionIcon
				loading={mutation.isLoading}
				type="button"
				onClick={() => mutation.mutate()}
			>
				<IoTrash />
			</ActionIcon>
		</div>
	)
}
