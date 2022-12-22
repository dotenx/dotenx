import { ActionIcon, Anchor, Container, Divider, Loader, Title } from '@mantine/core'
import { useMutation, useQuery } from '@tanstack/react-query'
import { TbArrowLeft } from 'react-icons/tb'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { QueryKey } from '../api'
import { editExtension, getExtension } from '../features/extensions/api'
import { ExtensionForm } from '../features/extensions/extension-form'

export function ExtensionEditPage() {
	const { id = '' } = useParams()

	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">Edit Extension</Title>
				<Anchor component={Link} to={`/extensions/${id}`}>
					<ActionIcon>
						<TbArrowLeft />
					</ActionIcon>
				</Anchor>
			</div>
			<Divider />
			<EditExtensionForm id={id} />
		</Container>
	)
}

function EditExtensionForm({ id }: { id: string }) {
	const navigate = useNavigate()
	const editMutation = useMutation(editExtension, {
		onSuccess: (data) => navigate(`/extensions/${data.data?.id}`),
	})
	const extensionQuery = useQuery([QueryKey.Extension, id], () => getExtension({ id }), {
		enabled: !!id,
	})
	const extension = extensionQuery.data?.data

	if (extensionQuery.isLoading || !extension) return <Loader mt="xl" size="xs" mx="auto" />

	return (
		<ExtensionForm
			mode="edit"
			onSubmit={(values) => editMutation.mutate({ ...values, id })}
			submitting={editMutation.isLoading}
			initialValues={extension}
		/>
	)
}
