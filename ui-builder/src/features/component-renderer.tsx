import { clsx, Image, Popover, Text, TypographyStylesProvider } from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import axios from 'axios'
import _ from 'lodash'
import { CSSProperties, ReactNode, useMemo, useState } from 'react'
import { JsonArray, JsonMap, safeParseToHeaders, safeParseToJson } from '../utils'
import {
	ActionKind,
	BindingKind,
	BoxComponent,
	ButtonComponent,
	CodeAction,
	ColumnsComponent,
	Component,
	ComponentEvent,
	ComponentKind,
	EventKind,
	FetchAction,
	ImageComponent,
	InputComponent,
	SelectComponent,
	SetStateAction,
	Style,
	SubmitButtonComponent,
	TextareaComponent,
	TextComponent,
	ToggleStateAction,
	useCanvasStore,
} from './canvas-store'
import { useDataSourceStore } from './data-source-store'
import { Draggable, DraggableMode } from './draggable'
import { Droppable, DroppableMode } from './droppable'
import { usePageStates } from './page-states'
import { useSelectionStore } from './selection-store'
import { useViewportStore, ViewportDevice } from './viewport-store'

export function RenderComponents({
	components,
	index,
	state,
}: {
	components: Component[]
	index?: number
	state: JsonMap
}) {
	const states = usePageStates((store) => store.states)

	return (
		<>
			{components.map((component) => {
				let repeated = null
				if (component.repeatFrom.name) {
					const repeatedState =
						(_.get(states, component.repeatFrom.name) as JsonArray) ?? []
					repeated = repeatedState.map((itemState, index) => (
						<ComponentShaper
							key={index}
							component={component}
							state={{ ...state, [component.repeatFrom.iterator]: itemState }}
						/>
					))
				}

				return (
					<ComponentWrapper key={component.id} component={component}>
						{repeated ? (
							repeated
						) : (
							<ComponentShaper component={component} index={index} state={state} />
						)}
					</ComponentWrapper>
				)
			})}
		</>
	)
}

export function TextRenderer({
	component,
	state,
}: {
	component: TextComponent
	index?: number
	state: JsonMap
}) {
	console.log(state)

	const states = usePageStates((store) => store.states)
	const allStates = { ...states, ...state }
	const stateText =
		component.bindings
			.filter((binding) => binding.kind === BindingKind.Text)
			.map((binding) => _.get(allStates, binding.fromStateName))
			.filter((text) => !!text)[0] ?? ''
	const viewport = useViewportStore((store) => store.device)
	const text = (stateText.toString() || component.data.text) ?? '<br />'

	return (
		<div className="overflow-auto" style={combineStyles(viewport, component.data.style)}>
			<TypographyStylesProvider>
				<div dangerouslySetInnerHTML={{ __html: text }} />
			</TypographyStylesProvider>
		</div>
	)
}

export function BoxRenderer({
	component,
	index,
	state,
}: {
	component: BoxComponent
	index?: number
	state: JsonMap
}) {
	const viewport = useViewportStore((store) => store.device)

	return (
		<div className="p-10" style={combineStyles(viewport, component.data.style)}>
			<RenderComponents components={component.components} index={index} state={state} />
		</div>
	)
}

export function ButtonRenderer({ component }: { component: ButtonComponent; index?: number }) {
	const viewport = useViewportStore((store) => store.device)

	return (
		<button style={combineStyles(viewport, component.data.style)}>{component.data.text}</button>
	)
}

export function ColumnsRenderer({
	component,
	index,
	state,
}: {
	component: ColumnsComponent
	index?: number
	state: JsonMap
}) {
	const viewport = useViewportStore((store) => store.device)

	return (
		<div style={combineStyles(viewport, component.data.style)}>
			{component.components.map((component) => (
				<div
					key={component.id}
					className={clsx(
						'grow',
						component.data.style[viewport].flexDirection === 'column' && 'w-0'
					)}
				>
					<ComponentWrapper component={component}>
						<ComponentShaper component={component} index={index} state={state} />
					</ComponentWrapper>
				</div>
			))}
		</div>
	)
}

export function ImageRenderer({ component }: { component: ImageComponent; index?: number }) {
	const viewport = useViewportStore((store) => store.device)
	const imageUrl = useMemo(
		() => (component.data.image ? URL.createObjectURL(component.data.image) : undefined),
		[component.data.image]
	)

	if (!imageUrl) return <Image height={120} withPlaceholder />

	return (
		<img
			src={imageUrl}
			alt={component.data.altText}
			style={combineStyles(viewport, component.data.style)}
		/>
	)
}

export function InputRenderer({ component }: { component: InputComponent; index?: number }) {
	const viewport = useViewportStore((store) => store.device)
	return (
		<input
			className="disabled:bg-transparent"
			disabled
			style={combineStyles(viewport, component.data.style)}
			name={component.data.name}
			placeholder={component.data.placeholder}
			required={component.data.required}
			type={component.data.type}
			value={component.data.value || component.data.defaultValue}
		/>
	)
}

export function SelectRenderer({ component }: { component: SelectComponent; index?: number }) {
	const viewport = useViewportStore((store) => store.device)
	return (
		<select
			name={component.data.name}
			required={component.data.required}
			className="w-full"
			style={combineStyles(viewport, component.data.style)}
		>
			{component.data.options.map((option, index) => (
				<option key={index} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	)
}

export function TextareaRenderer({ component }: { component: TextareaComponent; index?: number }) {
	const viewport = useViewportStore((store) => store.device)
	return (
		<textarea
			placeholder={component.data.placeholder}
			value={component.data.value || component.data.defaultValue}
			style={combineStyles(viewport, component.data.style)}
		/>
	)
}

export function SubmitButtonRenderer({
	component,
}: {
	component: SubmitButtonComponent
	index?: number
}) {
	const viewport = useViewportStore((store) => store.device)
	return (
		<button type="submit" style={combineStyles(viewport, component.data.style)}>
			{component.data.text}
		</button>
	)
}

function ComponentShaper({
	component,
	index,
	state,
}: {
	component: Component
	index?: number
	state: JsonMap
}) {
	switch (component.kind) {
		case ComponentKind.Text:
			return <TextRenderer component={component} index={index} state={state} />
		case ComponentKind.Box:
			return (
				<Droppable
					data={{ mode: DroppableMode.InsertIn, componentId: component.id }}
					id={component.id}
				>
					<BoxRenderer component={component} index={index} state={state} />
				</Droppable>
			)
		case ComponentKind.Button:
			return <ButtonRenderer component={component} index={index} />
		case ComponentKind.Columns:
			return (
				<Droppable
					data={{ mode: DroppableMode.InsertIn, componentId: component.id }}
					id={component.id}
				>
					<ColumnsRenderer component={component} index={index} state={state} />
				</Droppable>
			)
		case ComponentKind.Image:
			return <ImageRenderer component={component} index={index} />
		case ComponentKind.Input:
			return <InputRenderer component={component} index={index} />
		case ComponentKind.Select:
			return <SelectRenderer component={component} index={index} />
		case ComponentKind.Textarea:
			return <TextareaRenderer component={component} index={index} />
		case ComponentKind.SubmitButton:
			return <SubmitButtonRenderer component={component} index={index} />
		default:
			return null
	}
}

function ComponentWrapper({ children, component }: { children: ReactNode; component: Component }) {
	const { setSelectedComponent, selectedComponentId, hoveredId } = useSelectionStore((store) => ({
		setSelectedComponent: store.select,
		selectedComponentId: store.selectedId,
		hoveredId: store.hoveredId,
	}))
	const dataSources = useDataSourceStore((store) => store.sources)
	const deleteComponent = useCanvasStore((store) => store.deleteComponent)
	const [hovered, setHovered] = useState(false)
	const handleDelete = () => {
		if (selectedComponentId) deleteComponent(selectedComponentId)
	}
	useHotkeys([['Backspace', handleDelete]])
	const { states, toggleState, setState } = usePageStates((store) => ({
		states: store.states,
		toggleState: store.toggleState,
		setState: store.setState,
	}))
	const isSelected = component.id === selectedComponentId || hovered || hoveredId === component.id

	const handleEvents = (kind: EventKind) => {
		evalCodes(component.events, kind)

		component.events
			.filter((event) => event.kind === kind)
			.flatMap((event) => event.actions)
			.filter(
				(action): action is ToggleStateAction | SetStateAction =>
					action.kind === ActionKind.ToggleState || action.kind === ActionKind.SetState
			)
			.forEach((action) => {
				switch (action.kind) {
					case ActionKind.ToggleState:
						toggleState(action.name)
						break
					case ActionKind.SetState:
						setState(action.name, action.valueToSet)
						break
				}
			})

		component.events
			.filter((event) => event.kind === kind)
			.flatMap((event) => event.actions)
			.filter((action): action is FetchAction => action.kind === ActionKind.Fetch)
			.forEach((action) => {
				const dataSource = dataSources.find(
					(source) => source.stateName === action.dataSourceName
				)
				if (!dataSource)
					return console.error(`Data source ${action.dataSourceName} not found`)
				axios.request({
					method: dataSource.method,
					url: dataSource.url,
					headers: safeParseToHeaders(dataSource.headers),
					data: safeParseToJson(action.body || dataSource.body),
					params: action.params,
				})
			})
	}

	const shouldShow = component.bindings
		.filter((binding) => binding.kind === BindingKind.Show)
		.some((binding) => _.get(states, binding.fromStateName))

	const shouldHide = component.bindings
		.filter((binding) => binding.kind === BindingKind.Hide)
		.some((binding) => _.get(states, binding.fromStateName))

	const link =
		component.bindings
			.filter((binding) => binding.kind === BindingKind.Link)
			.map((binding) => _.get(states, binding.fromStateName))
			.filter((link) => !!link)[0] ?? ''

	return (
		<Draggable id={component.id} data={{ mode: DraggableMode.Move, componentId: component.id }}>
			<Popover
				opened={isSelected}
				transitionDuration={0}
				shadow="xs"
				zIndex={150}
				positionDependencies={[component]}
			>
				<Popover.Target>
					<div
						id={component.id}
						className={clsx(
							'outline-1 cursor-default relative',
							isSelected && 'outline z-10'
						)}
						onMouseOver={(event) => {
							event.stopPropagation()
							setHovered(true)
						}}
						onMouseOut={(event) => {
							event.stopPropagation()
							setHovered(false)
						}}
						onClick={(event) => {
							event.stopPropagation()
							setSelectedComponent(component.id)
						}}
						hidden={!shouldShow && shouldHide}
					>
						<div
							onClick={() => handleEvents(EventKind.Click)}
							onMouseEnter={() => handleEvents(EventKind.MouseEnter)}
							onMouseLeave={() => handleEvents(EventKind.MouseLeave)}
							onKeyDown={() => handleEvents(EventKind.KeyDown)}
							onChange={() => handleEvents(EventKind.Change)}
							onSubmit={() => handleEvents(EventKind.Submit)}
						>
							{link ? <a href={link.toString()}>{children}</a> : children}
						</div>
						<Droppable
							data={{ mode: DroppableMode.InsertBefore, componentId: component.id }}
							id={`${component.id}-before-drop`}
							className="absolute top-0 left-0 right-0 z-10 h-4 pointer-events-none"
						/>
						<Droppable
							data={{ mode: DroppableMode.InsertAfter, componentId: component.id }}
							id={`${component.id}-after-drop`}
							className="absolute bottom-0 left-0 right-0 z-10 h-4 pointer-events-none"
						/>
					</div>
				</Popover.Target>
				<Popover.Dropdown className="!px-2 !py-1">
					<Text size="xs">{component.kind}</Text>
				</Popover.Dropdown>
			</Popover>
		</Draggable>
	)
}

const combineStyles = (viewport: ViewportDevice, style: Style): CSSProperties => {
	switch (viewport) {
		case 'desktop':
			return style.desktop
		case 'tablet':
			return { ...style.desktop, ...style.tablet }
		case 'mobile':
			return { ...style.desktop, ...style.tablet, ...style.mobile }
	}
}

const evalCodes = (events: ComponentEvent[], kind: EventKind) => {
	events
		.filter((event) => event.kind === kind)
		.flatMap((event) => event.actions)
		.filter((action): action is CodeAction => action.kind === ActionKind.Code)
		.map((action) => action.code)
		.forEach(eval)
}
