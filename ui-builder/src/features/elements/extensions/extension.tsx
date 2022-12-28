import { Text } from '@mantine/core'
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
		return (
			<div style={{ position: 'relative' }}>
				<div
					style={{
						position: 'absolute',
						top: 0,
						right: 0,
						writingMode: 'vertical-rl',
						fontSize: 12,
						backgroundColor: '#fff1f2',
						borderRadius: 2,
						padding: '6px 1px',
					}}
				>
					{this.data.extension.name}
				</div>
				{renderFn(this)}
			</div>
		)
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
	const inputs = element.data.extension.content.inputs

	if (inputs.length === 0)
		return (
			<Text size="xs" align="center">
				...
			</Text>
		)

	return (
		<div className="space-y-6">
			{inputs.map((input) => (
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
