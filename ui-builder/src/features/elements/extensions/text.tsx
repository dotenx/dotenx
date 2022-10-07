import { Textarea } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import { TbMessage2 } from 'react-icons/tb'
import { SpacingEditor } from '../../style/spacing-editor'
import { TypographyEditor } from '../../style/typography-editor'
import { Element, RenderOptions } from '../element'
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

	render(): ReactNode {
		return <span dangerouslySetInnerHTML={{ __html: this.data.text }} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return (
			<div className="space-y-6">
				<Textarea
					label="Text"
					size="xs"
					value={this.data.text}
					autosize
					maxRows={10}
					onChange={(event) =>
						set(
							produce(this, (draft) => {
								draft.data.text = event.target.value
							})
						)
					}
				/>
				<TypographyEditor simple />
				<SpacingEditor />
			</div>
		)
	}
}
