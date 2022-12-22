import { TbPuzzle } from 'react-icons/tb'
import { Extension } from '../../extensions/api'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Expression } from '../../states/expression'
import { useGetStates } from '../../states/use-get-states'
import { Intelinput } from '../../ui/intelinput'
import { Element } from '../element'
import { useSetElement } from '../elements-store'

export class ExtensionElement extends Element {
	name = 'Extension'
	icon = (<TbPuzzle />)
	data: { extension?: Extension; userInputs: Record<string, Expression> } = { userInputs: {} }

	static create(extension: Extension) {
		const element = new ExtensionElement()
		element.data.extension = extension
		return element
	}

	render() {
		if (!this.data.extension) return null
		return <div dangerouslySetInnerHTML={{ __html: this.data.extension.body.html }} />
	}

	renderOptions() {
		return <ExtensionOptions />
	}
}

function ExtensionOptions() {
	const element = useSelectedElement<ExtensionElement>()!
	const set = useSetElement()
	const states = useGetStates()

	if (!element.data.extension) return null

	return (
		<div className="space-y-6">
			{element.data.extension.body.inputs.map((input) => (
				<Intelinput
					key={input.name}
					label={input.name}
					value={element.data.userInputs[input.name] ?? new Expression()}
					onChange={(value) =>
						set(element, (draft) => (draft.data.userInputs[input.name] = value))
					}
					options={states.map((s) => s.name)}
				/>
			))}
		</div>
	)
}
