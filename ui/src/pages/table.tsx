import { IoAdd, IoList, IoTrash } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Navigate, useParams } from 'react-router-dom'
import { deleteColumn, getColumns, getProject, getTableRecords, QueryKey } from '../api'
import { ColumnForm, TableDeletion, TableEndpoints } from '../features/database'
import { Modals, useModal } from '../features/hooks'
import { Button, ContentWrapper, Modal, Table } from '../features/ui'

export default function TablePage() {
	const { projectName, tableName } = useParams()
	if (!projectName || !tableName) return <Navigate to="/builder/projects" replace />

	return <TableContent projectName={projectName} tableName={tableName} />
}

function TableContent({ projectName, tableName }: { projectName: string; tableName: string }) {
	const projectDetails = useQuery(QueryKey.GetProject, () => getProject(projectName))
	const projectTag = projectDetails.data?.data.tag ?? ''
	const columnsQuery = useQuery(QueryKey.GetColumns, () => getColumns(projectName, tableName))
	const recordsQuery = useQuery(
		QueryKey.GetTableRecords,
		() => getTableRecords(projectTag, tableName),
		{ enabled: !!projectTag }
	)
	const records = recordsQuery.data?.data ?? [{}]
	const headers =
		columnsQuery.data?.data.columns.map((column) => ({
			Header: <Column projectName={projectName} tableName={tableName} name={column} />,
			accessor: column,
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
		</>
	)
}

function ActionBar({ projectName, tableName }: { projectName: string; tableName: string }) {
	const modal = useModal()

	return (
		<div className="flex gap-4">
			<TableDeletion projectName={projectName} tableName={tableName} />
			<Button
				className="w-40"
				type="button"
				onClick={() => modal.open(Modals.TableEndpoints)}
			>
				<IoList className="text-2xl" />
				Endpoints
			</Button>
			<Button className="w-40" type="button" onClick={() => modal.open(Modals.NewColumn)}>
				<IoAdd className="text-2xl" />
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
