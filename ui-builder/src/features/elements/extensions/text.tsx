import produce from 'immer'
import { ReactNode } from 'react'
import { TbMessage2 } from 'react-icons/tb'
import { SpacingEditor } from '../../style/spacing-editor'
import { TypographyEditor } from '../../style/typography-editor'
import { IntelinputText } from '../../ui/intelinput'
import { Element, RenderFn, RenderOptions } from '../element'
import { useElementsStore } from '../elements-store'
import { Style } from '../style'

export class TextElement extends Element {
	name = 'Text'
	icon = (<TbMessage2 />)
	data = { text: 'Text' }
	style: Style = {
		desktop: {
			default: {
				fontSize: '1rem',
			},
		},
	}

	render(renderFn: RenderFn): ReactNode {
		return <span dangerouslySetInnerHTML={{ __html: this.data.text }} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <TextOptions element={this} />
	}
}

function TextOptions({ element }: { element: TextElement }) {
	const set = useElementsStore((store) => store.set)

	return (
		<div className="space-y-6">
			<IntelinputText
				label="Text"
				value={element.data.text}
				onChange={(value) =>
					set(
						produce(element, (draft) => {
							draft.data.text = value
						})
					)
				}
			/>
			<TypographyEditor simple />
			<SpacingEditor />
		</div>
	)
}
