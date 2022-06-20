import { useQuery } from 'react-query'
import { Navigate, useParams } from 'react-router-dom'
import { getProject, QueryKey } from '../api'
import { TableForm, TableList } from '../features/database'
import { Modals } from '../features/hooks'
import { ContentWrapper, Heading, Modal } from '../features/ui'

export default function ProjectPage() {
	const { name } = useParams()
	useQuery(QueryKey.GetProject, () => getProject(name ?? ''), { enabled: !!name })

	if (!name) return <Navigate to="/builder/projects" replace />

	return (
		<>
			<ContentWrapper>
				<Heading>Project {name}</Heading>
				<TableList projectName={name} />
			</ContentWrapper>
			<Modal kind={Modals.NewTable} fluid title="New Table">
				<TableForm projectName={name} />
			</Modal>
		</>
	)
}
