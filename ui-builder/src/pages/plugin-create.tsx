import { ActionIcon, Anchor, Button, Container, Divider, Title } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { TbArrowLeft } from 'react-icons/tb'
import { Link, useNavigate } from 'react-router-dom'
import { createPlugin } from '../features/plugins/api'

export function PluginCreatePage() {
	const navigate = useNavigate()
	const createMutation = useMutation(createPlugin, {
		onSuccess: () => {
			navigate('/plugins')
		},
	})

	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">Create Plugin</Title>
				<BackToPlugins />
			</div>
			<Divider />
			<Button
				mt="xl"
				px="xl"
				onClick={() => createMutation.mutate({ name: 'plugin' })}
				loading={createMutation.isLoading}
			>
				Create
			</Button>
		</Container>
	)
}

export function BackToPlugins() {
	return (
		<Anchor component={Link} to="/plugins">
			<ActionIcon>
				<TbArrowLeft />
			</ActionIcon>
		</Anchor>
	)
}
