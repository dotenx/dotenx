import { ActionIcon, clsx, Divider, Tabs } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { ReactElement } from 'react'
import {
	TbChevronDown,
	TbChevronUp,
	TbClick as IcButton,
	TbComponents,
	TbFileImport as IcInput,
	TbFileText as IcTextarea,
	TbForms,
	TbLayersDifference,
	TbLayoutColumns as IcColumns,
	TbMessage2 as IcText,
	TbPhoto as IcImage,
	TbSelect as IcSelect,
	TbSquare as IcBox,
	TbSquareCheck as IcSubmitButton,
} from 'react-icons/tb'
import {
	basicComponents,
	Component,
	ComponentKind,
	formComponents,
	useCanvasStore,
} from './canvas-store'
import { Draggable, DraggableMode } from './draggable'
import { useSelectionStore } from './selection-store'

export function ComponentSelectorAndLayers() {
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
				<Divider mb="xs" label="Basic" labelPosition="center" />
				<ComponentSelector kinds={basicComponents} />
				<Divider mt="xl" mb="xs" label="Form" labelPosition="center" />
				<ComponentSelector kinds={formComponents} />
			</Tabs.Panel>
			<Tabs.Panel value="layers" pt="xs">
				<Layers components={components} />
			</Tabs.Panel>
		</Tabs>
	)
}

function ComponentSelector({ kinds }: { kinds: ComponentKind[] }) {
	return (
		<div className="grid grid-cols-3 gap-2">
			{kinds.map((kind) => (
				<DraggableComponent key={kind} kind={kind} />
			))}
		</div>
	)
}

function DraggableComponent({ kind }: { kind: ComponentKind }) {
	return (
		<Draggable id={kind} data={{ mode: DraggableMode.Add, kind }}>
			<ComponentCard label={kind} icon={getComponentIcon(kind)} />
		</Draggable>
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
	const [opened, disclosure] = useDisclosure(true)
	const icon = getComponentIcon(component.kind)
	const name = component.kind
	const hasChildren = component.components.length > 0
	const selectAndScrollToComponent = () => {
		select(component.id)
		document.getElementById(component.id)?.scrollIntoView()
	}

	const disclosureButton = hasChildren && (
		<ActionIcon
			size="xs"
			className="opacity-0 group-hover:opacity-100"
			onClick={disclosure.toggle}
		>
			{opened ? <TbChevronUp /> : <TbChevronDown />}
		</ActionIcon>
	)

	const childrenLayers = hasChildren && (
		<div className="pl-4" hidden={!opened}>
			<Layers components={component.components} />
		</div>
	)

	return (
		<div>
			<div
				className="flex items-center py-1 border-b group"
				onMouseOver={() => setHovered(component.id)}
				onMouseOut={() => unsetHovered()}
				onClick={selectAndScrollToComponent}
			>
				<div>{disclosureButton}</div>
				<span className={clsx('pl-1', !hasChildren && 'pl-[22px]')}>{icon}</span>
				<p className="pl-2 cursor-default">{name}</p>
			</div>
			{childrenLayers}
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
			return <TbForms />
	}
}
