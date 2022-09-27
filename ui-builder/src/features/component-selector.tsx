import {
	ActionIcon,
	Button,
	Center,
	CloseButton,
	clsx,
	Divider,
	Loader,
	MultiSelect,
	Tabs,
	TextInput,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { closeAllModals, openModal } from '@mantine/modals'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import produce from 'immer'
import { useAtomValue, useSetAtom } from 'jotai'
import _ from 'lodash'
import { ReactElement, useEffect, useState } from 'react'
import { BsFillFolderSymlinkFill } from 'react-icons/bs'
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
	TbLayoutNavbar,
	TbLink,
	TbMessage2 as IcText,
	TbMinus,
	TbPackgeExport,
	TbPhoto as IcImage,
	TbPlus,
	TbQuestionMark,
	TbSelect as IcSelect,
	TbSquare as IcBox,
	TbSquareCheck as IcSubmitButton,
	TbStack,
	TbTable,
	TbTableExport,
	TbTableImport,
} from 'react-icons/tb'
import { useParams } from 'react-router-dom'
import { z } from 'zod'
import {
	addToMarketPlace,
	createCustomComponent,
	createDesignSystem,
	CustomComponent,
	deleteCustomComponent,
	deleteDesignSystem,
	getCustomComponents,
	getDesignSystems,
	getMarketplaceItems,
	importFromMarketplace,
	QueryKey,
	uploadProjectImage,
} from '../api'
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
import { useIsHighlighted } from './component-renderer'
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
				<DesignSystems />
			</Tabs.Panel>
			<Tabs.Panel value="layers" pt="xs">
				<Layers components={components} />
			</Tabs.Panel>
		</Tabs>
	)
}

function DesignSystems() {
	const projectTag = useAtomValue(projectTagAtom)
	const { projectName = '' } = useParams()
	const query = useQuery(
		[QueryKey.DesignSystems, projectTag],
		() => getDesignSystems({ projectTag }),
		{ enabled: !!projectTag }
	)
	const designSystems =
		query.data?.data?.filter((ds) => ds.category === 'uiDesignSystemItem') ?? []
	const queryClient = useQueryClient()
	const deleteMutation = useMutation(deleteDesignSystem, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.DesignSystems]),
	})

	return (
		<div>
			{designSystems.map((ds) => (
				<div key={ds.name}>
					<Divider
						mt="xl"
						mb="xs"
						label={
							<div className="flex items-center gap-1">
								<ActionIcon
									title="Add to marketplace"
									size="xs"
									onClick={() =>
										openModal({
											title: '',
											children: (
												<AddToMarketplaceDesignSystemForm
													projectName={projectName}
													ds={ds}
												/>
											),
										})
									}
								>
									<TbTableExport className="text-xs" />
								</ActionIcon>
								<div>{ds.name}</div>
								<CloseButton
									size="xs"
									onClick={() =>
										deleteMutation.mutate({ name: ds.name, projectTag })
									}
									loading={deleteMutation.isLoading}
									title="Delete design system"
								/>
							</div>
						}
						labelPosition="center"
					/>
					<CustomComponentDraggable customComponents={ds.content} />
				</div>
			))}
			<div className="flex gap-3 mt-6">
				<Button
					leftIcon={<TbPlus />}
					size="xs"
					onClick={() =>
						openModal({ title: 'Create Design System', children: <DesignSystemForm /> })
					}
					fullWidth
				>
					Design System
				</Button>
				<Button
					leftIcon={<TbTableImport />}
					size="xs"
					onClick={() =>
						openModal({
							title: 'Marketplace',
							children: <Marketplace />,
							size: '2xl',
						})
					}
					fullWidth
				>
					Marketplace
				</Button>
			</div>
		</div>
	)
}

function Marketplace() {
	const marketplaceQuery = useQuery([QueryKey.MarketplaceItems], getMarketplaceItems)
	const components =
		marketplaceQuery.data?.data.filter((item) => item.category === 'uiComponentItem') ?? []
	const designSystems =
		marketplaceQuery.data?.data.filter((item) => item.category === 'uiDesignSystemItem') ?? []

	if (marketplaceQuery.isLoading)
		return (
			<Center>
				<Loader />
			</Center>
		)

	return (
		<Tabs defaultValue="components">
			<Tabs.List>
				<Tabs.Tab value="components" icon={<TbComponents size={14} />}>
					Components
				</Tabs.Tab>
				<Tabs.Tab value="design-systems" icon={<TbTable size={14} />}>
					Design Systems
				</Tabs.Tab>
			</Tabs.List>

			<Tabs.Panel value="components" pt="xs">
				<div className="grid grid-cols-3 gap-2 h-[500px]  scrollbar overflow-y-auto bg-gray-50 -mt-2.5 pt-2">
					{components.map((c) => (
						<MarketplaceComponent
							imageUrl={c.imageUrl}
							key={c.id}
							id={c.id}
							title={c.title}
							category={c.category}
						/>
					))}
				</div>
			</Tabs.Panel>
			<Tabs.Panel value="design-systems" pt="xs">
				<div className="grid grid-cols-3 gap-2  h-[500px]   scrollbar overflow-y-auto bg-gray-50 -mt-2.5 pt-2">
					{designSystems.map((c) => (
						<MarketplaceComponent
							imageUrl={c.imageUrl}
							key={c.id}
							id={c.id}
							title={c.title}
							category={c.category}
						/>
					))}
				</div>
			</Tabs.Panel>
		</Tabs>
	)
}

function MarketplaceComponent({
	id,
	title,
	category,
	imageUrl,
}: {
	id: number
	title: string
	imageUrl: string
	category: string
}) {
	const queryClient = useQueryClient()
	const importComponentMutation = useMutation(importFromMarketplace, {
		onSuccess: () => {
			queryClient.invalidateQueries([QueryKey.CustomComponents])
			queryClient.invalidateQueries([QueryKey.DesignSystems])
			closeAllModals()
		},
	})
	const projectTag = useAtomValue(projectTagAtom)

	return (
		<div
			className="p-2 w-full h-44  border rounded bg-white"
			onClick={() =>
				importComponentMutation.mutate({ projectTag, itemId: id, name: title, category })
			}
		>
			<div className="flex w-full justify-center items-center  h-32 ">
				{imageUrl ? (
					<img src={imageUrl} className="max-h-full max-w-full" />
				) : (
					<Tb3DCubeSphere className="h-full w-full" />
				)}
			</div>
			<div className="pt-1 pb-2 text-center text-base">{title}</div>
		</div>
	)
}

function CustomComponentDraggable({ customComponents }: { customComponents: CustomComponent[] }) {
	return (
		<div className="grid grid-cols-3 gap-2">
			{customComponents.map((component) => (
				<Draggable
					key={component.name}
					data={{ mode: DraggableMode.AddWithData, data: component.content }}
				>
					<div className="flex flex-col items-center gap-2 p-2 rounded bg-gray-50 cursor-grab text-slate-600 hover:text-slate-900">
						<div className="pt-1 text-2xl">
							<Tb3DCubeSphere />
						</div>
						<p className="text-xs text-center">{component.name}</p>
					</div>
				</Draggable>
			))}
		</div>
	)
}

const designSystemSchema = z.object({
	name: z.string().min(1),
	components: z.array(z.string()),
})

type DesignSystemSchema = z.infer<typeof designSystemSchema>

function DesignSystemForm() {
	const form = useForm<DesignSystemSchema>({ initialValues: { name: '', components: [] } })
	const projectTag = useAtomValue(projectTagAtom)
	const { customComponents } = useCustomComponents()
	const queryClient = useQueryClient()
	const createMutation = useMutation(createDesignSystem, {
		onSuccess: () => {
			closeAllModals()
			queryClient.invalidateQueries([QueryKey.DesignSystems])
		},
	})

	return (
		<form
			onSubmit={form.onSubmit((values) => {
				const content = customComponents.filter((c) => values.components.includes(c.name))

				createMutation.mutate({
					projectTag,
					payload: { name: values.name, content },
				})
			})}
			className="space-y-6"
		>
			<TextInput
				label="Name"
				placeholder="Design system name"
				{...form.getInputProps('name')}
			/>
			<MultiSelect
				label="Components"
				{...form.getInputProps('components')}
				data={customComponents.map((c) => c.name)}
			/>
			<Button fullWidth type="submit" loading={createMutation.isLoading}>
				{createMutation.isLoading ? 'Creating' : 'Create'}
			</Button>
		</form>
	)
}

function AddToMarketplaceDesignSystemForm({ ds, projectName }: { ds: any; projectName: string }) {
	const [file, setFile] = useState<File>()
	const [imgSrc, setImgSrc] = useState()

	const { mutate: mutateUploadProjectImage, isLoading: loadingUploadImage } =
		useMutation(uploadProjectImage)

	const form = useForm<DesignSystemSchema>({ initialValues: { name: '', components: [] } })

	const addToMarketplaceMutation = useMutation(addToMarketPlace, {
		onSuccess: () => closeAllModals(),
	})

	useEffect(() => {
		let fileReader: any
		let isCancel = false
		if (file) {
			fileReader = new FileReader()
			fileReader.onload = (e: any) => {
				const { result } = e.target
				if (result && !isCancel) {
					setImgSrc(result)
				}
			}
			fileReader.readAsDataURL(file)
		}
		return () => {
			isCancel = true
			if (fileReader && fileReader.readyState === 1) {
				fileReader.abort()
			}
		}
	}, [file])
	return (
		<form
			onSubmit={form.onSubmit(() => {
				const formData = new FormData()
				formData.append('file', file ? file : '')
				mutateUploadProjectImage(formData, {
					onSuccess: (data: any) => {
						addToMarketplaceMutation.mutate({
							componentName: ds.name,
							projectName,
							category: 'uiDesignSystemItem',
							imageUrl: data.data.url,
						})
					},
				})
			})}
			className="space-y-6"
		>
			<div className="-mt-10 mb-5 font-semibold">
				Add <span className="text-slate-500">{ds.name}</span> design system to the
				Marketplace
			</div>
			<div>
				<div className="font-medium mt-3 mb-1 text-sm">Upload preview image: </div>
				<label
					htmlFor="file"
					className="flex items-center shadow-sm cursor-pointer  active:bg-slate-100 active:shadow-none hover:bg-slate-50 transition-all border justify-center  font-medium px-2 w-full py-1  rounded   form-input "
				>
					<span className="mr-2">browse</span>
					<BsFillFolderSymlinkFill />
				</label>
				<input
					name="file"
					accept="image/*"
					id="file"
					className="hidden  appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					type="file"
					required
					onChange={(e) => {
						setFile(e.target.files?.[0])
					}}
					value={undefined}
				/>
			</div>
			{imgSrc ? (
				<p className="img-preview-wrapper mt-2">
					{
						<img
							src={imgSrc}
							className="p-2 border border-dashed rounded"
							alt="preview"
						/>
					}
				</p>
			) : null}
			<Button
				fullWidth
				type="submit"
				loading={addToMarketplaceMutation.isLoading || loadingUploadImage}
			>
				{loadingUploadImage
					? 'Uploading image'
					: addToMarketplaceMutation.isLoading
					? 'Adding'
					: 'Add'}
			</Button>
		</form>
	)
}
const useCustomComponents = () => {
	const projectTag = useAtomValue(projectTagAtom)
	const query = useQuery(
		[QueryKey.CustomComponents, projectTag],
		() => getCustomComponents({ projectTag }),
		{ enabled: !!projectTag }
	)
	const customComponents = query.data?.data?.filter((c) => c.category === 'uiComponentItem') ?? []
	return { customComponents }
}

function CustomComponentSelector() {
	const projectTag = useAtomValue(projectTagAtom)
	const queryClient = useQueryClient()
	const { customComponents } = useCustomComponents()
	const deleteMutation = useMutation(deleteCustomComponent, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.CustomComponents]),
	})
	const { projectName = '' } = useParams()
	return (
		<div className="grid grid-cols-3 gap-2">
			{customComponents.map((component) => (
				<Draggable
					key={component.name}
					data={{ mode: DraggableMode.AddWithData, data: component.content }}
				>
					<div className="flex flex-col items-center rounded bg-gray-50 cursor-grab text-slate-600 hover:text-slate-900">
						<div className="flex self-stretch justify-between">
							<ActionIcon
								title="Add to marketplace"
								size="xs"
								onClick={() =>
									openModal({
										title: '',
										children: (
											<AddToMarketplaceCustomComponentForm
												component={component}
												projectName={projectName}
											/>
										),
									})
								}
							>
								<TbTableExport className="text-xs" />
							</ActionIcon>
							<CloseButton
								size="xs"
								title="Delete component"
								onClick={() =>
									deleteMutation.mutate({ name: component.name, projectTag })
								}
								loading={deleteMutation.isLoading}
							/>
						</div>

						<div className="text-2xl">
							<Tb3DCubeSphere />
						</div>
						<p className="pb-2 mt-2 text-xs text-center">{component.name}</p>
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

export function ComponentCard({ label, icon }: { label: string; icon: ReactElement }) {
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
	const { setHovered, unsetHovered, select, selectedIds } = useSelectionStore((store) => ({
		setHovered: store.setHovered,
		unsetHovered: store.unsetHovered,
		select: store.select,
		selectedIds: store.selectedIds,
	}))
	const setSelectedClass = useSetAtom(selectedClassAtom)
	const [opened, disclosure] = useDisclosure(true)
	const icon = getComponentIcon(component.kind)
	const name = component.kind
	const hasChildren = component.components.length > 0
	const { isSelected } = useIsHighlighted(component.id)

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
		<div className={clsx(isSelected && 'bg-gray-200 rounded')}>
			<div
				className="flex items-center py-1 border-b group"
				onMouseOver={() => setHovered(component.id)}
				onMouseOut={() => unsetHovered()}
				onClick={(event) => {
					if (event.ctrlKey && !isSelected) select([...selectedIds, component.id])
					else select([component.id])
					if (!isSelected) setSelectedClass(null)
					document.getElementById(component.id)?.scrollIntoView()
				}}
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
			onSubmit={form.onSubmit((values: any) => {
				mutation.mutate({
					projectTag,
					payload: {
						name: values.name,
						content: newComponent,
					},
				})
			})}
		>
			<TextInput label="Name" placeholder="Component name" {...form.getInputProps('name')} />

			<Button fullWidth mt="xl" type="submit" loading={mutation.isLoading}>
				{mutation.isLoading ? 'Creating' : 'Create'}
			</Button>
		</form>
	)
}
function AddToMarketplaceCustomComponentForm({
	component,
	projectName,
}: {
	component: any
	projectName: string
}) {
	const form = useForm<Schema>()
	const [file, setFile] = useState<File>()
	const [imgSrc, setImgSrc] = useState()

	const { mutate: mutateUploadProjectImage, isLoading: loadingUploadImage } =
		useMutation(uploadProjectImage)
	const addToMarketplaceMutation = useMutation(addToMarketPlace, {
		onSuccess: () => {
			closeAllModals()
		},
	})
	useEffect(() => {
		let fileReader: any
		let isCancel = false
		if (file) {
			fileReader = new FileReader()
			fileReader.onload = (e: any) => {
				const { result } = e.target
				if (result && !isCancel) {
					setImgSrc(result)
				}
			}
			fileReader.readAsDataURL(file)
		}
		return () => {
			isCancel = true
			if (fileReader && fileReader.readyState === 1) {
				fileReader.abort()
			}
		}
	}, [file])
	return (
		<form
			onSubmit={form.onSubmit(() => {
				const formData = new FormData()
				formData.append('file', file ? file : '')
				mutateUploadProjectImage(formData, {
					onSuccess: (data: any) => {
						addToMarketplaceMutation.mutate({
							componentName: component.name,
							projectName,
							category: 'uiComponentItem',
							imageUrl: data.data.url,
						})
					},
				})
			})}
		>
			<div className="-mt-10 mb-5 font-semibold">
				Add <span className="text-slate-500">{component.name}</span> component to the
				Marketplace
			</div>
			<div>
				<div className="font-medium mt-3 mb-1 text-sm">Upload preview image: </div>
				<label
					htmlFor="file"
					className="flex items-center shadow-sm cursor-pointer  active:bg-slate-100 active:shadow-none hover:bg-slate-50 transition-all border justify-center  font-medium px-2 w-full py-1  rounded   form-input "
				>
					<span className="mr-2">browse</span>
					<BsFillFolderSymlinkFill />
				</label>
				<input
					name="file"
					accept="image/*"
					id="file"
					className="hidden  appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
					type="file"
					required
					onChange={(e) => {
						setFile(e.target.files?.[0])
					}}
					value={undefined}
				/>
			</div>
			{imgSrc ? (
				<p className="img-preview-wrapper mt-2">
					{
						<img
							src={imgSrc}
							className="p-2 border border-dashed rounded"
							alt="preview"
						/>
					}
				</p>
			) : null}
			<Button
				fullWidth
				mt="xl"
				type="submit"
				loading={addToMarketplaceMutation.isLoading || loadingUploadImage}
			>
				{loadingUploadImage
					? 'Uploading image'
					: addToMarketplaceMutation.isLoading
					? 'Adding'
					: 'Add'}
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
		case ComponentKind.Form:
			return <TbForms />
		case ComponentKind.Link:
			return <TbLink />
		case ComponentKind.Stack:
			return <TbStack />
		case ComponentKind.Divider:
			return <TbMinus />
		case ComponentKind.Navbar:
			return <TbLayoutNavbar />
		default:
			return <TbQuestionMark />
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
