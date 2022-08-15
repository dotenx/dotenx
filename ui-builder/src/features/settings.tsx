import {
	Button,
	CloseButton,
	ColorPicker,
	Group,
	Image,
	NumberInput,
	Select,
	Switch,
	Tabs,
	TextInput,
} from '@mantine/core'
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { useDidUpdate } from '@mantine/hooks'
import RichTextEditor from '@mantine/rte'
import cssProperties from 'known-css-properties'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import { CSSProperties, useState } from 'react'
import { TbDatabase, TbDroplet, TbPhoto, TbPlus, TbRuler, TbUpload, TbX } from 'react-icons/tb'
import {
	BoxComponent,
	ButtonComponent,
	ColumnsComponent,
	Component,
	ComponentKind,
	findComponent,
	ImageComponent,
	InputComponent,
	SelectComponent,
	SubmitButtonComponent,
	TextareaComponent,
	TextComponent,
	useCanvasStore,
} from './canvas-store'
import { DataEditor } from './data-editor'
import { useSelectionStore } from './selection-store'
import { useViewportStore } from './viewport-store'

const normalizedCssProperties = cssProperties.all.map((property) =>
	property
		.split('-')
		.map((part, index) => (index !== 0 ? _.capitalize(part) : part))
		.join('')
)

export function Settings() {
	const components = useCanvasStore((store) => store.components)
	const selectedComponentId = useSelectionStore((store) => store.selectedId)
	const viewport = useViewportStore((store) => store.device)
	const selectedComponent = findComponent(selectedComponentId ?? '', components)
	const editStyle = useEditStyle(selectedComponent)

	if (!selectedComponentId) return <UnselectedMessage />
	if (!selectedComponent) return <UnselectedMessage />

	return (
		<div className="flex flex-col gap-4 text-xs">
			<p className="text-lg font-bold">{selectedComponent.kind}</p>
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
					<StylesEditor
						style={selectedComponent.data.style[viewport]}
						onChange={editStyle}
					/>
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
				// ['unorderedList', 'orderedList'], TODO: add list support
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
	const backgroundColor = component.data.style[viewport].backgroundColor

	return (
		<div className="space-y-6">
			<div>
				<p className="font-medium text-base mb-1">Background</p>
				<ColorPicker
					format="hex"
					value={backgroundColor}
					onChange={(newColor) =>
						editStyle({ ...component.data.style[viewport], backgroundColor: newColor })
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
			value={value}
			onChange={(event) =>
				editComponent(component.id, { ...component.data, text: event.target.value })
			}
		/>
	)
}

function ImageComponentSettings({ component }: { component: ImageComponent }) {
	const editComponent = useCanvasStore((store) => store.editComponent)
	const image = component.data.image
	const setImage = (image: File | null) =>
		editComponent(component.id, { ...component.data, image })
	const bgSize = (component.data.style.desktop.backgroundSize as string) ?? 'cover'
	const bgPosition = (component.data.style.desktop.backgroundPosition as string) ?? 'cover'
	const altText = component.data.altText
	const viewport = useViewportStore((store) => store.device)
	const editStyle = useEditStyle(component)

	const imagePart = image ? (
		<div>
			<CloseButton onClick={() => setImage(null)} mb="xs" title="Clear image" />
			<Image src={URL.createObjectURL(image)} />
		</div>
	) : (
		<Dropzone onDrop={(files) => setImage(files[0])} accept={IMAGE_MIME_TYPE}>
			<Group position="center" spacing="xl" style={{ pointerEvents: 'none' }}>
				<Dropzone.Accept>
					<TbUpload />
				</Dropzone.Accept>
				<Dropzone.Reject>
					<TbX />
				</Dropzone.Reject>
				<Dropzone.Idle>
					<TbPhoto size={50} />
				</Dropzone.Idle>
				<p>Drag an image here or click to select file</p>
			</Group>
		</Dropzone>
	)

	return (
		<div className="space-y-6">
			{imagePart}
			<Select
				label="Background size"
				data={[
					{ label: 'Cover', value: 'cover' },
					{ label: 'Contain', value: 'contain' },
				]}
				value={bgSize}
				onChange={(value) =>
					editStyle({
						...component.data.style[viewport],
						backgroundSize: value ?? undefined,
					})
				}
			/>
			<Select
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
						...component.data.style[viewport],
						backgroundPosition: value ?? undefined,
					})
				}
			/>
			<TextInput
				label="Alt text"
				value={altText}
				onChange={(event) =>
					editComponent(component.id, {
						...component.data,
						altText: event.target.value,
					})
				}
			/>
		</div>
	)
}

function ColumnsComponentSettings({ component }: { component: ColumnsComponent }) {
	const viewport = useViewportStore((store) => store.device)
	const editStyle = useEditStyle(component)
	const space = component.data.style[viewport].gap as number

	return (
		<div>
			<NumberInput
				label="Space"
				value={space}
				onChange={(value) => editStyle({ ...component.data.style[viewport], gap: value })}
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
				label="Name"
				value={name}
				onChange={(event) => changeName(event.target.value)}
			/>
			<TextInput
				label="Placeholder"
				value={placeholder}
				onChange={(event) => changePlaceholder(event.target.value)}
			/>
			<TextInput
				label="Default value"
				value={defaultValue}
				onChange={(event) => changeDefaultValue(event.target.value)}
			/>
			<Switch
				label="Required"
				value={required.toString()}
				onChange={(event) => changeRequired(Boolean(event.target.value))}
			/>
			<TextInput
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
					<div className="border px-4 py-2 rounded" key={item.key}>
						<CloseButton
							ml="auto"
							onClick={() =>
								changeOptions(options.filter((option) => item.key !== option.key))
							}
						/>
						<TextInput
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
						changeOptions([...options, { label: '', value: '', key: nanoid() }])
					}
				>
					Option
				</Button>
			</form>
			<TextInput
				label="Name"
				value={name}
				onChange={(event) => changeName(event.target.value)}
			/>
			<TextInput
				label="Default value"
				value={defaultValue}
				onChange={(event) => changeDefaultValue(event.target.value)}
			/>
			<Switch
				label="Required"
				value={required.toString()}
				onChange={(event) => changeRequired(Boolean(event.target.value))}
			/>
			<TextInput
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
			/>
			<TextInput
				label="Placeholder"
				value={placeholder}
				onChange={(event) => changePlaceholder(event.target.value)}
			/>
			<TextInput
				label="Default value"
				value={defaultValue}
				onChange={(event) => changeDefaultValue(event.target.value)}
			/>
			<Switch
				label="Required"
				value={required.toString()}
				onChange={(event) => changeRequired(Boolean(event.target.value))}
			/>
			<TextInput
				label="Value"
				value={value}
				onChange={(event) => changeValue(event.target.value)}
			/>
		</div>
	)
}

function SubmitButtonComponentSettings({ component }: { component: SubmitButtonComponent }) {
	const editComponent = useCanvasStore((store) => store.editComponent)
	const value = component.data.text ?? ''

	return (
		<TextInput
			value={value}
			onChange={(event) =>
				editComponent(component.id, { ...component.data, text: event.target.value })
			}
		/>
	)
}

function StylesEditor({
	style,
	onChange,
}: {
	style: CSSProperties
	onChange: (style: CSSProperties) => void
}) {
	const styles = _.toPairs(style)

	return (
		<div>
			<div className="space-y-4">
				{styles.map(([property, value]) => (
					<div className="flex gap-2 items-center" key={property}>
						<Select
							searchable
							creatable
							data={normalizedCssProperties}
							size="xs"
							value={property}
							onChange={(newProperty) => {
								const newStyles = _.fromPairs(
									styles.map(([p, v]) =>
										p === property ? [newProperty, v] : [p, v]
									)
								)
								onChange(newStyles)
							}}
						/>
						<TextInput
							size="xs"
							value={value}
							onChange={(event) => {
								onChange({ ...style, [property]: event.target.value })
							}}
						/>
						<CloseButton size="xs" onClick={() => onChange(_.omit(style, property))} />
					</div>
				))}
			</div>
			<Button
				leftIcon={<TbPlus />}
				onClick={() => {
					const newStyles = { ...style, '': '' }
					onChange(newStyles)
				}}
				size="xs"
				mt="md"
			>
				Property
			</Button>
		</div>
	)
}

const useEditStyle = (component: Component | null) => {
	const editComponent = useCanvasStore((store) => store.editComponent)
	const viewport = useViewportStore((store) => store.device)

	const editStyle = (style: CSSProperties) => {
		if (!component) return
		editComponent(component.id, {
			...component.data,
			style: {
				...component.data.style,
				[viewport]: style,
			},
		})
	}

	return editStyle
}
