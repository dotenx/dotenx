import { clsx, TypographyStylesProvider } from '@mantine/core'
import { getHotkeyHandler, useHotkeys } from '@mantine/hooks'
import axios from 'axios'
import _ from 'lodash'
import { CSSProperties, ReactNode, useState } from 'react'
import { TbPhoto } from 'react-icons/tb'
import { JsonArray, JsonMap, safeParseToHeaders, safeParseToJson } from '../utils'
import {
	ActionKind,
	BoxComponent,
	ButtonComponent,
	CodeAction,
	ColumnsComponent,
	Component,
	ComponentEvent,
	ComponentKind,
	EventKind,
	FetchAction,
	FormComponent,
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
import { getComponentIcon } from './component-selector'
import { useDataSourceStore } from './data-source-store'
import { Draggable, DraggableMode } from './draggable'
import { Droppable, DroppableMode } from './droppable'
import { usePageStates } from './page-states'
import { useSelectionStore } from './selection-store'
import { useViewportStore, ViewportDevice } from './viewport-store'

export function RenderComponents({
	components,
	state,
}: {
	components: Component[]
	state: JsonMap
}) {
	const globalStates = usePageStates((store) => store.states)

	return (
		<>
			{components.map((component) => {
				let repeated = null
				if (component.repeatFrom.name) {
					const repeatedState =
						(_.get(globalStates, component.repeatFrom.name) as JsonArray) ?? []
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
							<ComponentShaper component={component} state={state} />
						)}
					</ComponentWrapper>
				)
			})}
		</>
	)
}

function TextRenderer({ component, state }: { component: TextComponent; state: JsonMap }) {
	const states = usePageStates((store) => store.states)
	const allStates = { ...states, ...state }
	const textBinding = component.bindings.text
	const stateText = textBinding ? _.get(allStates, textBinding.fromStateName) ?? '' : ''
	const viewport = useViewportStore((store) => store.device)
	const text = (stateText.toString() || component.data.text) ?? '<br />'

	return (
		<div style={{ overflow: 'auto', ...combineStyles(viewport, component.data.style) }}>
			<TypographyStylesProvider>
				<div dangerouslySetInnerHTML={{ __html: text }} />
			</TypographyStylesProvider>
		</div>
	)
}

const emptyContainerStyle = { height: 100, border: '1px dashed black' }

function BoxRenderer({ component, state }: { component: BoxComponent; state: JsonMap }) {
	const viewport = useViewportStore((store) => store.device)
	const emptyStyle = component.components.length === 0 ? emptyContainerStyle : {}

	return (
		<div style={{ ...emptyStyle, ...combineStyles(viewport, component.data.style) }}>
			<RenderComponents components={component.components} state={state} />
		</div>
	)
}

function ButtonRenderer({ component }: { component: ButtonComponent }) {
	const viewport = useViewportStore((store) => store.device)

	return (
		<button style={combineStyles(viewport, component.data.style)}>{component.data.text}</button>
	)
}

function ColumnsRenderer({ component, state }: { component: ColumnsComponent; state: JsonMap }) {
	const viewport = useViewportStore((store) => store.device)
	const emptyStyle = component.components.length === 0 ? emptyContainerStyle : {}

	return (
		<div style={{ ...emptyStyle, ...combineStyles(viewport, component.data.style) }}>
			{component.components.map((component) => (
				<div
					key={component.id}
					className={clsx(
						'grow',
						component.data.style[viewport].flexDirection === 'column' && 'w-0'
					)}
				>
					<ComponentWrapper component={component}>
						<ComponentShaper component={component} state={state} />
					</ComponentWrapper>
				</div>
			))}
		</div>
	)
}

function ImageRenderer({ component }: { component: ImageComponent }) {
	const viewport = useViewportStore((store) => store.device)
	const imageUrl = component.data.src

	if (!imageUrl)
		return (
			<div
				style={{
					...emptyContainerStyle,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					color: '#334155',
				}}
			>
				<TbPhoto size={48} />
			</div>
		)

	return (
		<img
			src={imageUrl}
			alt={component.data.alt}
			style={{ display: 'flex', ...combineStyles(viewport, component.data.style) }}
		/>
	)
}

function InputRenderer({ component }: { component: InputComponent }) {
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

function SelectRenderer({ component }: { component: SelectComponent }) {
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

function TextareaRenderer({ component }: { component: TextareaComponent }) {
	const viewport = useViewportStore((store) => store.device)
	return (
		<textarea
			placeholder={component.data.placeholder}
			value={component.data.value || component.data.defaultValue}
			style={combineStyles(viewport, component.data.style)}
			readOnly
		/>
	)
}

export function SubmitButtonRenderer({ component }: { component: SubmitButtonComponent }) {
	const viewport = useViewportStore((store) => store.device)
	return (
		<button type="submit" style={combineStyles(viewport, component.data.style)}>
			{component.data.text}
		</button>
	)
}

function FormRenderer({ component, state }: { component: FormComponent; state: JsonMap }) {
	const viewport = useViewportStore((store) => store.device)
	const emptyStyle = component.components.length === 0 ? emptyContainerStyle : {}

	return (
		<form
			onSubmit={(e) => e.preventDefault()}
			style={{ ...emptyStyle, ...combineStyles(viewport, component.data.style) }}
		>
			<RenderComponents components={component.components} state={state} />
		</form>
	)
}

function ComponentShaper({ component, state }: { component: Component; state: JsonMap }) {
	switch (component.kind) {
		case ComponentKind.Text:
			return <TextRenderer component={component} state={state} />
		case ComponentKind.Box:
			return (
				<Droppable data={{ mode: DroppableMode.InsertIn, componentId: component.id }}>
					<BoxRenderer component={component} state={state} />
				</Droppable>
			)
		case ComponentKind.Button:
			return <ButtonRenderer component={component} />
		case ComponentKind.Columns:
			return (
				<Droppable data={{ mode: DroppableMode.InsertIn, componentId: component.id }}>
					<ColumnsRenderer component={component} state={state} />
				</Droppable>
			)
		case ComponentKind.Image:
			return <ImageRenderer component={component} />
		case ComponentKind.Input:
			return <InputRenderer component={component} />
		case ComponentKind.Select:
			return <SelectRenderer component={component} />
		case ComponentKind.Textarea:
			return <TextareaRenderer component={component} />
		case ComponentKind.SubmitButton:
			return <SubmitButtonRenderer component={component} />
		case ComponentKind.Form:
			return (
				<Droppable data={{ mode: DroppableMode.InsertIn, componentId: component.id }}>
					<FormRenderer component={component} state={state} />
				</Droppable>
			)
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
	const isHovered = hovered || hoveredId === component.id
	const isSelected = component.id === selectedComponentId
	const isHighlighted = isSelected || isHovered

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

	const bindings = component.bindings
	const shouldShow = bindings.show
		? (_.get(states, bindings.show.fromStateName) as boolean)
		: false
	const shouldHide = bindings.hide
		? (_.get(states, bindings.hide.fromStateName) as boolean)
		: false
	const link = bindings.link ? _.get(states, bindings.link.fromStateName) : ''

	return (
		<Draggable data={{ mode: DraggableMode.Move, componentId: component.id }}>
			<div
				onKeyDown={getHotkeyHandler([['Backspace', handleDelete]])}
				tabIndex={0}
				id={component.id}
				style={{
					outlineWidth: isHovered ? 2 : 1,
					cursor: 'default',
					position: 'relative',
					outlineStyle: isHighlighted ? 'solid' : undefined,
					outlineColor: '#fb7185',
					borderRadius: 2,
				}}
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
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						zIndex: 10,
						height: 16,
						pointerEvents: 'none',
					}}
				/>
				<Droppable
					data={{ mode: DroppableMode.InsertAfter, componentId: component.id }}
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						zIndex: 10,
						height: 16,
						pointerEvents: 'none',
					}}
				/>
				{isHighlighted && (
					<div
						style={{
							position: 'absolute',
							backgroundColor: isHovered ? '#f43f5e' : 'white',
							fontFamily: 'monospace',
							padding: '2px 6px',
							bottom: -21,
							color: isHovered ? 'white' : '#f43f5e',
							borderRadius: 2,
							zIndex: 100,
							border: '1px solid #f43f5e',
							display: 'flex',
							gap: 2,
							alignItems: 'center',
						}}
					>
						{getComponentIcon(component.kind)}
						{component.kind}
					</div>
				)}
			</div>
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
