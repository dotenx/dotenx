import { Navigate, useParams } from 'react-router-dom'
import { TableForm, TableList } from '../features/database'
import { Modals } from '../features/hooks'
import { ContentWrapper, NewModal } from '../features/ui'

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
			<NewModal kind={Modals.NewTable} title="Add a new table">
				<TableForm projectName={name} />
			</NewModal>
		</>
	)
}
