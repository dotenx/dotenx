import { ReactNode } from 'react'
import { TbPuzzle } from 'react-icons/tb'
import { Extension } from '../../extensions/api'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Expression } from '../../states/expression'
import { useGetStates } from '../../states/use-get-states'
import { Intelinput } from '../../ui/intelinput'
import { Element, RenderFn } from '../element'
import { useSetElement } from '../elements-store'
import { Style } from '../style'

export class ExtensionElement extends Element {
	name = 'Extension'
	icon = (<TbPuzzle />)
	data: { extension?: Extension; userInputs: Record<string, Expression> } = { userInputs: {} }
	children: Element[] = []
	style: Style = { desktop: { default: { minHeight: '150px' } } }

	static create(extension: Extension) {
		const element = new ExtensionElement()
		element.data.extension = extension
		return element
	}

	render(renderFn: RenderFn): ReactNode {
		if (!this.data.extension) return null
		return renderFn(this)
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
			<p className="flex justify-between">
				<span className="font-bold">Extension name</span>
				<span>{element.data.extension.name}</span>
			</p>
			{element.data.extension.content.inputs.map((input) => (
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
