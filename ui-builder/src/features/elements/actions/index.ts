import { DecrementStateAction } from './decrement-state'
import { IncrementStateAction } from './increment-state'
import { NavigateAction } from './navigate'
import { PushStateAction } from './push-state'
import { RemoveItemAction } from './remove-item'
import { SetStateAction } from './set-state'
import { ToggleStateAction } from './toggle-state'

export const ACTIONS = [
	ToggleStateAction,
	SetStateAction,
	PushStateAction,
	RemoveItemAction,
	IncrementStateAction,
	DecrementStateAction,
	NavigateAction,
]
