import { getHotkeyHandler, useHotkeys } from '@mantine/hooks'
import axios from 'axios'
import { useAtomValue, useSetAtom } from 'jotai'
import _ from 'lodash'
import { CSSProperties, ReactNode } from 'react'
import { TbPhoto } from 'react-icons/tb'
import { JsonArray, JsonMap, safeParseToHeaders, safeParseToJson } from '../utils'
import { animateCSS } from '../utils/animation'
import {
	ActionKind,
	AnimationAction,
	BoxComponent,
	ButtonComponent,
	CodeAction,
	ColumnsComponent,
	Component,
	ComponentEvent,
	ComponentKind,
	CssSelector,
	DividerComponent,
	EventKind,
	FetchAction,
	FormComponent,
	ImageComponent,
	InputComponent,
	LinkComponent,
	SelectComponent,
	SetStateAction,
	StackComponent,
	Style,
	SubmitButtonComponent,
	TextareaComponent,
	TextComponent,
	ToggleStateAction,
	useCanvasStore,
} from './canvas-store'
import { selectedClassAtom, selectedSelectorAtom } from './class-editor'
import { useClassNamesStore } from './class-names-store'
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
	const text = (stateText.toString() || component.data.text) ?? '<br />'

	return <div style={{ overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: text }} />
}

const getClasses = (component: Component) => {
	return `${component.classNames.join(' ')} ${component.id}`
}

const emptyContainerStyle = { minHeight: 100, minWidth: 100, border: '1px dashed black' }

function BoxRenderer({ component, state }: { component: BoxComponent; state: JsonMap }) {
	return <RenderComponents components={component.components} state={state} />
}

function ButtonRenderer({ component }: { component: ButtonComponent }) {
	return <>{component.data.text}</>
}

function ColumnsRenderer({ component, state }: { component: ColumnsComponent; state: JsonMap }) {
	const { isHighlighted } = useIsHighlighted(component.id)
	const styles = useCombinedStyles(component)
	const cols = styles.gridTemplateColumns?.toString().split(' ') ?? []
	const emptyCols = cols.length - component.components.length

	return (
		<>
			{component.components.map((innerComponent) => {
				return (
					<div
						key={innerComponent.id}
						style={{ backgroundColor: isHighlighted ? '#fff1f2' : undefined }}
					>
						<RenderComponents components={[innerComponent]} state={state} />
					</div>
				)
			})}
			{isHighlighted &&
				_.range(emptyCols).map((col) => {
					return (
						<div
							key={col}
							style={{ backgroundColor: isHighlighted ? '#fff1f2' : undefined }}
						/>
					)
				})}
		</>
	)
}

function ImageRenderer({ component }: { component: ImageComponent }) {
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
			className={getClasses(component)}
			src={imageUrl}
			alt={component.data.alt}
			style={{ display: 'flex' }}
		/>
	)
}

function InputRenderer({ component }: { component: InputComponent }) {
	return (
		<input
			className={getClasses(component)}
			disabled
			name={component.data.name}
			placeholder={component.data.placeholder}
			required={component.data.required}
			type={component.data.type}
			value={component.data.value || component.data.defaultValue}
		/>
	)
}

function SelectRenderer({ component }: { component: SelectComponent }) {
	return (
		<select
			name={component.data.name}
			required={component.data.required}
			className={getClasses(component)}
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
	return (
		<textarea
			className={getClasses(component)}
			placeholder={component.data.placeholder}
			value={component.data.value || component.data.defaultValue}
			readOnly
		/>
	)
}

export function SubmitButtonRenderer({ component }: { component: SubmitButtonComponent }) {
	return <>{component.data.text}</>
}

function FormRenderer({ component, state }: { component: FormComponent; state: JsonMap }) {
	return <RenderComponents components={component.components} state={state} />
}

function LinkRenderer({ component, state }: { component: LinkComponent; state: JsonMap }) {
	return <RenderComponents components={component.components} state={state} />
}

function StackRenderer({ component, state }: { component: StackComponent; state: JsonMap }) {
	return <RenderComponents components={component.components} state={state} />
}

function DividerRenderer({ component }: { component: DividerComponent }) {
	return <></>
}

function ComponentShaper({ component, state }: { component: Component; state: JsonMap }) {
	switch (component.kind) {
		case ComponentKind.Text:
			return <TextRenderer component={component} state={state} />
		case ComponentKind.Box:
			return <BoxRenderer component={component} state={state} />
		case ComponentKind.Button:
			return <ButtonRenderer component={component} />
		case ComponentKind.Columns:
			return <ColumnsRenderer component={component} state={state} />
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
			return <FormRenderer component={component} state={state} />
		case ComponentKind.Link:
			return <LinkRenderer component={component} state={state} />
		case ComponentKind.Stack:
			return <StackRenderer component={component} state={state} />
		case ComponentKind.Divider:
			return <DividerRenderer component={component} />
		default:
			return null
	}
}

const useIsHighlighted = (componentId: string) => {
	const { selectedComponentId, hoveredId } = useSelectionStore((store) => ({
		selectedComponentId: store.selectedId,
		hoveredId: store.hoveredId,
	}))

	const isHovered = hoveredId === componentId
	const isSelected = componentId === selectedComponentId
	const isHighlighted = isSelected || isHovered
	return { isHighlighted, isHovered, isSelected }
}

function ComponentWrapper({ children, component }: { children: ReactNode; component: Component }) {
	const { setSelectedComponent, selectedComponentId, setHovered, unsetHovered, deselect } =
		useSelectionStore((store) => ({
			setSelectedComponent: store.select,
			selectedComponentId: store.selectedId,
			setHovered: store.setHovered,
			unsetHovered: store.unsetHovered,
			deselect: store.deselect,
		}))

	const setSelectedClass = useSetAtom(selectedClassAtom)
	const dataSources = useDataSourceStore((store) => store.sources)
	const deleteComponent = useCanvasStore((store) => store.deleteComponent)
	const handleDelete = () => {
		if (selectedComponentId) deleteComponent(selectedComponentId)
	}
	useHotkeys([['Backspace', handleDelete]])
	const { states, toggleState, setState } = usePageStates((store) => ({
		states: store.states,
		toggleState: store.toggleState,
		setState: store.setState,
	}))

	const { isHighlighted, isHovered, isSelected } = useIsHighlighted(component.id)

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
	// const link = bindings.link ? _.get(states, bindings.link.fromStateName) : ''

	const showHoverAnimations = () => {
		component.events
			.filter((event) => event.kind === EventKind.MouseEnter)
			.flatMap((event) => event.actions)
			.filter((action): action is AnimationAction => action.kind === ActionKind.Animation)
			.forEach((animation) => animateCSS(`.${component.id}`, animation.animationName))
	}
	const isContainer =
		component.kind === ComponentKind.Box ||
		component.kind === ComponentKind.Columns ||
		component.kind === ComponentKind.Form ||
		component.kind === ComponentKind.Link ||
		component.kind === ComponentKind.Stack
	const styles = useCombinedStyles(component)
	const emptyStyle =
		isContainer && component.components.length === 0
			? {
					minHeight: !(styles.height || styles.minHeight)
						? emptyContainerStyle.minHeight
						: undefined,
					minWidth: !(styles.width || styles.minWidth)
						? emptyContainerStyle.minWidth
						: undefined,
					border: !(
						styles.border ||
						styles.borderWidth ||
						styles.borderColor ||
						styles.borderStyle
					)
						? emptyContainerStyle.border
						: undefined,
			  }
			: {}

	return (
		<Draggable
			className={getClasses(component)}
			data={{ mode: DraggableMode.Move, componentId: component.id }}
			tabIndex={0}
			id={component.id}
			onKeyDown={(event) => {
				getHotkeyHandler([
					['Backspace', handleDelete],
					[`Escape`, deselect],
				])(event)
				handleEvents(EventKind.KeyDown)
			}}
			style={{
				...emptyStyle,
				outlineWidth: isHovered ? 2 : 1,
				cursor: 'default',
				position: 'relative',
				outlineStyle: isHighlighted ? 'solid' : undefined,
				outlineColor: '#fb7185',
			}}
			onMouseOver={(event) => {
				event.stopPropagation()
				setHovered(component.id)
				showHoverAnimations()
			}}
			onMouseOut={(event) => {
				event.stopPropagation()
				unsetHovered()
			}}
			onClick={(event) => {
				event.stopPropagation()
				setSelectedComponent(component.id)
				if (selectedComponentId !== component.id) setSelectedClass(null)
				handleEvents(EventKind.Click)
			}}
			hidden={!shouldShow && shouldHide}
			onMouseEnter={() => handleEvents(EventKind.MouseEnter)}
			onMouseLeave={() => handleEvents(EventKind.MouseLeave)}
			onChange={() => handleEvents(EventKind.Change)}
			onSubmit={() => handleEvents(EventKind.Submit)}
		>
			{isContainer && (
				<Droppable
					data={{ mode: DroppableMode.InsertIn, componentId: component.id }}
					style={{
						position: 'absolute',
						top: 10,
						bottom: 10,
						left: 10,
						right: 10,
					}}
				/>
			)}
			<Droppable
				data={{ mode: DroppableMode.InsertBefore, componentId: component.id }}
				style={{
					position: 'absolute',
					top: 0,
					bottom: 0,
					left: 0,
					width: 10,
				}}
			/>
			<Droppable
				data={{ mode: DroppableMode.InsertAfter, componentId: component.id }}
				style={{
					position: 'absolute',
					top: 0,
					bottom: 0,
					right: 0,
					width: 10,
				}}
			/>
			<Droppable
				data={{ mode: DroppableMode.InsertBefore, componentId: component.id }}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					height: 10,
				}}
			/>
			<Droppable
				data={{ mode: DroppableMode.InsertAfter, componentId: component.id }}
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: 10,
				}}
			/>
			{children}
			{isSelected && (
				<div
					style={{
						position: 'absolute',
						backgroundColor: isHovered ? '#f43f5e' : 'white',
						fontFamily: 'monospace',
						padding: '2px 6px',
						bottom: -21,
						color: isHovered ? 'white' : '#f43f5e',
						borderRadius: 2,
						zIndex: isHovered ? 101 : 100,
						border: '1px solid #f43f5e',
						display: 'flex',
						gap: 2,
						alignItems: 'center',
						fontSize: 12,
						fontWeight: 600,
						letterSpacing: 'normal',
						lineHeight: 'normal',
						left: 0,
					}}
				>
					{getComponentIcon(component.kind)}
					{component.kind}
				</div>
			)}
		</Draggable>
	)
}

const combineStyles = (
	viewport: ViewportDevice,
	selector: CssSelector,
	style: Style
): CSSProperties => {
	const desktopStyle = style.desktop[selector] ?? {}
	const tabletStyle = style.tablet[selector] ?? {}
	const mobileStyle = style.mobile[selector] ?? {}

	switch (viewport) {
		case 'desktop':
			return desktopStyle
		case 'tablet':
			return { ...desktopStyle, ...tabletStyle }
		case 'mobile':
			return { ...desktopStyle, ...tabletStyle, ...mobileStyle }
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

const useCombinedStyles = (component: Component): CSSProperties => {
	const viewport = useViewportStore((store) => store.device)
	const selector = useAtomValue(selectedSelectorAtom)
	const classNames = useClassNamesStore((store) => store.classNames)
	const viewportStyles = combineStyles(viewport, selector, component.data.style)
	const classStyles = component.classNames.reduce<CSSProperties>(
		(prev, className) => ({
			...prev,
			...combineStyles(viewport, selector, classNames[className]),
		}),
		{}
	)
	return { ...classStyles, ...viewportStyles }
}
