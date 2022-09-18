import {
	ActionIcon,
	Button,
	CloseButton,
	Code,
	ColorInput,
	Divider,
	Group,
	Image,
	Menu,
	NumberInput,
	SegmentedControl,
	Select,
	Switch,
	Tabs,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core'
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { closeAllModals, openModal } from '@mantine/modals'
import { useMutation } from '@tanstack/react-query'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { CSSProperties, useEffect, useMemo, useState } from 'react'
import {
	TbArrowsHorizontal,
	TbDatabase,
	TbDroplet,
	TbEdit,
	TbLayoutAlignCenter,
	TbLayoutAlignLeft,
	TbLayoutAlignRight,
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
	DividerComponent,
	EventKind,
	FormComponent,
	ImageComponent,
	InputComponent,
	LinkComponent,
	SelectComponent,
	StackComponent,
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
import { getDefaultComponent } from './default-values'
import { projectTagAtom } from './project-atom'
import {
	BordersEditor,
	CollapseLine,
	EditStyle,
	getStyleNumber,
	InputWithUnit,
	SizeEditor,
	SpacingEditor,
	StylesEditor,
	toCenter,
	TypographyEditor,
} from './styles-editor'
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
	const styles =
		(selectedClassName
			? classNames[selectedClassName][viewport][selector]
			: selectedComponent.data.style[viewport][selector]) ?? {}
	const editClassStyle = (styles: CSSProperties) => {
		if (selectedClassName) editClassName(selectedClassName, viewport, selector, styles)
		else console.error("Can't edit class style without selected class name")
	}
	const editClassOrComponentStyle = selectedClassName ? editClassStyle : editStyle
	const editStyles: EditStyle = (style, value) => {
		editClassOrComponentStyle({ ...styles, [style]: value })
	}

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
					<ComponentSettingsShaper
						component={selectedComponent}
						styles={styles}
						editStyle={editStyles}
					/>
				</Tabs.Panel>
				<Tabs.Panel value="styles" pt="xs">
					<StylesEditor styles={styles} onChange={editClassOrComponentStyle} />
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

function ComponentSettingsShaper({
	component,
	editStyle,
	styles,
}: {
	component: Component
	styles: CSSProperties
	editStyle: EditStyle
}) {
	switch (component.kind) {
		case ComponentKind.Text:
			return (
				<TextComponentSettings
					component={component}
					editStyle={editStyle}
					styles={styles}
				/>
			)
		case ComponentKind.Box:
			return (
				<BoxComponentSettings component={component} editStyle={editStyle} styles={styles} />
			)
		case ComponentKind.Image:
			return (
				<ImageComponentSettings
					component={component}
					editStyle={editStyle}
					styles={styles}
				/>
			)
		case ComponentKind.Button:
			return (
				<ButtonComponentSettings
					component={component}
					editStyle={editStyle}
					styles={styles}
				/>
			)
		case ComponentKind.Columns:
			return (
				<ColumnsComponentSettings
					component={component}
					editStyle={editStyle}
					styles={styles}
				/>
			)
		case ComponentKind.Input:
			return <InputComponentSettings component={component} />
		case ComponentKind.Select:
			return <SelectComponentSettings component={component} />
		case ComponentKind.Textarea:
			return <InputComponentSettings component={component} />
		case ComponentKind.SubmitButton:
			return (
				<ButtonComponentSettings
					component={component}
					editStyle={editStyle}
					styles={styles}
				/>
			)
		case ComponentKind.Form:
			return <FormComponentSettings component={component} />
		case ComponentKind.Link:
			return <LinkComponentSettings component={component} />
		case ComponentKind.Stack:
			return (
				<StackComponentSettings
					component={component}
					editStyle={editStyle}
					styles={styles}
				/>
			)
		case ComponentKind.Divider:
			return (
				<DividerComponentSettings
					component={component}
					editStyle={editStyle}
					styles={styles}
				/>
			)
		default:
			return null
	}
}

function TextComponentSettings({
	component,
	editStyle,
	styles,
}: {
	component: TextComponent
	styles: CSSProperties
	editStyle: EditStyle
}) {
	const editComponentNoDebounce = useCanvasStore((store) => store.editComponent)
	const value = component.data.text ?? ''
	const [text, setText] = useStateFromProps(value)
	const editComponent = useMemo(
		() => _.debounce(editComponentNoDebounce, 300),
		[editComponentNoDebounce]
	)

	return (
		<div className="space-y-6">
			<Textarea
				label="Text"
				value={text}
				size="xs"
				onChange={(event) => {
					setText(event.target.value)
					editComponent(component.id, { ...component.data, text: event.target.value })
				}}
				autosize
				maxRows={10}
			/>
			<CollapseLine label="Typography">
				<TypographyEditor simple styles={styles} editStyle={editStyle} />
			</CollapseLine>
			<CollapseLine label="Spacing">
				<SpacingEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>
		</div>
	)
}

const shadows = [
	{
		label: 'extra small',
		value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
	},
	{
		label: 'small',
		value: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
	},
	{
		label: 'medium',
		value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);',
	},
	{
		label: 'large',
		value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
	},
	{
		label: 'extra large',
		value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
	},
]

function BoxComponentSettings({
	component,
	editStyle,
	styles,
}: {
	component: BoxComponent
	styles: CSSProperties
	editStyle: EditStyle
}) {
	const viewport = useViewportStore((store) => store.device)
	const editStyles = useEditStyle(component)
	const selector = useAtomValue(selectedSelectorAtom)
	const backgroundColor = component.data.style[viewport][selector]?.backgroundColor

	return (
		<div className="space-y-6">
			<ColorInput
				size="xs"
				format="hsla"
				label="Background"
				value={backgroundColor}
				onChange={(newColor) =>
					editStyles({
						...component.data.style[viewport][selector],
						backgroundColor: newColor,
					})
				}
			/>
			<CollapseLine label="Size">
				<SizeEditor simple styles={styles} editStyle={editStyle} />
			</CollapseLine>
			<CollapseLine label="Spacing">
				<SpacingEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>
			<CollapseLine label="Borders">
				<BordersEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>
			<Select
				size="xs"
				label="Shadow"
				data={shadows}
				allowDeselect
				value={styles.boxShadow}
				onChange={(value) => editStyle('boxShadow', value ?? '')}
			/>
		</div>
	)
}

function ButtonComponentSettings({
	component,
	editStyle,
	styles,
}: {
	component: ButtonComponent | SubmitButtonComponent
	styles: CSSProperties
	editStyle: EditStyle
}) {
	const editComponentNoDebounce = useCanvasStore((store) => store.editComponent)
	const editComponent = useMemo(
		() => _.debounce(editComponentNoDebounce, 300),
		[editComponentNoDebounce]
	)
	const value = component.data.text ?? ''
	const viewport = useViewportStore((store) => store.device)
	const editStyles = useEditStyle(component)
	const selector = useAtomValue(selectedSelectorAtom)
	const backgroundColor = component.data.style[viewport][selector]?.backgroundColor
	const [text, setText] = useStateFromProps(value)

	return (
		<div className="space-y-6">
			<TextInput
				label="Text"
				size="xs"
				value={text}
				onChange={(event) => {
					setText(event.target.value)
					editComponent(component.id, { ...component.data, text: event.target.value })
				}}
			/>
			<ColorInput
				size="xs"
				format="hsla"
				label="Background"
				value={backgroundColor}
				onChange={(newColor) =>
					editStyles({
						...component.data.style[viewport][selector],
						backgroundColor: newColor,
					})
				}
			/>
			<CollapseLine label="Size">
				<SizeEditor simple styles={styles} editStyle={editStyle} />
			</CollapseLine>
			<CollapseLine label="Spacing">
				<SpacingEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>
			<CollapseLine label="Borders">
				<BordersEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>
			<Select
				size="xs"
				label="Shadow"
				data={shadows}
				allowDeselect
				value={styles.boxShadow}
				onChange={(value) => editStyle('boxShadow', value ?? '')}
			/>
		</div>
	)
}

function ImageComponentSettings({
	component,
	editStyle,
	styles,
}: {
	component: ImageComponent
	styles: CSSProperties
	editStyle: EditStyle
}) {
	const selector = useAtomValue(selectedSelectorAtom)
	const viewport = useViewportStore((store) => store.device)
	const projectTag = useAtomValue(projectTagAtom)
	const uploadImageMutation = useMutation(uploadImage)
	const editComponentNoDebounce = useCanvasStore((store) => store.editComponent)
	const editComponent = useMemo(
		() => _.debounce(editComponentNoDebounce, 300),
		[editComponentNoDebounce]
	)
	const src = component.data.src ?? ''
	const setImage = (src: string | null) =>
		editComponentNoDebounce(component.id, { ...component.data, src })
	const bgSize = component.data.style[viewport][selector]?.backgroundSize?.toString() ?? 'cover'
	const bgPosition =
		component.data.style[viewport][selector]?.backgroundPosition?.toString() ?? 'cover'
	const altText = component.data.alt
	const editStyles = useEditStyle(component)
	const [source, setSource] = useStateFromProps(src)
	const [alt, setAlt] = useStateFromProps(altText)

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
				value={source}
				onChange={(event) => {
					setSource(source)
					editComponent(component.id, {
						...component.data,
						src: event.target.value,
					})
				}}
			/>
			<SizeEditor simple styles={styles} editStyle={editStyle} />

			<CollapseLine label="Spacing">
				<SpacingEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>

			<div className="grid items-center grid-cols-12 gap-y-2">
				<p className="col-span-3">Radius</p>
				<div className="col-span-9">
					<InputWithUnit
						value={styles.borderRadius?.toString()}
						onChange={(value) => editStyle('borderRadius', value)}
					/>
				</div>
			</div>

			<Select
				size="xs"
				label="Background size"
				data={[
					{ label: 'Cover', value: 'cover' },
					{ label: 'Contain', value: 'contain' },
				]}
				value={bgSize}
				onChange={(value) =>
					editStyles({
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
					editStyles({
						...component.data.style[viewport][selector],
						backgroundPosition: value ?? undefined,
					})
				}
			/>
			<TextInput
				size="xs"
				label="Alt text"
				value={alt}
				onChange={(event) => {
					setAlt(event.target.value)
					editComponent(component.id, {
						...component.data,
						alt: event.target.value,
					})
				}}
			/>
		</div>
	)
}

function ColumnsComponentSettings({
	component,
	editStyle,
	styles,
}: {
	component: ColumnsComponent
	styles: CSSProperties
	editStyle: EditStyle
}) {
	const viewport = useViewportStore((store) => store.device)
	const editStyles = useEditStyle(component)
	const selector = useAtomValue(selectedSelectorAtom)
	const space = getStyleNumber(component.data.style[viewport][selector]?.gap?.toString())
	const backgroundColor = component.data.style[viewport][selector]?.backgroundColor
	const addComponent = useCanvasStore((store) => store.addComponent)

	const cols = styles.gridTemplateColumns?.toString().split(' ') ?? []
	return (
		<div className="space-y-6">
			<NumberInput
				size="xs"
				label="Space"
				value={space}
				onChange={(value) =>
					editStyles({ ...component.data.style[viewport][selector], gap: value + 'px' })
				}
			/>
			<div className="grid items-center grid-cols-12">
				<p className="col-span-3">Align</p>
				<SegmentedControl
					className="col-span-9"
					data={simpleFlexAligns}
					fullWidth
					size="xs"
					value={styles.alignItems ?? ''}
					onChange={(value) => editStyle('alignItems', value)}
				/>
			</div>

			<div className="grid items-center grid-cols-12">
				<p className="col-span-3">Justify</p>
				<SegmentedControl
					className="col-span-9"
					data={simpleFlexAligns}
					fullWidth
					size="xs"
					value={styles.justifyItems ?? ''}
					onChange={(value) => editStyle('justifyItems', value)}
				/>
			</div>

			<div>
				<Button
					mb="xs"
					size="xs"
					leftIcon={<TbPlus />}
					onClick={() => {
						editStyle('gridTemplateColumns', `${styles.gridTemplateColumns} 1fr`)
						addComponent(
							getDefaultComponent(ComponentKind.Box, uuid(), component.id),
							component.id
						)
					}}
				>
					Column
				</Button>
				<div className="space-y-1">
					{cols.map((col, index) => {
						const colNumber = getStyleNumber(col)
						return (
							<div className="flex items-center gap-1" key={index}>
								<NumberInput
									size="xs"
									placeholder="Width"
									title="Width"
									className="w-full"
									value={colNumber}
									rightSection={<p>fr</p>}
									onChange={(value) =>
										editStyle(
											'gridTemplateColumns',
											produce(cols, (draft) => {
												draft[index] = value + 'fr'
											}).join(' ')
										)
									}
								/>
								<CloseButton
									size="xs"
									onClick={() =>
										editStyle(
											'gridTemplateColumns',
											cols.filter((_, i) => i !== index).join(' ')
										)
									}
								/>
							</div>
						)
					})}
				</div>
			</div>
			<ColorInput
				size="xs"
				format="hsla"
				label="Background"
				value={backgroundColor}
				onChange={(newColor) =>
					editStyles({
						...component.data.style[viewport][selector],
						backgroundColor: newColor,
					})
				}
			/>
			<CollapseLine label="Spacing">
				<SpacingEditor styles={styles} editStyle={editStyle} />
			</CollapseLine>
		</div>
	)
}

function InputComponentSettings({ component }: { component: InputComponent | TextareaComponent }) {
	const editComponentNoDebounce = useCanvasStore((store) => store.editComponent)
	const editComponent = useMemo(
		() => _.debounce(editComponentNoDebounce, 300),
		[editComponentNoDebounce]
	)
	const changeType = (type: string) =>
		editComponentNoDebounce(component.id, { ...component.data, type })
	const changeRequired = (required: boolean) =>
		editComponentNoDebounce(component.id, { ...component.data, required })

	const [name, setName] = useStateFromProps(component.data.name)
	const [placeholder, setPlaceholder] = useStateFromProps(component.data.placeholder)
	const [defaultValue, setDefaultValue] = useStateFromProps(component.data.value)
	const changeName = (name: string) => {
		setName(name)
		editComponent(component.id, { ...component.data, name })
	}
	const changePlaceholder = (placeholder: string) => {
		setPlaceholder(placeholder)
		editComponent(component.id, { ...component.data, placeholder })
	}
	const changeDefaultValue = (defaultValue: string) => {
		setDefaultValue(defaultValue)
		editComponent(component.id, { ...component.data, defaultValue })
	}

	return (
		<div className="space-y-6">
			{component.kind === ComponentKind.Input && (
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
					value={component.data.type}
					onChange={(value) => changeType(value ?? 'text')}
				/>
			)}
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
				checked={component.data.required}
				onChange={(event) => changeRequired(event.currentTarget.checked)}
			/>
		</div>
	)
}

function SelectComponentSettings({ component }: { component: SelectComponent }) {
	const editComponentNoDebounce = useCanvasStore((store) => store.editComponent)
	const editComponent = useMemo(
		() => _.debounce(editComponentNoDebounce, 300),
		[editComponentNoDebounce]
	)
	const { options, required } = component.data
	const changeOptions = (options: { label: string; value: string; key: string }[]) =>
		editComponentNoDebounce(component.id, { ...component.data, options })
	const changeName = (name: string) => {
		setName(name)
		editComponent(component.id, { ...component.data, name })
	}
	const changeDefaultValue = (defaultValue: string) => {
		setDefaultValue(defaultValue)
		editComponent(component.id, { ...component.data, defaultValue })
	}
	const changeRequired = (required: boolean) =>
		editComponentNoDebounce(component.id, { ...component.data, required })

	const [name, setName] = useStateFromProps(component.data.name)
	const [defaultValue, setDefaultValue] = useStateFromProps(component.data.defaultValue)

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
		</div>
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
							onChange={(name) => {
								changeOrAddEvent({
									...submitEvent,
									actions: submitActions.map((a) =>
										a.id === action.id ? { ...a, name } : a
									),
								})
								closeAllModals()
							}}
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

function LinkComponentSettings({ component }: { component: LinkComponent }) {
	const editComponentNoDebounce = useCanvasStore((store) => store.editComponent)
	const editComponent = useMemo(
		() => _.debounce(editComponentNoDebounce, 300),
		[editComponentNoDebounce]
	)
	const [url, setUrl] = useStateFromProps(component.data.href)

	return (
		<div className="space-y-6">
			<TextInput
				size="xs"
				label="Link URL"
				value={url}
				onChange={(event) => {
					setUrl(event.target.value)
					editComponent(
						component.id,
						produce(component.data, (draft) => {
							draft.href = event.target.value
						})
					)
				}}
			/>
			<Switch
				size="xs"
				label="Open in new tab"
				checked={component.data.openInNewTab}
				onChange={(event) =>
					editComponentNoDebounce(
						component.id,
						produce(component.data, (draft) => {
							draft.openInNewTab = event.currentTarget.checked
						})
					)
				}
			/>
		</div>
	)
}

const simpleFlexAligns = [
	{ label: <TbLayoutAlignLeft />, title: 'Start', value: 'flex-start' },
	{ label: <TbLayoutAlignCenter />, title: 'Center', value: 'center' },
	{ label: <TbLayoutAlignRight />, title: 'End', value: 'flex-end' },
	{ label: <TbArrowsHorizontal />, title: 'Stretch', value: 'stretch' },
].map(toCenter)

function StackComponentSettings({
	editStyle,
	styles,
}: {
	component: StackComponent
	styles: CSSProperties
	editStyle: EditStyle
}) {
	return (
		<div className="space-y-6">
			<InputWithUnit
				value={styles.gap?.toString()}
				onChange={(value) => editStyle('gap', value)}
				label="Gap"
			/>
			<div className="flex items-center gap-4">
				<p>Align</p>
				<SegmentedControl
					data={simpleFlexAligns}
					className="grow"
					fullWidth
					size="xs"
					value={styles.alignItems ?? ''}
					onChange={(value) => editStyle('alignItems', value)}
				/>
			</div>
			<CollapseLine label="Spacing">
				<SpacingEditor editStyle={editStyle} styles={styles} />
			</CollapseLine>
			<Select
				size="xs"
				label="Shadow"
				data={shadows}
				allowDeselect
				value={styles.boxShadow}
				onChange={(value) => editStyle('boxShadow', value ?? '')}
			/>
		</div>
	)
}

function DividerComponentSettings({
	editStyle,
	styles,
}: {
	component: DividerComponent
	styles: CSSProperties
	editStyle: EditStyle
}) {
	return (
		<div className="space-y-6">
			<InputWithUnit
				value={styles.height?.toString()}
				onChange={(value) => editStyle('height', value)}
				label="Thickness"
			/>
			<ColorInput
				size="xs"
				format="hsla"
				label="Color"
				value={styles.backgroundColor}
				onChange={(newColor) => editStyle('backgroundColor', newColor)}
			/>
		</div>
	)
}

const useEditStyle = (component: Component | null) => {
	const editComponentNoDebounce = useCanvasStore((store) => store.editComponent)
	const viewport = useViewportStore((store) => store.device)
	const selector = useAtomValue(selectedSelectorAtom)

	const editComponent = useMemo(
		() => _.debounce(editComponentNoDebounce, 300),
		[editComponentNoDebounce]
	)

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

function useStateFromProps<T>(value: T) {
	const [state, setState] = useState(value)

	useEffect(() => {
		setState(value)
	}, [value])

	return [state, setState] as const
}
