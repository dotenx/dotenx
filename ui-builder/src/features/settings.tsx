import {
	ActionIcon,
	Button,
	CloseButton,
	Code,
	ColorPicker,
	Divider,
	Group,
	Image,
	Menu,
	NumberInput,
	Select,
	Switch,
	Tabs,
	Text,
	TextInput,
} from '@mantine/core'
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { useDidUpdate } from '@mantine/hooks'
import { closeAllModals, openModal } from '@mantine/modals'
import RichTextEditor from '@mantine/rte'
import { useMutation } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { CSSProperties, useState } from 'react'
import {
	TbDatabase,
	TbDroplet,
	TbEdit,
	TbPhoto,
	TbPlus,
	TbRuler,
	TbUpload,
	TbX,
} from 'react-icons/tb'
import { uploadImage } from '../api'
import { uuid } from '../utils'
import {
	Action,
	ActionKind,
	actionKinds,
	BoxComponent,
	ButtonComponent,
	ColumnsComponent,
	Component,
	ComponentEvent,
	ComponentKind,
	EventKind,
	FormComponent,
	ImageComponent,
	InputComponent,
	SelectComponent,
	SubmitButtonComponent,
	TextareaComponent,
	TextComponent,
	useCanvasStore,
} from './canvas-store'
import { selectedClassAtom, selectedSelectorAtom } from './class-editor'
import { useClassNamesStore } from './class-names-store'
import {
	CodeEditor,
	DataEditor,
	FetchSettings,
	getActionDefaultValue,
	SetStateSettings,
	ToggleStateSettings,
} from './data-editor'
import { DataSourceForm } from './data-source-form'
import { useDataSourceStore } from './data-source-store'
import { projectTagAtom } from './project-atom'
import { StylesEditor } from './styles-editor'
import { useSelectedComponent } from './use-selected-component'
import { useViewportStore } from './viewport-store'

export function Settings() {
	const viewport = useViewportStore((store) => store.device)
	const selectedComponent = useSelectedComponent()
	const editStyle = useEditStyle(selectedComponent)
	const selectedClassName = useAtomValue(selectedClassAtom)
	const { classNames, editClassName } = useClassNamesStore((store) => ({
		classNames: store.classNames,
		editClassName: store.edit,
	}))
	const selector = useAtomValue(selectedSelectorAtom)

	if (!selectedComponent) return <UnselectedMessage />
	const styles = selectedClassName
		? classNames[selectedClassName][viewport][selector]
		: selectedComponent.data.style[viewport][selector]
	const editClassStyle = (styles: CSSProperties) => {
		if (selectedClassName) editClassName(selectedClassName, viewport, selector, styles)
		else console.error("Can't edit class style without selected class name")
	}
	const editClassOrComponentStyle = selectedClassName ? editClassStyle : editStyle

	return (
		<div className="text-xs">
			<Tabs defaultValue="options">
				<Tabs.List grow>
					<Tabs.Tab value="options" icon={<TbRuler />}>
						Options
					</Tabs.Tab>
					<Tabs.Tab value="styles" icon={<TbDroplet />}>
						Styles
					</Tabs.Tab>
					<Tabs.Tab value="data" icon={<TbDatabase />}>
						Data
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="options" pt="xs">
					<ComponentSettingsShaper component={selectedComponent} />
				</Tabs.Panel>
				<Tabs.Panel value="styles" pt="xs">
					<StylesEditor styles={styles ?? {}} onChange={editClassOrComponentStyle} />
				</Tabs.Panel>
				<Tabs.Panel value="data" pt="xs">
					<DataEditor component={selectedComponent} />
				</Tabs.Panel>
			</Tabs>
		</div>
	)
}

function UnselectedMessage() {
	return <p className="text-xs text-center">Select a component to edit its options</p>
}

function ComponentSettingsShaper({ component }: { component: Component }) {
	switch (component.kind) {
		case ComponentKind.Text:
			return <TextComponentSettings component={component} />
		case ComponentKind.Box:
			return <BoxComponentSettings component={component} />
		case ComponentKind.Image:
			return <ImageComponentSettings component={component} />
		case ComponentKind.Button:
			return <ButtonComponentSettings component={component} />
		case ComponentKind.Columns:
			return <ColumnsComponentSettings component={component} />
		case ComponentKind.Input:
			return <InputComponentSettings component={component} />
		case ComponentKind.Select:
			return <SelectComponentSettings component={component} />
		case ComponentKind.Textarea:
			return <TextareaComponentSettings component={component} />
		case ComponentKind.SubmitButton:
			return <SubmitButtonComponentSettings component={component} />
		case ComponentKind.Form:
			return <FormComponentSettings component={component} />
		default:
			return null
	}
}

function TextComponentSettings({ component }: { component: TextComponent }) {
	const editComponent = useCanvasStore((store) => store.editComponent)
	const value = component.data.text ?? ''

	// These effects are to ensure that the component is updated when the value changes
	// as rich text editor doesn't force value
	const [hide, setHide] = useState(false)
	useDidUpdate(() => {
		setHide(true)
	}, [component.id])
	useDidUpdate(() => {
		if (hide) setHide(false)
	}, [hide])
	if (hide) return null

	return (
		<RichTextEditor
			value={value}
			onChange={(value) => editComponent(component.id, { ...component.data, text: value })}
			controls={[
				['bold', 'strike', 'italic', 'underline', 'clean'],
				['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
				['link', 'blockquote'],
				['sup', 'sub', 'code', 'codeBlock'],
				['alignLeft', 'alignCenter', 'alignRight'],
			]}
		/>
	)
}

function BoxComponentSettings({ component }: { component: BoxComponent }) {
	const viewport = useViewportStore((store) => store.device)
	const editStyle = useEditStyle(component)
	const selector = useAtomValue(selectedSelectorAtom)
	const backgroundColor = component.data.style[viewport][selector]?.backgroundColor

	return (
		<div className="space-y-6">
			<div>
				<p className="mb-1 text-base font-medium">Background</p>
				<ColorPicker
					format="hex"
					fullWidth
					value={backgroundColor}
					onChange={(newColor) =>
						editStyle({
							...component.data.style[viewport][selector],
							backgroundColor: newColor,
						})
					}
				/>
			</div>
		</div>
	)
}

function ButtonComponentSettings({ component }: { component: ButtonComponent }) {
	const editComponent = useCanvasStore((store) => store.editComponent)
	const value = component.data.text ?? ''

	return (
		<TextInput
			label="Text"
			size="xs"
			value={value}
			onChange={(event) =>
				editComponent(component.id, { ...component.data, text: event.target.value })
			}
		/>
	)
}

function ImageComponentSettings({ component }: { component: ImageComponent }) {
	const selector = useAtomValue(selectedSelectorAtom)
	const viewport = useViewportStore((store) => store.device)
	const projectTag = useAtomValue(projectTagAtom)
	const uploadImageMutation = useMutation(uploadImage)
	const editComponent = useCanvasStore((store) => store.editComponent)
	const src = component.data.src
	const setImage = (src: string | null) => editComponent(component.id, { ...component.data, src })
	const bgSize = component.data.style[viewport][selector]?.backgroundSize?.toString() ?? 'cover'
	const bgPosition =
		component.data.style[viewport][selector]?.backgroundPosition?.toString() ?? 'cover'
	const altText = component.data.alt
	const editStyle = useEditStyle(component)

	const imagePart = src ? (
		<div>
			<CloseButton
				onClick={() => setImage(null)}
				mb="xs"
				size="xs"
				ml="auto"
				title="Clear image"
			/>
			<Image radius="xs" src={src} />
		</div>
	) : (
		<Dropzone
			onDrop={(files) =>
				uploadImageMutation.mutate(
					{ projectTag, image: files[0] },
					{ onSuccess: (data) => setImage(data.data.url) }
				)
			}
			accept={IMAGE_MIME_TYPE}
			loading={uploadImageMutation.isLoading}
		>
			<Group position="center" spacing="xl" py="xl" style={{ pointerEvents: 'none' }}>
				<Dropzone.Accept>
					<TbUpload />
				</Dropzone.Accept>
				<Dropzone.Reject>
					<TbX />
				</Dropzone.Reject>
				{!uploadImageMutation.isLoading && (
					<Dropzone.Idle>
						<TbPhoto size={50} />
					</Dropzone.Idle>
				)}
				{!uploadImageMutation.isLoading && (
					<p className="text-center">Drag an image here or click to select</p>
				)}
			</Group>
		</Dropzone>
	)

	return (
		<div className="space-y-6">
			{imagePart}
			<TextInput
				size="xs"
				label="Source"
				value={src ?? ''}
				onChange={(event) =>
					editComponent(component.id, {
						...component.data,
						src: event.target.value,
					})
				}
			/>
			<Select
				size="xs"
				label="Background size"
				data={[
					{ label: 'Cover', value: 'cover' },
					{ label: 'Contain', value: 'contain' },
				]}
				value={bgSize}
				onChange={(value) =>
					editStyle({
						...component.data.style[viewport][selector],
						backgroundSize: value ?? undefined,
					})
				}
			/>
			<Select
				size="xs"
				label="Background position"
				data={[
					'center',
					'top',
					'left',
					'right',
					'bottom',
					'top left',
					'top right',
					'bottom left',
					'bottom right',
				]}
				value={bgPosition}
				onChange={(value) =>
					editStyle({
						...component.data.style[viewport][selector],
						backgroundPosition: value ?? undefined,
					})
				}
			/>
			<TextInput
				size="xs"
				label="Alt text"
				value={altText}
				onChange={(event) =>
					editComponent(component.id, {
						...component.data,
						alt: event.target.value,
					})
				}
			/>
		</div>
	)
}

function ColumnsComponentSettings({ component }: { component: ColumnsComponent }) {
	const viewport = useViewportStore((store) => store.device)
	const editStyle = useEditStyle(component)
	const selector = useAtomValue(selectedSelectorAtom)
	const space = component.data.style[viewport][selector]?.gap as number

	return (
		<div>
			<NumberInput
				size="xs"
				label="Space"
				value={space}
				onChange={(value) =>
					editStyle({ ...component.data.style[viewport][selector], gap: value })
				}
			/>
		</div>
	)
}

function InputComponentSettings({ component }: { component: InputComponent }) {
	const editComponent = useCanvasStore((store) => store.editComponent)
	const { type, name, placeholder, defaultValue, required, value } = component.data
	const changeType = (type: string) => editComponent(component.id, { ...component.data, type })
	const changeName = (name: string) => editComponent(component.id, { ...component.data, name })
	const changePlaceholder = (placeholder: string) =>
		editComponent(component.id, { ...component.data, placeholder })
	const changeDefaultValue = (defaultValue: string) =>
		editComponent(component.id, { ...component.data, defaultValue })
	const changeRequired = (required: boolean) =>
		editComponent(component.id, { ...component.data, required })
	const changeValue = (value: string) => editComponent(component.id, { ...component.data, value })

	return (
		<div className="space-y-6">
			<Select
				size="xs"
				label="Type"
				data={[
					'text',
					'number',
					'email',
					'url',
					'checkbox',
					'radio',
					'range',
					'date',
					'datetime-local',
					'search',
					'tel',
					'time',
					'file',
					'month',
					'week',
					'password',
					'color',
					'hidden',
				]}
				value={type}
				onChange={(value) => changeType(value ?? 'text')}
			/>
			<TextInput
				size="xs"
				label="Name"
				value={name}
				onChange={(event) => changeName(event.target.value)}
			/>
			<TextInput
				size="xs"
				label="Placeholder"
				value={placeholder}
				onChange={(event) => changePlaceholder(event.target.value)}
			/>
			<TextInput
				size="xs"
				label="Default value"
				value={defaultValue}
				onChange={(event) => changeDefaultValue(event.target.value)}
			/>
			<Switch
				size="xs"
				label="Required"
				value={required.toString()}
				onChange={(event) => changeRequired(Boolean(event.target.value))}
			/>
			<TextInput
				size="xs"
				label="Value"
				value={value}
				onChange={(event) => changeValue(event.target.value)}
			/>
		</div>
	)
}

function SelectComponentSettings({ component }: { component: SelectComponent }) {
	const editComponent = useCanvasStore((store) => store.editComponent)
	const { options, name, defaultValue, required, value } = component.data
	const changeOptions = (options: { label: string; value: string; key: string }[]) =>
		editComponent(component.id, { ...component.data, options })
	const changeName = (name: string) => editComponent(component.id, { ...component.data, name })
	const changeDefaultValue = (defaultValue: string) =>
		editComponent(component.id, { ...component.data, defaultValue })
	const changeRequired = (required: boolean) =>
		editComponent(component.id, { ...component.data, required })
	const changeValue = (value: string) => editComponent(component.id, { ...component.data, value })

	return (
		<div className="space-y-6">
			<form className="space-y-4">
				{options.map((item, index) => (
					<div className="px-4 py-2 border rounded" key={item.key}>
						<CloseButton
							ml="auto"
							size="xs"
							onClick={() =>
								changeOptions(options.filter((option) => item.key !== option.key))
							}
						/>
						<TextInput
							size="xs"
							label="Label"
							mb="xs"
							value={options[index].label}
							onChange={(event) =>
								changeOptions(
									options.map((option) =>
										option.key === item.key
											? { ...option, label: event.target.value }
											: option
									)
								)
							}
						/>
						<TextInput
							size="xs"
							label="Value"
							value={options[index].value}
							onChange={(event) =>
								changeOptions(
									options.map((option) =>
										option.key === item.key
											? { ...option, value: event.target.value }
											: option
									)
								)
							}
						/>
					</div>
				))}
				<Button
					leftIcon={<TbPlus />}
					onClick={() =>
						changeOptions([...options, { label: '', value: '', key: uuid() }])
					}
					size="xs"
				>
					Option
				</Button>
			</form>
			<TextInput
				size="xs"
				label="Name"
				value={name}
				onChange={(event) => changeName(event.target.value)}
			/>
			<TextInput
				size="xs"
				label="Default value"
				value={defaultValue}
				onChange={(event) => changeDefaultValue(event.target.value)}
			/>
			<Switch
				size="xs"
				label="Required"
				value={required.toString()}
				onChange={(event) => changeRequired(Boolean(event.target.value))}
			/>
			<TextInput
				size="xs"
				label="Value"
				value={value}
				onChange={(event) => changeValue(event.target.value)}
			/>
		</div>
	)
}

function TextareaComponentSettings({ component }: { component: TextareaComponent }) {
	const editComponent = useCanvasStore((store) => store.editComponent)
	const { name, placeholder, defaultValue, required, value } = component.data
	const changeName = (name: string) => editComponent(component.id, { ...component.data, name })
	const changePlaceholder = (placeholder: string) =>
		editComponent(component.id, { ...component.data, placeholder })
	const changeDefaultValue = (defaultValue: string) =>
		editComponent(component.id, { ...component.data, defaultValue })
	const changeRequired = (required: boolean) =>
		editComponent(component.id, { ...component.data, required })
	const changeValue = (value: string) => editComponent(component.id, { ...component.data, value })

	return (
		<div className="space-y-6">
			<TextInput
				label="Name"
				value={name}
				onChange={(event) => changeName(event.target.value)}
				size="xs"
			/>
			<TextInput
				label="Placeholder"
				value={placeholder}
				onChange={(event) => changePlaceholder(event.target.value)}
				size="xs"
			/>
			<TextInput
				label="Default value"
				value={defaultValue}
				onChange={(event) => changeDefaultValue(event.target.value)}
				size="xs"
			/>
			<Switch
				label="Required"
				value={required.toString()}
				onChange={(event) => changeRequired(Boolean(event.target.value))}
				size="xs"
			/>
			<TextInput
				label="Value"
				value={value}
				onChange={(event) => changeValue(event.target.value)}
				size="xs"
			/>
		</div>
	)
}

function SubmitButtonComponentSettings({ component }: { component: SubmitButtonComponent }) {
	const editComponent = useCanvasStore((store) => store.editComponent)
	const value = component.data.text ?? ''

	return (
		<TextInput
			size="xs"
			label="Text"
			value={value}
			onChange={(event) =>
				editComponent(component.id, { ...component.data, text: event.target.value })
			}
		/>
	)
}

function FormComponentSettings({ component }: { component: FormComponent }) {
	const { editComponent, editEvent, addEvent } = useCanvasStore((store) => ({
		editComponent: store.editComponent,
		editEvent: store.editComponentEvent,
		addEvent: store.addComponentEvent,
	}))
	const dataSources = useDataSourceStore((store) => store.sources)
	const dataSource = dataSources.find(
		(source) => source.stateName === component.data.dataSourceName
	)
	const hasDataSource = !!dataSource
	const removeDataSource = useDataSourceStore((store) => store.remove)
	const submitEvent = component.events.filter((event) => event.kind === EventKind.Submit)[0]
	const submitActions = submitEvent?.actions ?? []
	const changeOrAddEvent = (newEvent: ComponentEvent) => {
		if (submitEvent) editEvent(component.id, newEvent)
		else addEvent(component.id, { ...newEvent, id: uuid(), kind: EventKind.Submit })
	}
	const addAction = (kind: ActionKind) => {
		const action = getActionDefaultValue(kind)
		switch (kind) {
			case ActionKind.Code:
				changeOrAddEvent({ ...submitEvent, actions: [...submitActions, action] })
				break
			case ActionKind.ToggleState:
				changeOrAddEvent({ ...submitEvent, actions: [...submitActions, action] })
				break
			case ActionKind.SetState:
				changeOrAddEvent({ ...submitEvent, actions: [...submitActions, action] })
				break
			case ActionKind.Fetch:
				changeOrAddEvent({ ...submitEvent, actions: [...submitActions, action] })
				break
		}
	}

	const openActionSettings = (action: Action) => {
		switch (action.kind) {
			case ActionKind.Code:
				openModal({
					children: (
						<CodeEditor
							defaultValue={action.code}
							onChange={(code) =>
								changeOrAddEvent({
									...submitEvent,
									actions: submitActions.map((a) =>
										a.id === action.id ? { ...a, code } : a
									),
								})
							}
						/>
					),
					size: 'xl',
					closeOnEscape: false,
				})
				break
			case ActionKind.ToggleState:
				openModal({
					title: 'Toggle State',
					children: (
						<ToggleStateSettings
							defaultValue={action.name}
							onChange={(name) =>
								changeOrAddEvent({
									...submitEvent,
									actions: submitActions.map((a) =>
										a.id === action.id ? { ...a, name } : a
									),
								})
							}
						/>
					),
				})
				break
			case ActionKind.SetState:
				openModal({
					title: 'Set State',
					children: (
						<SetStateSettings
							defaultValue={{ name: action.name, value: action.valueToSet }}
							onChange={({
								name,
								value,
							}: {
								name: string
								value: string | number | boolean
							}) =>
								changeOrAddEvent({
									...submitEvent,
									actions: submitActions.map((a) =>
										a.id === action.id
											? {
													...a,
													kind: ActionKind.SetState,
													name,
													valueToSet: value,
											  }
											: a
									),
								})
							}
						/>
					),
				})
				break
			case ActionKind.Fetch:
				openModal({
					title: 'Fetch',
					children: (
						<FetchSettings
							initialValues={action}
							onSave={(values) => {
								changeOrAddEvent({
									...submitEvent,
									actions: submitActions.map((a) =>
										a.id === action.id ? values : a
									),
								})
								closeAllModals()
							}}
						/>
					),
				})
				break
		}
	}

	const actions = submitActions.map((action) => (
		<div key={action.id} className="flex items-center gap-1">
			<Button
				size="xs"
				fullWidth
				variant="outline"
				onClick={() => openActionSettings(action)}
			>
				{action.kind}
			</Button>
			<CloseButton
				size="xs"
				onClick={() =>
					changeOrAddEvent({
						...submitEvent,
						actions: submitActions.filter((a) => action.id !== a.id),
					})
				}
			/>
		</div>
	))

	return (
		<div>
			<Divider label="Request Handler" mb="xs" />
			{!hasDataSource && (
				<Button
					size="xs"
					mt="md"
					onClick={() =>
						openModal({
							title: 'Add Request',
							children: (
								<DataSourceForm
									mode="simple-add"
									initialValues={dataSource}
									onSuccess={(values) =>
										editComponent(component.id, {
											...component.data,
											dataSourceName: values.stateName,
										})
									}
								/>
							),
						})
					}
					leftIcon={<TbPlus />}
				>
					Request
				</Button>
			)}
			{hasDataSource && (
				<div className="space-y-2">
					<div className="flex items-center justify-end gap-1">
						<ActionIcon
							size="xs"
							onClick={() =>
								openModal({
									title: 'Add Request',
									children: (
										<DataSourceForm
											mode="simple-edit"
											initialValues={dataSource}
											onSuccess={(values) =>
												editComponent(component.id, {
													...component.data,
													dataSourceName: values.stateName,
												})
											}
										/>
									),
								})
							}
						>
							<TbEdit />
						</ActionIcon>
						<CloseButton
							size="xs"
							onClick={() => {
								removeDataSource(dataSource.id)
								editComponent(component.id, {
									...component.data,
									dataSourceName: '',
								})
							}}
						/>
					</div>
					<div className="flex items-center gap-2">
						<Text color="dimmed" size="xs" className="w-8 shrink-0">
							Name
						</Text>
						<Code className="grow">{dataSource.stateName}</Code>
					</div>
				</div>
			)}

			<Divider label="Actions" mt="xl" mb="xs" />
			<div className="space-y-2">{actions}</div>
			<Menu shadow="sm" width={200} position="bottom-end">
				<Menu.Target>
					<Button leftIcon={<TbPlus />} size="xs" mt="md">
						Action
					</Button>
				</Menu.Target>

				<Menu.Dropdown>
					{actionKinds.map((kind) => (
						<Menu.Item key={kind} onClick={() => addAction(kind)}>
							{kind}
						</Menu.Item>
					))}
				</Menu.Dropdown>
			</Menu>
		</div>
	)
}

const useEditStyle = (component: Component | null) => {
	const editComponent = useCanvasStore((store) => store.editComponent)
	const viewport = useViewportStore((store) => store.device)
	const selector = useAtomValue(selectedSelectorAtom)

	const editStyle = (style: CSSProperties) => {
		if (!component) return
		editComponent(component.id, {
			...component.data,
			style: {
				...component.data.style,
				[viewport]: { ...component.data.style[viewport], [selector]: style },
			},
		})
	}

	return editStyle
}
