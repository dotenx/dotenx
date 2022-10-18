import { Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import { closeAllModals } from '@mantine/modals'
import produce from 'immer'
import _ from 'lodash'
import { uuid } from '../../utils'
import { useGetMutableStates, useGetStates } from '../data-bindings/use-get-states'
import { useSelectedElement } from '../selection/use-selected-component'
import { AnimationEditor } from '../style/animation-editor'
import { IntelinputValue, IntelinputValueKind, SingleIntelinput } from '../ui/intelinput'
import { Element } from './element'
import { useElementsStore } from './elements-store'

type Ids = {
	event: string
	action: string
}

export abstract class Action {
	id = uuid()
	abstract name: string
	abstract renderSettings(ids: Ids): JSX.Element
	serialize() {
		return { kind: this.name }
	}
}
export class ToggleStateAction extends Action {
	name = 'Toggle State'
	stateName = defaultInteliValue()
	renderSettings(ids: Ids) {
		return <ToggleStateSettings ids={ids} />
	}
	serialize() {
		return { kind: this.name, stateName: serializeInteliValue(this.stateName) }
	}
}

export class SetStateAction extends Action {
	name = 'Set State'
	stateName = defaultInteliValue()
	key = defaultInteliValue()
	value = defaultInteliValue()
	renderSettings(ids: Ids) {
		return <SetStateSettings ids={ids} />
	}
	serialize() {
		return {
			kind: this.name,
			stateName: serializeInteliValue(this.stateName),
			key: serializeInteliValue(this.key),
			value: serializeInteliValue(this.value),
		}
	}
}

export class PushStateAction extends Action {
	name = 'Push State'
	stateName = defaultInteliValue()
	value = defaultInteliValue()
	renderSettings(ids: Ids) {
		return <PushStateSettings ids={ids} />
	}
	serialize() {
		return {
			kind: this.name,
			stateName: serializeInteliValue(this.stateName),
			value: serializeInteliValue(this.value),
		}
	}
}

export class RemoveItemAction extends Action {
	name = 'Remove Item'
	stateName = defaultInteliValue()
	renderSettings(ids: Ids) {
		return <RemoveItemSettings ids={ids} />
	}
	serialize() {
		return { kind: this.name, stateName: serializeInteliValue(this.stateName) }
	}
}

export class IncrementStateAction extends Action {
	name = 'Increment State'
	stateName = defaultInteliValue()
	key = defaultInteliValue()
	renderSettings(ids: Ids) {
		return <IncrementStateSettings ids={ids} />
	}
	serialize() {
		return {
			kind: this.name,
			stateName: serializeInteliValue(this.stateName),
			key: serializeInteliValue(this.key),
		}
	}
}

export class DecrementStateAction extends Action {
	name = 'Decrement State'
	stateName = defaultInteliValue()
	key = defaultInteliValue()
	renderSettings(ids: Ids) {
		return <DecrementStateSettings ids={ids} />
	}
	serialize() {
		return {
			kind: this.name,
			stateName: serializeInteliValue(this.stateName),
			key: serializeInteliValue(this.key),
		}
	}
}

export class AnimationAction extends Action {
	name = 'Animation'
	constructor(public animationName: string) {
		super()
	}
	renderSettings() {
		return <AnimationEditor />
	}
	serialize() {
		return { kind: this.name, animationName: this.animationName }
	}
}

export const actions = [
	ToggleStateAction,
	SetStateAction,
	PushStateAction,
	RemoveItemAction,
	IncrementStateAction,
	DecrementStateAction,
]

function ToggleStateSettings({ ids }: { ids: Ids }) {
	const states = useGetMutableStates()
	const action = useFindAction(ids) as ToggleStateAction | undefined
	const form = useForm({ initialValues: { stateName: action?.stateName } })
	const update = useUpdateAction(ids)

	const onSubmit = form.onSubmit((values) => {
		const action = new ToggleStateAction()
		_.assign(action, values)
		update(action)
	})

	return (
		<form className="space-y-6" onSubmit={onSubmit}>
			<SingleIntelinput
				label="Name"
				options={states.map((state) => state.name)}
				{...form.getInputProps('stateName')}
			/>
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}

function SetStateSettings({ ids }: { ids: Ids }) {
	const states = useGetStates()
	const mutableStates = useGetMutableStates()
	const action = useFindAction(ids) as SetStateAction | undefined
	const form = useForm({
		initialValues: { stateName: action?.stateName, key: action?.key, value: action?.value },
	})
	const update = useUpdateAction(ids)

	const onSubmit = form.onSubmit((values) => {
		const action = new SetStateAction()
		_.assign(action, values)
		update(action)
	})

	return (
		<form className="space-y-6" onSubmit={onSubmit}>
			<SingleIntelinput
				label="Name"
				options={mutableStates.map((state) => state.name)}
				{...form.getInputProps('stateName')}
			/>
			<SingleIntelinput
				label="Key"
				options={states.map((state) => state.name)}
				{...form.getInputProps('key')}
			/>
			<SingleIntelinput
				label="To"
				options={states.map((state) => state.name)}
				{...form.getInputProps('value')}
			/>
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}

function PushStateSettings({ ids }: { ids: Ids }) {
	const states = useGetStates()
	const mutableStates = useGetMutableStates()
	const action = useFindAction(ids) as PushStateAction | undefined
	const form = useForm({ initialValues: { stateName: action?.stateName, value: action?.value } })
	const update = useUpdateAction(ids)

	const onSubmit = form.onSubmit((values) => {
		const action = new PushStateAction()
		_.assign(action, values)
		update(action)
	})

	return (
		<form className="space-y-6" onSubmit={onSubmit}>
			<SingleIntelinput
				label="Name"
				options={mutableStates.map((state) => state.name)}
				{...form.getInputProps('stateName')}
			/>
			<SingleIntelinput
				label="Item"
				options={states.map((state) => state.name)}
				{...form.getInputProps('value')}
			/>
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}

function RemoveItemSettings({ ids }: { ids: Ids }) {
	const mutableStates = useGetMutableStates()
	const action = useFindAction(ids) as RemoveItemAction | undefined
	const form = useForm({ initialValues: { stateName: action?.stateName } })
	const update = useUpdateAction(ids)

	const onSubmit = form.onSubmit((values) => {
		const action = new RemoveItemAction()
		_.assign(action, values)
		update(action)
	})

	return (
		<form className="space-y-6" onSubmit={onSubmit}>
			<SingleIntelinput
				label="Name"
				options={mutableStates.map((state) => state.name)}
				{...form.getInputProps('stateName')}
			/>
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}

function IncrementStateSettings({ ids }: { ids: Ids }) {
	const states = useGetStates()
	const mutableStates = useGetMutableStates()
	const action = useFindAction(ids) as IncrementStateAction | undefined
	const form = useForm({ initialValues: { stateName: action?.stateName, key: action?.key } })
	const update = useUpdateAction(ids)

	const onSubmit = form.onSubmit((values) => {
		const action = new IncrementStateAction()
		_.assign(action, values)
		update(action)
	})

	return (
		<form className="space-y-6" onSubmit={onSubmit}>
			<SingleIntelinput
				label="Name"
				options={mutableStates.map((state) => state.name)}
				{...form.getInputProps('stateName')}
			/>
			<SingleIntelinput
				label="Key"
				options={states.map((state) => state.name)}
				{...form.getInputProps('key')}
			/>
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}

function DecrementStateSettings({ ids }: { ids: Ids }) {
	const states = useGetStates()
	const mutableStates = useGetMutableStates()
	const action = useFindAction(ids) as DecrementStateAction | undefined
	const form = useForm({ initialValues: { stateName: action?.stateName, key: action?.key } })
	const update = useUpdateAction(ids)

	const onSubmit = form.onSubmit((values) => {
		const action = new DecrementStateAction()
		_.assign(action, values)
		update(action)
	})

	return (
		<form className="space-y-6" onSubmit={onSubmit}>
			<SingleIntelinput
				label="Name"
				options={mutableStates.map((state) => state.name)}
				{...form.getInputProps('stateName')}
			/>
			<SingleIntelinput
				label="Key"
				options={states.map((state) => state.name)}
				{...form.getInputProps('key')}
			/>
			<Button type="submit" fullWidth>
				Save
			</Button>
		</form>
	)
}

function useUpdateAction(ids: Ids) {
	const element = useSelectedElement()
	const set = useElementsStore((store) => store.set)

	const update = (action: Action) => {
		if (!element) return
		const updatedElement = updateAction(element, ids, action)
		set(updatedElement)
		closeAllModals()
	}

	return update
}

function updateAction(element: Element, ids: Ids, newAction: Action) {
	return produce(element, (draft) => {
		const event = draft.events.find((event) => event.id === ids.event)
		if (!event) return
		const action = event.actions.find((action) => action.id === ids.action)
		_.assign(action, newAction)
	})
}

function useFindAction(ids: Ids) {
	const element = useSelectedElement()
	return element?.events
		.find((event) => event.id === ids.event)
		?.actions.find((action) => action.id === ids.action)
}

function defaultInteliValue(): IntelinputValue {
	return { kind: IntelinputValueKind.Text, data: '' }
}

function serializeInteliValue(value: IntelinputValue) {
	return { isState: value.kind === IntelinputValueKind.Option, value: value.data }
}
