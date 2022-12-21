import { Anchor, Button, Divider, Loader, Tabs } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtom, useSetAtom } from 'jotai'
import { TbComponents, TbLayersDifference, TbPlug, TbPuzzle } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { QueryKey } from '../../api'
import { Draggable, DraggableMode } from '../dnd/draggable'
import { PluginElement } from '../elements/extensions/plugin'
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
				<Tabs.Tab value="plugins" icon={<TbPlug size={16} />} title="Plugins" />
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
	const setSidebar = useSetAtom(sidebarAtom)
	const pluginsQuery = useQuery([QueryKey.Plugins], getPlugins)
	const plugins = pluginsQuery.data?.data ?? []

	if (pluginsQuery.isLoading) return <Loader size="xs" mx="auto" />
	if (plugins.length === 0) return <p className="text-xs text-center">No plugins found</p>

	return (
		<div>
			<Anchor component={Link} to="/plugins">
				<Button size="xs" fullWidth>
					Go to plugins
				</Button>
			</Anchor>
			<div className="grid grid-cols-2 gap-2 mt-4">
				{plugins.map((plugin) => (
					<Draggable
						key={plugin.id}
						data={{
							mode: DraggableMode.AddWithData,
							data: PluginElement.create(plugin),
						}}
						onDrag={() => setSidebar({ tab: 'layers' })}
					>
						<ElementCard label={plugin.name} icon={<TbPuzzle />} />
					</Draggable>
				))}
			</div>
		</div>
	)
}
