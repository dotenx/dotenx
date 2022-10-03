export interface ElementEvent {
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
	Intersection = 'intersection',
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
