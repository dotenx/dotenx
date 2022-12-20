import { Container, Divider, Loader, Title } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { QueryKey } from '../api'
import { getPlugin } from '../features/plugins/api'
import { BackToPlugins } from './plugin-create'

export function PluginDetailsPage() {
	const { id = '' } = useParams()

	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">Plugin {}</Title>
				<BackToPlugins />
			</div>
			<Divider mb="xl" />
			<PluginDetails id={id} />
		</Container>
	)
}

function PluginDetails({ id }: { id: string }) {
	const pluginQuery = useQuery([QueryKey.Plugin, id], () => getPlugin({ id }), { enabled: !!id })
	const plugin = pluginQuery.data?.data

	if (pluginQuery.isLoading) return <Loader size="xs" mx="auto" mt="xl" />

	return <div>{plugin?.name}</div>
}
