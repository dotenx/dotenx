import { Navigate, useParams } from 'react-router-dom'
import { TableForm, TableList } from '../features/database'
import { Modals } from '../features/hooks'
import { ContentWrapper, Modal } from '../features/ui'

export default function TablesPage() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <Tables name={projectName} />
}

function Tables({ name }: { name: string }) {
	return (
		<>
			<ContentWrapper>
				<TableList projectName={name} />
			</ContentWrapper>
			<Modal kind={Modals.NewTable} fluid title="New Table">
				<TableForm projectName={name} />
			</Modal>
		</>
	)
}
