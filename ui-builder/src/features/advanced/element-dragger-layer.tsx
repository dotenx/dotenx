import { Anchor, Button, Divider, Loader, Tabs } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtom, useSetAtom } from 'jotai'
import { TbComponents, TbLayersDifference, TbPlug, TbPuzzle } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { QueryKey } from '../../api'
import { Draggable, DraggableMode } from '../dnd/draggable'
import { ExtensionElement } from '../elements/extensions/extension'
import { getExtensions } from '../extensions/api'
import { ComponentDragger } from '../marketplace/component-dragger'
import { DesignSystems } from '../marketplace/design-systems'
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
				<Tabs.Tab value="extensions" icon={<TbPlug size={16} />} title="Extensions" />
			</Tabs.List>

			<Tabs.Panel value="elements" pt="xs">
				<ElementDraggerTab />
			</Tabs.Panel>
			<Tabs.Panel value="layers" pt="xs">
				<DndLayers />
			</Tabs.Panel>
			<Tabs.Panel value="extensions" pt="xs">
				<ExtensionsTab />
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

function ExtensionsTab() {
	const setSidebar = useSetAtom(sidebarAtom)
	const extensionsQuery = useQuery([QueryKey.Extensions], getExtensions)
	const extensions = extensionsQuery.data?.data ?? []

	if (extensionsQuery.isLoading) return <Loader size="xs" mx="auto" />
	if (extensions.length === 0) return <p className="text-xs text-center">No extensions found</p>

	return (
		<div>
			<Anchor component={Link} to="/extensions">
				<Button size="xs" fullWidth>
					Go to extensions
				</Button>
			</Anchor>
			<div className="grid grid-cols-2 gap-2 mt-4">
				{extensions.map((extension) => (
					<Draggable
						key={extension.id}
						data={{
							mode: DraggableMode.AddWithData,
							data: ExtensionElement.create(extension),
						}}
						onDrag={() => setSidebar({ tab: 'layers' })}
					>
						<ElementCard label={extension.name} icon={<TbPuzzle />} />
					</Draggable>
				))}
			</div>
		</div>
	)
}
