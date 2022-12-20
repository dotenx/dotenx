import { Container, Divider, Title } from '@mantine/core'
import { useParams } from 'react-router-dom'
import { BackToPlugins } from './plugin-create'

export function PluginEditPage() {
	const { id = '' } = useParams()

	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">Plugin {}</Title>
				<BackToPlugins />
			</div>
			<Divider mb="xl" />
			<p>Edit Plugin {id}</p>
		</Container>
	)
}
