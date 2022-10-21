import { Action } from './action'

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
	SubmitSuccess = 'submitSuccess',
}
