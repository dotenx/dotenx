import { Container, Divider, Loader, Title } from '@mantine/core'
import { Prism } from '@mantine/prism'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { QueryKey } from '../api'
import { getPlugin, Plugin } from '../features/plugins/api'
import { PluginActions } from '../features/plugins/plugin-list'
import { BackToPlugins } from './plugin-create'

export function PluginDetailsPage() {
	const { id = '' } = useParams()
	const pluginQuery = useQuery([QueryKey.Plugin, id], () => getPlugin({ id }), { enabled: !!id })
	const plugin = pluginQuery.data?.data

	if (pluginQuery.isLoading || !plugin) return <Loader size="xs" mx="auto" mt="xl" />

	return (
		<Container>
			<div className="flex items-center justify-between">
				<Title my="xl">{plugin?.name}</Title>
				<div className="flex items-center gap-1">
					<PluginActions id={id} />
					<BackToPlugins />
				</div>
			</div>
			<Divider mb="xl" />
			<PluginDetails plugin={plugin} />
		</Container>
	)
}

function PluginDetails({ plugin }: { plugin: Plugin }) {
	return (
		<div className="space-y-4">
			<div>
				<Title order={4}>Name</Title>
				<p>{plugin.name}</p>
			</div>

			<div>
				<Title order={4}>HTML</Title>
				<Prism colorScheme="dark" noCopy language="markup">
					{plugin.html}
				</Prism>
			</div>
			<div>
				<Title order={4}>JavaScript</Title>
				<Prism colorScheme="dark" noCopy language="javascript">
					{plugin.js}
				</Prism>
			</div>
			<div>
				<Title order={4}>Head</Title>
				<Prism colorScheme="dark" noCopy language="markup">
					{plugin.head}
				</Prism>
			</div>
		</div>
	)
}
