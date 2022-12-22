import { Action } from '../actions/action'
import { Element } from '../elements/element'
import { ExtensionElement } from '../elements/extensions/extension'
import { InteliStateValue } from '../ui/intelinput'

export const getStateNames = (elements: Element[]) => {
	let states: string[] = []
	for (const element of elements) {
		states = [
			...states,
			...element.events
				.flatMap((event) => event.actions)
				.filter((a): a is Action & { stateName: InteliStateValue } => 'stateName' in a)
				.map((action) => action.stateName.value),
		]
		if (element instanceof ExtensionElement)
			states = [...states, ...(element.data.extension?.body.outputs.map((o) => o.name) ?? [])]
		states = [...states, ...getStateNames(element.children ?? [])]
	}
	return states
}
