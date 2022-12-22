import { TextInput } from '@mantine/core'
import { TbPuzzle } from 'react-icons/tb'
import { Extension } from '../../extensions/api'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Element } from '../element'
import { useSetElement } from '../elements-store'

export class ExtensionElement extends Element {
	name = 'Extension'
	icon = (<TbPuzzle />)
	data: { extension?: Extension; userInputs: Record<string, string> } = { userInputs: {} }

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

	if (!element.data.extension) return null

	return (
		<div className="space-y-6">
			{element.data.extension.body.inputs.map((input) => (
				<TextInput
					key={input.name}
					label={input.name}
					value={element.data.userInputs[input.name]}
					onChange={(event) =>
						set(
							element,
							(draft) => (draft.data.userInputs[input.name] = event.target.value)
						)
					}
				/>
			))}
		</div>
	)
}
