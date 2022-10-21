import { closeAllModals } from '@mantine/modals'
import produce from 'immer'
import _ from 'lodash'
import { uuid } from '../../../utils'
import { useDataSourceStore } from '../../data-bindings/data-source-store'
import { useSelectedElement } from '../../selection/use-selected-component'
import { AnimationEditor } from '../../style/animation-editor'
import { Element } from '../element'
import { useElementsStore } from '../elements-store'

export type Ids = {
	event: string
	action: string
}

export type SourceIds = {
	source: string
	action: string
}

export abstract class Action {
	id = uuid()
	abstract name: string
	abstract renderSettings(ids: Ids): JSX.Element
	renderDataSourceSettings(sourceId: string): JSX.Element {
		return <>{sourceId}</>
	}
	serialize() {
		return { kind: this.name }
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

export function useUpdateAction(ids: Ids) {
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

export function updateAction(element: Element, ids: Ids, newAction: Action) {
	return produce(element, (draft) => {
		const event = draft.events.find((event) => event.id === ids.event)
		if (!event) return
		const action = event.actions.find((action) => action.id === ids.action)
		_.assign(action, newAction)
	})
}

export function useFindAction(ids: Ids) {
	const element = useSelectedElement()
	return element?.events
		.find((event) => event.id === ids.event)
		?.actions.find((action) => action.id === ids.action)
}

export function useAction<T extends Action>(ids: Ids) {
	const action = useFindAction(ids) as T | undefined
	const update = useUpdateAction(ids)
	return { action, update }
}

export function useDataSourceAction<T extends Action>(ids: SourceIds) {
	const { sources, edit } = useDataSourceStore((store) => ({
		sources: store.sources,
		edit: store.edit,
	}))
	const source = sources.find((s) => s.id === ids.source)
	const action = source?.onSuccess?.find((a) => a.id === ids.action) as T
	const updateAction = (action: T) => {
		if (!source) return
		const newSource = produce(source, (draft) => {
			const found = draft?.onSuccess?.find((a) => a.id === ids.action)
			if (found) _.assign(found, action)
			else if (draft.onSuccess) draft.onSuccess.push(action)
			else draft.onSuccess = [action]
		})
		edit(ids.source, newSource)
		closeAllModals()
	}
	return { action, update: updateAction }
}

export interface ActionSettingsRawProps<T extends Action> {
	action?: T
	onSubmit: (action: T) => void
}
