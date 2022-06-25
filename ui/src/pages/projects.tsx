import { Modals } from '../features/hooks'
import { ProjectForm, ProjectList } from '../features/project'
import { ContentWrapper, Heading, Modal } from '../features/ui'

export default function ProjectsPage() {
	return (
		<>
			<ContentWrapper>
				<Heading>Projects</Heading>
				<ProjectList />
			</ContentWrapper>
			<Modal kind={Modals.NewProject} title="New Project" fluid>
				<ProjectForm />
			</Modal>
		</>
	)
}
