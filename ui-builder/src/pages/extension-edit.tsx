import { ActionIcon, Anchor, Container, Divider, Loader, Title } from '@mantine/core'
import { useMutation, useQuery } from '@tanstack/react-query'
import { TbArrowLeft } from 'react-icons/tb'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QueryKey } from '../api'
import { editExtension, getExtension } from '../features/extensions/api'
import { ExtensionForm } from '../features/extensions/extension-form'
import { useGetProjectTag } from '../features/page/use-get-project-tag'
import { BuilderLink } from './extensions'

export function ExtensionEditPage() {
	const { name = '', projectName = '' } = useParams()
	const projectTag = useGetProjectTag(projectName)

	return (
		<div className="flex">
			<BuilderLink projectName={projectName} />
			<Container className="grow">
				<div className="flex items-center justify-between">
					<Title my="xl">Edit Extension</Title>
					<Anchor component={Link} to={`/extensions/${projectName}/${name}`}>
						<ActionIcon>
							<TbArrowLeft />
						</ActionIcon>
					</Anchor>
				</div>
				<Divider />
				<EditExtensionForm name={name} projectTag={projectTag} projectName={projectName} />
			</Container>
		</div>
	)
}

function EditExtensionForm({
	name,
	projectTag,
	projectName,
}: {
	name: string
	projectTag: string
	projectName: string
}) {
	const navigate = useNavigate()
	const editMutation = useMutation(editExtension, {
		onSuccess: (_, values) => navigate(`/extensions/${projectName}/${values.data.name}`),
	})
	const extensionQuery = useQuery(
		[QueryKey.Extension, name, projectTag],
		() => getExtension({ name, projectTag }),
		{
			enabled: !!name && !!projectTag,
		}
	)
	const extension = extensionQuery.data?.data

	if (extensionQuery.isLoading || !extension) return <Loader mt="xl" size="xs" mx="auto" />

	return (
		<ExtensionForm
			mode="edit"
			onSubmit={(values) => editMutation.mutate({ data: values, projectTag })}
			submitting={editMutation.isLoading}
			initialValues={extension}
		/>
	)
}
