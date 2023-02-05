import { TextInput } from '@mantine/core'
import { ReactNode } from 'react'
import { TbMessage2 } from 'react-icons/tb'
import { Expression } from '../../states/expression'
import { useGetStates } from '../../states/use-get-states'
import { SpacingEditor } from '../../style/spacing-editor'
import { TypographyEditor } from '../../style/typography-editor'
import { Intelinput } from '../../ui/intelinput'
import { Element, RenderFn, RenderOptions } from '../element'
import { useSetElement } from '../elements-store'
import { Style } from '../style'

export class TextElement extends Element {
	name = 'Text'
	icon = (<TbMessage2 />)
	data: { text: Expression; as: string } = { text: Expression.fromString('Text'), as: 'p' }
	style: Style = {
		desktop: {
			default: {
				fontSize: '1rem',
			},
		},
	}

	render(renderFn: RenderFn): ReactNode {
		const renderedText = this.data.text.value.map((part) => part.value).join('')

		return <span dangerouslySetInnerHTML={{ __html: renderedText }} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <TextOptions element={this} />
	}

	txt(text: string) {
		this.data.text = Expression.fromString(text)
		return this
	}

	textState(state: string) {
		this.data.text = Expression.fromState(state)
		return this
	}

	as(as: string) {
		this.data.as = as
		return this
	}
}

function TextOptions({ element }: { element: TextElement }) {
	const set = useSetElement()
	const states = useGetStates()

	return (
		<div className="space-y-6">
			<Intelinput
				label="Text"
				value={element.data.text}
				onChange={(value) => set(element, (draft) => (draft.data.text = value))}
				options={states.map((s) => s.name)}
			/>
			<TextInput
				size="xs"
				label="As HTML element"
				value={element.data.as}
				onChange={(event) => set(element, (draft) => (draft.data.as = event.target.value))}
			/>
			<TypographyEditor simple />
			<SpacingEditor />
		</div>
	)
}
