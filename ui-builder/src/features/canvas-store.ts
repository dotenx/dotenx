import produce from 'immer'
import _ from 'lodash'
import { CSSProperties } from 'react'
import create from 'zustand'

interface CanvasState {
	components: Component[]
	set: (components: Component[]) => void
	addComponent: (component: Component, parentId: string) => void
	editComponent: (id: string, data: ComponentData) => void
	deleteComponent: (id: string) => void
	moveComponent: (id: string, toParentId: string) => void
	addComponentBefore: (component: Component, beforeId: string) => void
	addComponentAfter: (component: Component, afterId: string) => void
	moveComponentBefore: (id: string, beforeId: string) => void
	moveComponentAfter: (id: string, afterId: string) => void
	addComponentEvent: (componentId: string, event: ComponentEvent) => void
	editComponentEvent: (componentId: string, event: ComponentEvent) => void
	removeEvent: (componentId: string, eventId: string) => void
	addBinding: (componentId: string, bindingKind: BindingKind, binding: Binding) => void
	editBinding: (componentId: string, bindingKind: BindingKind, binding: Binding) => void
	removeBinding: (componentId: string, bindingKind: BindingKind) => void
	editRepeatFrom: (componentId: string, repeatFrom: RepeatFrom) => void
	editClassNames: (componentId: string, classNames: string[]) => void
}

export const useCanvasStore = create<CanvasState>()((set) => ({
	components: [],
	set: (components: Component[]) => set((state) => ({ ...state, components })),
	addComponent: (component, parentId) => {
		set((state) => ({
			...state,
			components: addComponent(component, parentId, state.components),
		}))
	},
	editComponent: (id, data) => {
		set((state) => ({
			...state,
			components: editComponent(id, data, state.components),
		}))
	},
	deleteComponent: (id) => {
		set((state) => ({
			...state,
			components: deleteComponent(id, state.components),
		}))
	},
	moveComponent: (id, toParentId) => {
		set((state) => ({
			...state,
			components: moveComponent(id, toParentId, state.components),
		}))
	},
	addComponentBefore: (component, beforeId) => {
		set((state) => ({
			...state,
			components: addComponentBefore(component, beforeId, state.components),
		}))
	},
	addComponentAfter: (component, afterId) => {
		set((state) => ({
			...state,
			components: addComponentAfter(component, afterId, state.components),
		}))
	},
	moveComponentBefore: (id, beforeId) => {
		set((state) => ({
			...state,
			components: moveComponentBefore(id, beforeId, state.components),
		}))
	},
	moveComponentAfter: (id, afterId) => {
		set((state) => ({
			...state,
			components: moveComponentAfter(id, afterId, state.components),
		}))
	},
	addComponentEvent: (componentId, event) => {
		set((state) => {
			return {
				...state,
				components: addComponentEvent(componentId, event, state.components),
			}
		})
	},
	editComponentEvent: (componentId, event) => {
		set((state) => {
			return {
				...state,
				components: editComponentEvent(componentId, event, state.components),
			}
		})
	},
	removeEvent: (componentId, eventId) => {
		set((state) => {
			return {
				...state,
				components: deleteEvent(componentId, eventId, state.components),
			}
		})
	},
	addBinding: (componentId, bindingKind, binding) => {
		set((state) => {
			return {
				...state,
				components: addOrEditBinding(componentId, bindingKind, binding, state.components),
			}
		})
	},
	editBinding: (componentId, bindingKind, binding) => {
		set((state) => {
			return {
				...state,
				components: addOrEditBinding(componentId, bindingKind, binding, state.components),
			}
		})
	},
	removeBinding: (componentId, bindingKind) => {
		set((state) => {
			return {
				...state,
				components: deleteBinding(componentId, bindingKind, state.components),
			}
		})
	},
	editRepeatFrom: (componentId, repeatFrom) => {
		set((state) => {
			return {
				...state,
				components: editRepeatFrom(componentId, repeatFrom, state.components),
			}
		})
	},
	editClassNames: (componentId, classNames) => {
		set((state) => {
			return {
				...state,
				components: editClassNames(componentId, classNames, state.components),
			}
		})
	},
}))

const editClassNames = (componentId: string, classNames: string[], components: Component[]) => {
	return produce(components, (draft) => {
		const found = findComponent(componentId, draft)
		if (found) found.classNames = classNames
	})
}

export const findComponent = (id: string, components: Component[]): Component | null => {
	for (const component of components) {
		if (component.id === id) {
			return component
		} else {
			const foundComponent = findComponent(id, component.components)
			if (foundComponent) return foundComponent
		}
	}
	return null
}

export const getStateNames = (components: Component[]) => {
	let states: string[] = []
	for (const component of components) {
		states = [
			...states,
			...component.events
				.flatMap((event) => event.actions)
				.filter(
					(action): action is ToggleStateAction | SetStateAction =>
						action.kind === ActionKind.ToggleState ||
						action.kind === ActionKind.SetState
				)
				.map((action) => action.name),
		]
		states = [...states, ...getStateNames(component.components)]
	}
	return states
}

const editRepeatFrom = (componentId: string, repeatFrom: RepeatFrom, components: Component[]) => {
	const newComponents = _.cloneDeep(components)
	const found = findComponent(componentId, newComponents)
	if (found) found.repeatFrom = repeatFrom
	return newComponents
}

const addOrEditBinding = (
	componentId: string,
	bindingKind: BindingKind,
	binding: Binding,
	components: Component[]
) => {
	const newComponents = _.cloneDeep(components)
	const found = findComponent(componentId, newComponents)
	if (found) found.bindings[bindingKind] = binding
	return newComponents
}

const deleteBinding = (componentId: string, bindingKind: BindingKind, components: Component[]) => {
	const newComponents = _.cloneDeep(components)
	const found = findComponent(componentId, newComponents)
	if (found) found.bindings[bindingKind] = null
	return newComponents
}

const addComponentEvent = (componentId: string, event: ComponentEvent, components: Component[]) => {
	const newComponents = _.cloneDeep(components)
	const found = findComponent(componentId, newComponents)
	if (found) found.events.push(event)
	return newComponents
}

const editComponentEvent = (
	componentId: string,
	event: ComponentEvent,
	components: Component[]
) => {
	const newComponents = _.cloneDeep(components)
	const found = findComponent(componentId, newComponents)
	if (found) {
		const index = found.events.findIndex((e) => e.id === event.id)
		if (index !== -1) found.events[index] = event
	}
	return newComponents
}

const deleteEvent = (componentId: string, eventId: string, components: Component[]) => {
	const newComponents = _.cloneDeep(components)
	const found = findComponent(componentId, newComponents)
	if (found) found.events = found.events.filter((e) => e.id !== eventId)
	return newComponents
}

const addComponent = (componentToAdd: Component, parentId: string, components: Component[]) => {
	const newComponents = _.cloneDeep(components)
	return mutAddComponent(componentToAdd, parentId, newComponents)
}

const mutAddComponent = (componentToAdd: Component, parentId: string, components: Component[]) => {
	const parentComponent = findComponent(parentId, components)
	if (parentComponent) parentComponent.components.push(componentToAdd)
	else components.push(componentToAdd)
	return components
}

const editComponent = (id: string, data: ComponentData, components: Component[]) => {
	const newComponents = _.cloneDeep(components)
	return mutEditComponent(id, data, newComponents)
}

const mutEditComponent = (id: string, data: ComponentData, components: Component[]) => {
	const component = findComponent(id, components)
	if (component) component.data = data
	return components
}

const deleteComponent = (id: string, components: Component[]) => {
	const newComponents = _.cloneDeep(components)
	return mutDeleteComponent(id, newComponents)
}

const mutDeleteComponent = (id: string, components: Component[]) => {
	const component = findComponent(id, components)
	if (component) {
		const parentComponent = findComponent(component.parentId, components)
		if (parentComponent) {
			const index = parentComponent.components.indexOf(component)
			if (index >= 0) parentComponent.components.splice(index, 1)
		}
	}
	return components.filter((component) => component.id !== id)
}

const moveComponent = (id: string, toParentId: string, components: Component[]) => {
	const which = findComponent(id, components)
	if (!which) return components
	const deleted = deleteComponent(id, components)
	const reAdded = addComponent({ ...which, parentId: toParentId }, toParentId, deleted)
	return reAdded
}

const addComponentBefore = (
	componentToAdd: Component,
	beforeId: string,
	components: Component[]
) => {
	const newComponents = _.cloneDeep(components)
	return mutAddComponentBefore(componentToAdd, beforeId, newComponents)
}

const mutAddComponentBefore = (
	componentToAdd: Component,
	beforeId: string,
	components: Component[]
) => {
	const beforeComponent = findComponent(beforeId, components)
	if (beforeComponent) {
		const parentComponent = findComponent(beforeComponent.parentId, components)
		if (parentComponent) {
			const index = parentComponent.components.indexOf(beforeComponent)
			if (index >= 0)
				parentComponent.components.splice(index, 0, {
					...componentToAdd,
					parentId: parentComponent.id,
				})
		} else {
			components.splice(components.indexOf(beforeComponent), 0, {
				...componentToAdd,
				parentId: beforeComponent.parentId,
			})
		}
	}
	return components
}

const addComponentAfter = (componentToAdd: Component, after: string, components: Component[]) => {
	const newComponents = _.cloneDeep(components)
	return mutAddComponentAfter(componentToAdd, after, newComponents)
}

const mutAddComponentAfter = (
	componentToAdd: Component,
	afterId: string,
	components: Component[]
) => {
	const afterComponent = findComponent(afterId, components)
	if (afterComponent) {
		const parentComponent = findComponent(afterComponent.parentId, components)
		if (parentComponent) {
			const index = parentComponent.components.indexOf(afterComponent)
			if (index >= 0)
				parentComponent.components.splice(index + 1, 0, {
					...componentToAdd,
					parentId: parentComponent.id,
				})
		} else {
			components.splice(components.indexOf(afterComponent) + 1, 0, {
				...componentToAdd,
				parentId: afterComponent.parentId,
			})
		}
	}
	return components
}

function moveComponentBefore(id: string, beforeId: string, components: Component[]) {
	const which = findComponent(id, components)
	if (!which) return components
	const deleted = deleteComponent(id, components)
	const reAdded = addComponentBefore({ ...which, parentId: beforeId }, beforeId, deleted)
	return reAdded
}

function moveComponentAfter(id: string, afterId: string, components: Component[]) {
	const which = findComponent(id, components)
	if (!which) return components
	const deleted = deleteComponent(id, components)
	const reAdded = addComponentAfter({ ...which, parentId: afterId }, afterId, deleted)
	return reAdded
}

export enum ComponentKind {
	Text = 'Text',
	Box = 'Box',
	Button = 'Button',
	Columns = 'Columns',
	Image = 'Image',
	Input = 'Input',
	Select = 'Select',
	Textarea = 'Textarea',
	SubmitButton = 'Submit',
	Form = 'Form',
	Link = 'Link',
	Stack = 'Stack',
	Divider = 'Divider',
}

export const basicComponents = [
	ComponentKind.Text,
	ComponentKind.Box,
	ComponentKind.Button,
	ComponentKind.Columns,
	ComponentKind.Image,
	ComponentKind.Link,
	ComponentKind.Stack,
	ComponentKind.Divider,
]

export const formComponents = [
	ComponentKind.Form,
	ComponentKind.Input,
	ComponentKind.Select,
	ComponentKind.Textarea,
	ComponentKind.SubmitButton,
]

export interface RepeatFrom {
	name: string
	iterator: string
}

export interface BaseComponent {
	id: string
	parentId: string
	components: Component[]
	kind: ComponentKind
	data: ComponentData
	events: ComponentEvent[]
	bindings: Partial<Record<BindingKind, Binding | null>>
	repeatFrom: RepeatFrom
	classNames: string[]
}

export type Component =
	| TextComponent
	| BoxComponent
	| ButtonComponent
	| ColumnsComponent
	| ImageComponent
	| InputComponent
	| SelectComponent
	| TextareaComponent
	| SubmitButtonComponent
	| FormComponent
	| LinkComponent
	| StackComponent
	| DividerComponent

export interface TextComponent extends BaseComponent {
	kind: ComponentKind.Text
	data: TextComponentData
}

export interface BoxComponent extends BaseComponent {
	kind: ComponentKind.Box
	data: BoxComponentData
}

export interface ButtonComponent extends BaseComponent {
	kind: ComponentKind.Button
	data: ButtonComponentData
}

export interface ColumnsComponent extends BaseComponent {
	kind: ComponentKind.Columns
	data: ColumnsComponentData
}

export interface ImageComponent extends BaseComponent {
	kind: ComponentKind.Image
	data: ImageComponentData
}

export interface InputComponent extends BaseComponent {
	kind: ComponentKind.Input
	data: InputComponentData
}

export interface SelectComponent extends BaseComponent {
	kind: ComponentKind.Select
	data: SelectComponentData
}

export interface TextareaComponent extends BaseComponent {
	kind: ComponentKind.Textarea
	data: TextareaComponentData
}

export interface SubmitButtonComponent extends BaseComponent {
	kind: ComponentKind.SubmitButton
	data: SubmitButtonComponentData
}

export interface FormComponent extends BaseComponent {
	kind: ComponentKind.Form
	data: FormComponentData
}

export interface LinkComponent extends BaseComponent {
	kind: ComponentKind.Link
	data: LinkComponentData
}

export interface StackComponent extends BaseComponent {
	kind: ComponentKind.Stack
	data: StackComponentData
}

export interface DividerComponent extends BaseComponent {
	kind: ComponentKind.Divider
	data: DividerComponentData
}

export interface Style {
	desktop: SelectorStyle
	tablet: SelectorStyle
	mobile: SelectorStyle
}

export type SelectorStyle = Partial<Record<CssSelector, CSSProperties>>

export enum CssSelector {
	Default = 'default',
	Hover = 'hover',
	Focus = 'focus',
}

export const cssSelectors = [CssSelector.Default, CssSelector.Hover, CssSelector.Focus]

export interface TextComponentData {
	style: Style
	text: string
}

export interface BoxComponentData {
	style: Style
}

export interface ButtonComponentData {
	style: Style
	text: string
}

export interface ColumnsComponentData {
	style: Style
	columnWidths: { id: string; value: number }[]
}

export interface ImageComponentData {
	style: Style
	src: string | null
	alt: string
}

export interface InputComponentData {
	style: Style
	type: string
	name: string
	placeholder: string
	defaultValue: string
	required: boolean
	value: string
}

export interface SelectComponentData {
	style: Style
	options: { label: string; value: string; key: string }[]
	name: string
	defaultValue: string
	required: boolean
	value: string
}

export interface TextareaComponentData {
	style: Style
	placeholder: string
	defaultValue: string
	value: string
	required: boolean
	name: string
}

export interface SubmitButtonComponentData {
	style: Style
	text: string
}

export interface FormComponentData {
	style: Style
	dataSourceName: string
}

export interface LinkComponentData {
	style: Style
	href: string
	openInNewTab: boolean
}

export interface StackComponentData {
	style: Style
}

export interface DividerComponentData {
	style: Style
}

export type ComponentData =
	| TextComponentData
	| BoxComponentData
	| ButtonComponentData
	| ColumnsComponentData
	| ImageComponentData
	| InputComponentData
	| SelectComponentData
	| TextareaComponentData
	| SubmitButtonComponentData
	| FormComponentData
	| LinkComponentData
	| StackComponentData
	| DividerComponentData

export interface ComponentEvent {
	id: string
	kind: EventKind
	actions: Action[]
}

export enum EventKind {
	Click = 'click',
	MouseEnter = 'mouseenter',
	MouseLeave = 'mouseleave',
	KeyDown = 'keydown',
	Change = 'change',
	Submit = 'submit',
	Onload = 'onload',
}

interface BaseAction {
	id: string
}

export interface CodeAction extends BaseAction {
	kind: ActionKind.Code
	code: string
}

export interface ToggleStateAction extends BaseAction {
	kind: ActionKind.ToggleState
	name: string
}

export interface SetStateAction extends BaseAction {
	kind: ActionKind.SetState
	name: string
	valueToSet: string | number | boolean
}

export interface FetchAction extends BaseAction {
	kind: ActionKind.Fetch
	dataSourceName: string
	body: string
	params: string
}

export interface AnimationAction extends BaseAction {
	kind: ActionKind.Animation
	animationName: string
}

export type Action = CodeAction | ToggleStateAction | SetStateAction | FetchAction | AnimationAction

export enum ActionKind {
	Code = 'Code',
	ToggleState = 'Toggle State',
	SetState = 'Set State',
	Fetch = 'Fetch',
	Animation = 'Animation',
}

export const actionKinds = [
	ActionKind.ToggleState,
	ActionKind.SetState,
	ActionKind.Fetch,
	ActionKind.Code,
]

export interface Binding {
	fromStateName: string
}

export enum BindingKind {
	Text = 'text',
	Hide = 'hide',
	Show = 'show',
	Link = 'link',
}

export const bindingKinds = [BindingKind.Text, BindingKind.Hide, BindingKind.Show, BindingKind.Link]
