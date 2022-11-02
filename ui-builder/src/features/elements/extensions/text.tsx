import produce from 'immer'
import _ from 'lodash'
import { ReactNode } from 'react'
import { TbMessage2 } from 'react-icons/tb'
import { Expression } from '../../states/expression'
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
		return (
			<span
				dangerouslySetInnerHTML={{
					__html: this.data.text.value
						.map((p) => (_.isString(p.value) ? p.value : p.value.name))
						.join(''),
				}}
			/>
		)
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
