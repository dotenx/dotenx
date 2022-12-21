import { Divider, Loader, Tabs } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtom } from 'jotai'
import { TbComponents, TbLayersDifference, TbPlug, TbPuzzle } from 'react-icons/tb'
import { QueryKey } from '../../api'
import { ComponentDragger } from '../marketplace/component-dragger'
import { DesignSystems } from '../marketplace/design-systems'
import { getPlugins } from '../plugins/api'
import { ElementCard, ElementDragger } from './element-dragger'
import { DndLayers } from './layers'

export const sidebarAtom = atom<{ tab: string | null }>({ tab: 'elements' })

export function ElementDraggerAndLayers() {
	const [sidebar, setSidebar] = useAtom(sidebarAtom)

	return (
		<Tabs
			defaultValue="elements"
			value={sidebar.tab}
			onTabChange={(value) => setSidebar({ tab: value })}
		>
			<Tabs.List grow>
				<Tabs.Tab value="elements" icon={<TbComponents size={16} />} title="Elements" />
				<Tabs.Tab value="layers" icon={<TbLayersDifference size={16} />} title="Layers" />
				<Tabs.Tab value="plugins" icon={<TbPlug size={16} />} title="Layers" />
			</Tabs.List>

			<Tabs.Panel value="elements" pt="xs">
				<ElementDraggerTab />
			</Tabs.Panel>
			<Tabs.Panel value="layers" pt="xs">
				<DndLayers />
			</Tabs.Panel>
			<Tabs.Panel value="plugins" pt="xs">
				<PluginsTab />
			</Tabs.Panel>
		</Tabs>
	)
}

function ElementDraggerTab() {
	return (
		<div>
			<ElementDragger />
			<Divider mt="xl" mb="xs" label="Components" labelPosition="center" />
			<ComponentDragger />
			<DesignSystems />
		</div>
	)
}

function PluginsTab() {
	const pluginsQuery = useQuery([QueryKey.Plugins], getPlugins)
	const plugins = pluginsQuery.data?.data ?? []

	if (pluginsQuery.isLoading) return <Loader size="xs" mx="auto" />

	return (
		<div className="grid grid-cols-2 gap-2">
			{plugins.map((plugin) => (
				<ElementCard key={plugin.id} label={plugin.name} icon={<TbPuzzle />} />
			))}
		</div>
	)
}
