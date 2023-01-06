import { Tabs } from '@mantine/core'
import { TbBlur, TbDatabase, TbDroplet, TbRuler } from 'react-icons/tb'
import { AnimationsEditor } from '../animations/animations-editor'
import { DataEditor } from '../data-source/data-editor'
import { useElementsStore } from '../elements/elements-store'
import { useSelectedElement } from '../selection/use-selected-component'
import { StylesEditor } from '../style/styles-editor'

export function ElementAdvancedSettings() {
	const selectedComponent = useSelectedElement()
	const setElement = useElementsStore((store) => store.set)
	if (!selectedComponent) return <UnselectedMessage />

	return (
		<div className="text-xs">
			<Tabs defaultValue="options">
				<Tabs.List grow>
					<Tabs.Tab value="options" title="Options">
						<TbRuler />
					</Tabs.Tab>
					<Tabs.Tab value="styles" title="Styles">
						<TbDroplet />
					</Tabs.Tab>
					<Tabs.Tab value="data" title="Data">
						<TbDatabase />
					</Tabs.Tab>
					<Tabs.Tab value="animations" title="Animations">
						<TbBlur />
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="options" pt="xs">
					{selectedComponent.renderOptions({ set: setElement })}
				</Tabs.Panel>
				<Tabs.Panel value="styles" pt="xs">
					<StylesEditor />
				</Tabs.Panel>
				<Tabs.Panel value="data" pt="xs">
					<DataEditor />
				</Tabs.Panel>
				<Tabs.Panel value="animations" pt="xs">
					<AnimationsEditor />
				</Tabs.Panel>
			</Tabs>
		</div>
	)
}

function UnselectedMessage() {
	return <p className="text-xs text-center">Select a component to edit its options</p>
}
