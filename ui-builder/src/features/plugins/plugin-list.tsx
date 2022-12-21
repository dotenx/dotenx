import { ActionIcon, Anchor, Loader } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TbPencil, TbTrash } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { QueryKey } from '../../api'
import { deletePlugin, getPlugins, Plugin } from './api'

export function PluginList() {
	const pluginsQuery = useQuery([QueryKey.Plugins], getPlugins)
	const plugins = pluginsQuery.data?.data ?? []

	if (pluginsQuery.isLoading) return <Loader size="xs" mx="auto" mt="xl" />
	if (plugins.length === 0) return <p className="mt-6">No plugins</p>

	return (
		<ul className="mt-6 space-y-4">
			{plugins.map((plugin) => (
				<PluginItem key={plugin.id} plugin={plugin} />
			))}
		</ul>
	)
}

function PluginItem({ plugin }: { plugin: Plugin }) {
	return (
		<li className="flex justify-between items-center bg-gray-50 rounded px-2 py-1">
			<Link to={`/plugins/${plugin.id}`} className="hover:underline">
				{plugin.name}
			</Link>
			<PluginActions id={plugin.id} />
		</li>
	)
}

export function PluginActions({ id }: { id: string }) {
	const queryClient = useQueryClient()
	const deleteMutation = useMutation(deletePlugin, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.Plugins]),
	})

	return (
		<div className="flex gap-1">
			<ActionIcon
				onClick={() => deleteMutation.mutate({ id })}
				loading={deleteMutation.isLoading}
			>
				<TbTrash />
			</ActionIcon>
			<Anchor component={Link} to={`/plugins-edit/${id}`}>
				<ActionIcon>
					<TbPencil />
				</ActionIcon>
			</Anchor>
		</div>
	)
}
