import { IoAdd, IoTrash } from 'react-icons/io5'
import { useMutation } from 'react-query'
import { Navigate, useParams } from 'react-router-dom'
import { deleteTable } from '../api'
import { ColumnForm } from '../features/database'
import { Modals, useModal } from '../features/hooks'
import { Button, ContentWrapper, Modal, Table } from '../features/ui'

export default function TablePage() {
	const { projectName, name } = useParams()

	if (!projectName || !name) return <Navigate to="/builder/projects" replace />

	return (
		<>
			<ContentWrapper>
				<Table
					title={`Table ${name}`}
					columns={[]}
					data={[{}]}
					actionBar={<ActionBar projectName={projectName} tableName={name} />}
					loading={false}
				/>
			</ContentWrapper>
			<Modal kind={Modals.NewColumn} title="New Column">
				<ColumnForm projectName={projectName} tableName={name} />
			</Modal>
		</>
	)
}

function ActionBar({ projectName, tableName }: { projectName: string; tableName: string }) {
	const modal = useModal()

	return (
		<div className="flex gap-4">
			<DeleteTableButton projectName={projectName} tableName={tableName} />
			<Button className="w-40" type="button" onClick={() => modal.open(Modals.NewColumn)}>
				<IoAdd className="text-2xl" />
				New Column
			</Button>
		</div>
	)
}

function DeleteTableButton({ projectName, tableName }: { projectName: string; tableName: string }) {
	const deleteMutation = useMutation(() => deleteTable(projectName, tableName))

	return (
		<Button
			className="w-40"
			type="button"
			variant="outlined"
			onClick={() => deleteMutation.mutate()}
			loading={deleteMutation.isLoading}
		>
			<IoTrash className="text-lg" />
			Delete Table
		</Button>
	)
}
