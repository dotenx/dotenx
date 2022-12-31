import { ActionIcon, Anchor, Container, Divider, Title } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { TbArrowLeft } from 'react-icons/tb'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createExtension } from '../features/extensions/api'
import { ExtensionForm } from '../features/extensions/extension-form'
import { useGetProjectTag } from '../features/page/use-get-project-tag'
import { BuilderLink } from './extensions'

export function ExtensionCreatePage() {
	const { projectName = '' } = useParams()
	const projectTag = useGetProjectTag(projectName)
	const navigate = useNavigate()
	const createMutation = useMutation(createExtension, {
		onSuccess: (_, values) => navigate(`/extensions/${projectName}/${values.data.name}`),
	})

	return (
		<div className="flex">
			<BuilderLink projectName={projectName} />
			<Container className="grow">
				<div className="flex items-center justify-between">
					<Title my="xl">Create Extension</Title>
					<BackToExtensions projectName={projectName} />
				</div>
				<Divider />
				<ExtensionForm
					mode="create"
					onSubmit={(values) => createMutation.mutate({ data: values, projectTag })}
					submitting={createMutation.isLoading}
				/>
			</Container>
		</div>
	)
}

export function BackToExtensions({ projectName }: { projectName: string }) {
	return (
		<Anchor component={Link} to={`/extensions/${projectName}`}>
			<ActionIcon>
				<TbArrowLeft />
			</ActionIcon>
		</Anchor>
	)
}
