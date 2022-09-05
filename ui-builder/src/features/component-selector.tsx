import { ActionIcon, Button, CloseButton, clsx, Divider, Tabs, TextInput } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { closeAllModals, openModal } from '@mantine/modals'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import produce from 'immer'
import { useAtomValue, useSetAtom } from 'jotai'
import _ from 'lodash'
import { ReactElement } from 'react'
import {
	Tb3DCubeSphere,
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
	TbPackgeExport,
	TbPhoto as IcImage,
	TbSelect as IcSelect,
	TbSquare as IcBox,
	TbSquareCheck as IcSubmitButton,
} from 'react-icons/tb'
import { z } from 'zod'
import { createCustomComponent, deleteCustomComponent, getCustomComponents, QueryKey } from '../api'
import {
	basicComponents,
	Component,
	ComponentKind,
	formComponents,
	Style,
	useCanvasStore,
} from './canvas-store'
import { selectedClassAtom } from './class-editor'
import { useClassNamesStore } from './class-names-store'
import { Draggable, DraggableMode } from './draggable'
import { projectTagAtom } from './project-atom'
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
				<Divider mt="xl" mb="xs" label="Components" labelPosition="center" />
				<CustomComponentSelector />
			</Tabs.Panel>
			<Tabs.Panel value="layers" pt="xs">
				<Layers components={components} />
			</Tabs.Panel>
		</Tabs>
	)
}

function CustomComponentSelector() {
	const projectTag = useAtomValue(projectTagAtom)
	const queryClient = useQueryClient()
	const query = useQuery(
		[QueryKey.CustomComponents, projectTag],
		() => getCustomComponents({ projectTag }),
		{ enabled: !!projectTag }
	)
	const deleteMutation = useMutation(deleteCustomComponent, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.CustomComponents]),
	})
	const customComponents = query.data?.data ?? []

	return (
		<div className="grid grid-cols-3 gap-2">
			{customComponents.map((component) => (
				<Draggable
					key={component.name}
					data={{ mode: DraggableMode.AddWithData, data: component.content }}
				>
					<div className="flex flex-col items-center rounded bg-gray-50 cursor-grab text-slate-600 hover:text-slate-900">
						<CloseButton
							size="xs"
							className="self-end"
							title="Delete component"
							onClick={() =>
								deleteMutation.mutate({ componentName: component.name, projectTag })
							}
							loading={deleteMutation.isLoading}
						/>
						<div className="text-2xl">
							<Tb3DCubeSphere />
						</div>
						<p className="text-xs text-center mt-2 pb-2">{component.name}</p>
					</div>
				</Draggable>
			))}
		</div>
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
		<Draggable data={{ mode: DraggableMode.Add, kind }}>
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
	if (components.length === 0)
		return <p className="text-xs text-center">Add a component to see layers</p>

	return (
		<div className="text-sm">
			{components.map((component) => (
				<Layer key={component.id} component={component} />
			))}
		</div>
	)
}

function Layer({ component }: { component: Component }) {
	const { setHovered, unsetHovered, select, selectedId } = useSelectionStore((store) => ({
		setHovered: store.setHovered,
		unsetHovered: store.unsetHovered,
		select: store.select,
		selectedId: store.selectedId,
	}))
	const setSelectedClass = useSetAtom(selectedClassAtom)
	const [opened, disclosure] = useDisclosure(true)
	const icon = getComponentIcon(component.kind)
	const name = component.kind
	const hasChildren = component.components.length > 0
	const selectAndScrollToComponent = () => {
		select(component.id)
		if (selectedId !== component.id) setSelectedClass(null)
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
				<div className="ml-auto opacity-0 group-hover:opacity-100">
					<ExtractButton component={component} />
				</div>
			</div>
			{childrenLayers}
		</div>
	)
}

function ExtractButton({ component }: { component: Component }) {
	return (
		<ActionIcon
			title="Create custom component"
			size="sm"
			onClick={() =>
				openModal({
					title: 'Create Component',
					children: <CustomComponentForm component={component} />,
				})
			}
		>
			<TbPackgeExport />
		</ActionIcon>
	)
}

const schema = z.object({
	name: z.string().min(2),
})

type Schema = z.infer<typeof schema>

function CustomComponentForm({ component }: { component: Component }) {
	const form = useForm<Schema>({ initialValues: { name: '' }, validate: zodResolver(schema) })
	const queryClient = useQueryClient()
	const mutation = useMutation(createCustomComponent, {
		onSuccess: () => {
			closeAllModals()
			queryClient.invalidateQueries([QueryKey.CustomComponents])
		},
	})
	const projectTag = useAtomValue(projectTagAtom)
	const classNames = useClassNamesStore((store) => store.classNames)
	const convertedClasses = _.toPairs(classNames)
		.filter(([className]) => component.classNames.includes(className))
		.map(([, value]) => value)
		.reduce<Style>(mergeStyles, { desktop: {}, tablet: {}, mobile: {} })

	const newComponent = produce(component, (draft) => {
		draft.data.style = mergeStyles(convertedClasses, draft.data.style)
		draft.classNames = []
	})

	return (
		<form
			onSubmit={form.onSubmit((values) =>
				mutation.mutate({
					projectTag,
					payload: {
						name: values.name,
						content: newComponent,
					},
				})
			)}
		>
			<TextInput label="Name" placeholder="Component name" {...form.getInputProps('name')} />
			<Button fullWidth mt="xl" type="submit" loading={mutation.isLoading}>
				Create
			</Button>
		</form>
	)
}

export const getComponentIcon = (kind: ComponentKind) => {
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

const mergeStyles = (first: Style, second: Style) => {
	return {
		desktop: {
			default: { ...first.desktop.default, ...second.desktop.default },
			hover: { ...first.desktop.hover, ...second.desktop.hover },
			focus: { ...first.desktop.focus, ...second.desktop.focus },
		},
		tablet: {
			default: { ...first.tablet.default, ...second.tablet.default },
			hover: { ...first.tablet.hover, ...second.tablet.hover },
			focus: { ...first.tablet.focus, ...second.tablet.focus },
		},
		mobile: {
			default: { ...first.mobile.default, ...second.mobile.default },
			hover: { ...first.mobile.hover, ...second.mobile.hover },
			focus: { ...first.mobile.focus, ...second.mobile.focus },
		},
	}
}
