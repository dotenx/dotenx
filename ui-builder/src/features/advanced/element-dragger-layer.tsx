import { Divider, Tabs } from '@mantine/core'
import { atom, useAtom } from 'jotai'
import { TbComponents, TbLayersDifference } from 'react-icons/tb'
import { ComponentDragger } from '../marketplace/component-dragger'
import { DesignSystems } from '../marketplace/design-systems'
import { ElementDragger } from './element-dragger'
import { DndLayers } from './layers'

export const sidebarAtom = atom<{ tab: string | null }>({ tab: 'elements' })
// WIP
export const elementHoverAtom = atom<string | null>('')

export function ElementDraggerAndLayers() {
	const [sidebar, setSidebar] = useAtom(sidebarAtom)

	return (
		<Tabs
			defaultValue="elements"
			value={sidebar.tab}
			onTabChange={(value) => setSidebar({ tab: value })}
		>
			<Tabs.List grow>
				<Tabs.Tab value="elements" icon={<TbComponents size={14} />}>
					Elements
				</Tabs.Tab>
				<Tabs.Tab value="layers" icon={<TbLayersDifference size={14} />}>
					Layers
				</Tabs.Tab>
			</Tabs.List>

			<Tabs.Panel value="elements" pt="xs">
				<ElementDraggerTab />
			</Tabs.Panel>
			<Tabs.Panel value="layers" pt="xs">
				<DndLayers />
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
