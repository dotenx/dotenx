import { ActionIcon, Anchor, Container, Divider, Title } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { TbArrowLeft } from 'react-icons/tb'
import { Link, useNavigate } from 'react-router-dom'
import { createExtension } from '../features/extensions/api'
import { ExtensionForm } from '../features/extensions/extension-form'

export function ExtensionCreatePage() {
	const navigate = useNavigate()
	const createMutation = useMutation(createExtension, {
		onSuccess: (data) => navigate(`/extensions/${data.data.id}`),
	})

	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">Create Extension</Title>
				<BackToExtensions />
			</div>
			<Divider />
			<ExtensionForm
				mode="create"
				onSubmit={(values) => createMutation.mutate(values)}
				submitting={createMutation.isLoading}
			/>
		</Container>
	)
}

export function BackToExtensions() {
	return (
		<Anchor component={Link} to="/extensions">
			<ActionIcon>
				<TbArrowLeft />
			</ActionIcon>
		</Anchor>
	)
}
