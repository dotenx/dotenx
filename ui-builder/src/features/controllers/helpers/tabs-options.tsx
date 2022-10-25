import { DragTabList, ExtraButton, Panel, PanelList, Tab, Tabs } from '@react-tabtab-next/tabtab'
import produce from 'immer'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { BoxElement } from '../../elements/extensions/box'

type TabsOptionsProps = {
	set: (element: BoxElement) => void
	containerDiv: BoxElement
	tabs: { title: string; content: ReactNode }[]
	addNewTab: () => void
}

export default function TabsOptions({
	set,
	containerDiv,
	tabs,
	addNewTab,
}: TabsOptionsProps): JSX.Element {
	const [activeTab, setActiveTab] = useState(0)

	const handleOnTabSequenceChange = useCallback(
		({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
			setActiveTab(newIndex)
			set(
				produce(containerDiv, (draft) => {
					const temp = draft.children![oldIndex]
					draft.children![oldIndex] = draft.children![newIndex]
					draft.children![newIndex] = temp
				})
			)
		},
		[containerDiv, set]
	)

	const tabItems = useMemo(() => {
		return tabs.map((tab, index) => {
			return (
				<Tab closable key={index}>
					{tab.title}
				</Tab>
			)
		})
	}, [tabs])

	const panelItems = useMemo(() => {
		return tabs.map((tab, index) => {
			return <Panel key={index}>{tab.content}</Panel>
		})
	}, [tabs])

	return (
		<div style={{ maxWidth: '250px' }}>
			<Tabs
				onTabClose={(i: number) => {
					set(
						produce(containerDiv, (draft) => {
							draft.children.splice(i, 1)
						})
					)
				}}
				showModalButton={false}
				activeIndex={activeTab}
				onTabChange={(i: number) => setActiveTab(i)}
				onTabSequenceChange={handleOnTabSequenceChange}
				ExtraButton={<ExtraButton onClick={addNewTab}>+</ExtraButton>}
			>
				<DragTabList>{tabItems}</DragTabList>
				<PanelList>{panelItems}</PanelList>
			</Tabs>
		</div>
	)
}
