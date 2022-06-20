import { IoAdd } from 'react-icons/io5'
import { Navigate, useParams } from 'react-router-dom'
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
					actionBar={<ActionBar />}
					loading={false}
				/>
			</ContentWrapper>
			<Modal kind={Modals.NewColumn} title="New Column">
				<ColumnForm projectName={projectName} tableName={name} />
			</Modal>
		</>
	)
}

function ActionBar() {
	const modal = useModal()

	return (
		<Button className="max-w-min" onClick={() => modal.open(Modals.NewColumn)}>
			<IoAdd className="text-2xl" />
			New Column
		</Button>
	)
}
