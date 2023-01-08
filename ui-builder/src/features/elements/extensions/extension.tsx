import { ColorInput, NumberInput, Switch } from '@mantine/core'
import _ from 'lodash'
import { ReactNode } from 'react'
import { TbPuzzle } from 'react-icons/tb'
import { Extension, InputKind } from '../../extensions/api'
import { ExtensionInput } from '../../extensions/extension-form'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Expression } from '../../states/expression'
import { useGetStates } from '../../states/use-get-states'
import { ImageDrop } from '../../ui/image-drop'
import { Intelinput } from '../../ui/intelinput'
import { InputWithUnit } from '../../ui/style-input'
import { Element, RenderFn } from '../element'
import { useSetElement } from '../elements-store'
import { Style } from '../style'

type UserInput = undefined | Expression | number | boolean | string

export class ExtensionElement extends Element {
	name = 'Extension'
	icon = (<TbPuzzle />)
	data: { extension?: Extension; userInputs: Record<string, UserInput> } = { userInputs: {} }
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

	if (!element.data.extension) return null

	return (
		<div className="space-y-6">
			<p className="flex justify-between">
				<span className="font-bold">Extension name</span>
				<span>{element.data.extension.name}</span>
			</p>
			{element.data.extension.content.inputs.map((input) => (
				<ExtensionField key={input.name} input={input} />
			))}
		</div>
	)
}

function ExtensionField({ input }: { input: ExtensionInput }) {
	const element = useSelectedElement<ExtensionElement>()!
	const set = useSetElement()
	const states = useGetStates()
	const userInput = element.data.userInputs[input.name]

	switch (input.kind) {
		case InputKind.Text:
			return (
				<Intelinput
					label={input.name}
					value={
						userInput instanceof Expression
							? userInput
							: typeof userInput === 'object'
							? Expression.fromObject(userInput)
							: new Expression()
					}
					onChange={(value) =>
						set(element, (draft) => (draft.data.userInputs[input.name] = value))
					}
					options={states.map((s) => s.name)}
				/>
			)
		case InputKind.Number:
			return (
				<NumberInput
					size="xs"
					label={input.name}
					value={_.isNumber(userInput) ? userInput : undefined}
					onChange={(value) =>
						set(element, (draft) => (draft.data.userInputs[input.name] = value))
					}
				/>
			)
		case InputKind.Boolean:
			return (
				<Switch
					size="xs"
					label={input.name}
					checked={_.isBoolean(userInput) ? userInput : undefined}
					onChange={(event) =>
						set(
							element,
							(draft) => (draft.data.userInputs[input.name] = event.target.checked)
						)
					}
				/>
			)
		case InputKind.Color:
			return (
				<ColorInput
					size="xs"
					label={input.name}
					value={_.isString(userInput) ? userInput : undefined}
					onChange={(value) =>
						set(element, (draft) => (draft.data.userInputs[input.name] = value))
					}
				/>
			)
		case InputKind.Size:
			return (
				<InputWithUnit
					label={input.name}
					value={_.isString(userInput) ? userInput : undefined}
					onChange={(value) =>
						set(element, (draft) => (draft.data.userInputs[input.name] = value))
					}
				/>
			)
		case InputKind.File:
			return (
				<ImageDrop
					label={input.name}
					src={_.isString(userInput) ? userInput : null}
					onChange={(value) =>
						set(element, (draft) => (draft.data.userInputs[input.name] = value))
					}
				/>
			)
	}
}
