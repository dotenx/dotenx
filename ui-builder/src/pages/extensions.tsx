import { Anchor, Button, Container, Divider, Title } from '@mantine/core'
import { TbArrowLeft, TbPlus } from 'react-icons/tb'
import { Link, useParams } from 'react-router-dom'
import { ExtensionList } from '../features/extensions/extension-list'
import { useGetProjectTag } from '../features/page/use-get-project-tag'

export function ExtensionsPage() {
	const { projectName = '' } = useParams()
	const projectTag = useGetProjectTag(projectName)

	return (
		<div className="flex">
			<BuilderLink projectName={projectName} />
			<Container className="grow">
				<div className="flex items-center justify-between">
					<Title my="xl">Extensions</Title>
					<AddExtensionLink projectName={projectName} />
				</div>
				<Divider />
				<ExtensionList projectTag={projectTag} projectName={projectName} />
			</Container>
		</div>
	)
}

export function BuilderLink({ projectName }: { projectName: string }) {
	return (
		<div className="p-6">
			<Anchor component={Link} to={`/projects/${projectName}`}>
				<Button variant="light" leftIcon={<TbArrowLeft />} size="xs">
					Back to builder
				</Button>
			</Anchor>
		</div>
	)
}

function AddExtensionLink({ projectName }: { projectName: string }) {
	return (
		<Anchor component={Link} to={`/extensions-create/${projectName}`}>
			<Button size="xs" leftIcon={<TbPlus />}>
				Extension
			</Button>
		</Anchor>
	)
}
