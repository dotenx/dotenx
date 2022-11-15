import produce from 'immer'
import { ReactNode } from 'react'
import { TbMessage2 } from 'react-icons/tb'
import { Expression, ExpressionKind } from '../../states/expression'
import { useGetStates } from '../../states/use-get-states'
import { SpacingEditor } from '../../style/spacing-editor'
import { TypographyEditor } from '../../style/typography-editor'
import { Intelinput } from '../../ui/intelinput'
import { Element, RenderFn, RenderOptions } from '../element'
import { useElementsStore } from '../elements-store'
import { Style } from '../style'

export class TextElement extends Element {
	name = 'Text'
	icon = (<TbMessage2 />)
	data: { text: Expression } = { text: Expression.fromString('Text') }
	style: Style = {
		desktop: {
			default: {
				fontSize: '1rem',
			},
		},
	}

	render(renderFn: RenderFn): ReactNode {
		const renderedText = this.data.text.value
			.map((part) => (part.kind === ExpressionKind.Text ? part.value : part.value.name))
			.join('')

		return <span dangerouslySetInnerHTML={{ __html: renderedText }} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <TextOptions element={this} />
	}
}

function TextOptions({ element }: { element: TextElement }) {
	const set = useElementsStore((store) => store.set)
	const states = useGetStates()

	return (
		<div className="space-y-6">
			<Intelinput
				label="Text"
				value={element.data.text}
				onChange={(value) =>
					set(
						produce(element, (draft) => {
							draft.data.text = value
						})
					)
				}
				options={states.map((s) => s.name)}
			/>
			<TypographyEditor simple />
			<SpacingEditor />
		</div>
	)
}
