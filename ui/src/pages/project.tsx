import { Navigate, useParams } from 'react-router-dom'
import { TableForm, TableList } from '../features/database'
import { Modals } from '../features/hooks'
import { ContentWrapper, Heading, Modal } from '../features/ui'

export default function ProjectPage() {
	const { name } = useParams()
	if (!name) return <Navigate to="/builder/projects" replace />
	return <Project name={name} />
}

function Project({ name }: { name: string }) {
	return (
		<>
			<ContentWrapper>
				<div className="flex items-center justify-between">
					<Heading>Project {name}</Heading>
					{/* TODO: Add this back when backend is ready */}
					{/* <ProjectDeletion name={name} /> */}
				</div>
				<TableList projectName={name} />
			</ContentWrapper>
			<Modal kind={Modals.NewTable} fluid title="New Table">
				<TableForm projectName={name} />
			</Modal>
		</>
	)
}
