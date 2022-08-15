import { ActionIcon, clsx, Tabs } from '@mantine/core'
import { ReactElement, useState } from 'react'
import {
	TbChevronDown,
	TbChevronUp,
	TbClick as IcButton,
	TbComponents,
	TbFileImport as IcInput,
	TbFileText as IcTextarea,
	TbLayersDifference,
	TbLayoutColumns as IcColumns,
	TbMessage2 as IcText,
	TbPhoto as IcImage,
	TbQuestionMark,
	TbSelect as IcSelect,
	TbSquare as IcBox,
	TbSquareCheck as IcSubmitButton,
} from 'react-icons/tb'
import { Component, ComponentKind, useCanvasStore } from './canvas-store'
import { Draggable, DraggableMode } from './draggable'
import { useSelectionStore } from './selection-store'

export function SideBar() {
	const components = useCanvasStore((store) => store.components)

	return (
		<Tabs defaultValue="components">
			<Tabs.List grow>
				<Tabs.Tab value="components" icon={<TbComponents size={14} />}>
					Components
				</Tabs.Tab>
				<Tabs.Tab value="layers" icon={<TbLayersDifference size={14} />}>
					Layers
				</Tabs.Tab>
			</Tabs.List>

			<Tabs.Panel value="components" pt="xs">
				<Components />
			</Tabs.Panel>
			<Tabs.Panel value="layers" pt="xs">
				<Layers components={components} />
			</Tabs.Panel>
		</Tabs>
	)
}

function Components() {
	return (
		<div className="grid grid-cols-3 gap-2">
			<Draggable
				id={ComponentKind.Text}
				data={{ mode: DraggableMode.Add, kind: ComponentKind.Text }}
			>
				<ComponentCard label="Text" icon={getComponentIcon(ComponentKind.Text)} />
			</Draggable>
			<Draggable
				id={ComponentKind.Box}
				data={{ mode: DraggableMode.Add, kind: ComponentKind.Box }}
			>
				<ComponentCard label="Box" icon={getComponentIcon(ComponentKind.Box)} />
			</Draggable>
			<Draggable
				id={ComponentKind.Button}
				data={{ mode: DraggableMode.Add, kind: ComponentKind.Button }}
			>
				<ComponentCard label="Button" icon={getComponentIcon(ComponentKind.Button)} />
			</Draggable>
			<Draggable
				id={ComponentKind.Columns}
				data={{ mode: DraggableMode.Add, kind: ComponentKind.Columns }}
			>
				<ComponentCard label="Columns" icon={getComponentIcon(ComponentKind.Columns)} />
			</Draggable>
			<Draggable
				id={ComponentKind.Image}
				data={{ mode: DraggableMode.Add, kind: ComponentKind.Image }}
			>
				<ComponentCard label="Image" icon={getComponentIcon(ComponentKind.Image)} />
			</Draggable>
			<Draggable
				id={ComponentKind.Input}
				data={{ mode: DraggableMode.Add, kind: ComponentKind.Input }}
			>
				<ComponentCard label="Input" icon={getComponentIcon(ComponentKind.Input)} />
			</Draggable>
			<Draggable
				id={ComponentKind.Select}
				data={{ mode: DraggableMode.Add, kind: ComponentKind.Select }}
			>
				<ComponentCard label="Select" icon={getComponentIcon(ComponentKind.Select)} />
			</Draggable>
			<Draggable
				id={ComponentKind.Textarea}
				data={{ mode: DraggableMode.Add, kind: ComponentKind.Textarea }}
			>
				<ComponentCard label="Textarea" icon={getComponentIcon(ComponentKind.Textarea)} />
			</Draggable>
			<Draggable
				id={ComponentKind.SubmitButton}
				data={{ mode: DraggableMode.Add, kind: ComponentKind.SubmitButton }}
			>
				<ComponentCard label="Submit" icon={getComponentIcon(ComponentKind.SubmitButton)} />
			</Draggable>
		</div>
	)
}

function ComponentCard({ label, icon }: { label: string; icon: ReactElement }) {
	return (
		<div className="flex flex-col items-center gap-2 p-2 rounded bg-gray-50 cursor-grab text-slate-600 hover:text-slate-900">
			<div className="pt-1 text-2xl">{icon}</div>
			<p className="text-xs text-center">{label}</p>
		</div>
	)
}

function Layers({ components }: { components: Component[] }) {
	return (
		<div className="text-sm">
			{components.map((component) => (
				<Layer key={component.id} component={component} />
			))}
		</div>
	)
}

function Layer({ component }: { component: Component }) {
	const { setHovered, unsetHovered, select } = useSelectionStore((store) => ({
		setHovered: store.setHovered,
		unsetHovered: store.unsetHovered,
		select: store.select,
	}))
	const [opened, setOpened] = useState(true)
	const icon = getComponentIcon(component.kind)
	const name = component.kind
	const hasChildren = component.components.length > 0

	return (
		<div>
			<div
				className="flex py-1 items-center border-b"
				onMouseOver={() => setHovered(component.id)}
				onMouseOut={() => unsetHovered()}
				onClick={() => {
					select(component.id)
					document.getElementById(component.id)?.scrollIntoView()
				}}
			>
				<div>
					{hasChildren && (
						<ActionIcon size="xs" onClick={() => setOpened((opened) => !opened)}>
							{opened ? <TbChevronUp /> : <TbChevronDown />}
						</ActionIcon>
					)}
				</div>
				<span className={clsx('pl-1', !hasChildren && 'pl-[22px]')}>{icon}</span>
				<p className="pl-2 cursor-default">{name}</p>
			</div>
			{hasChildren && (
				<div className="pl-4" hidden={!opened}>
					<Layers components={component.components} />
				</div>
			)}
		</div>
	)
}

const getComponentIcon = (kind: ComponentKind) => {
	switch (kind) {
		case ComponentKind.Text:
			return <IcText />
		case ComponentKind.Box:
			return <IcBox />
		case ComponentKind.Button:
			return <IcButton />
		case ComponentKind.Columns:
			return <IcColumns />
		case ComponentKind.Image:
			return <IcImage />
		case ComponentKind.Input:
			return <IcInput />
		case ComponentKind.Select:
			return <IcSelect />
		case ComponentKind.Textarea:
			return <IcTextarea />
		case ComponentKind.SubmitButton:
			return <IcSubmitButton />
		default:
			return <TbQuestionMark />
	}
}
