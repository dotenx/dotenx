import { Switch, TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import { TbLink } from 'react-icons/tb'
import { Element, RenderFn, RenderOptions } from '../element'
import { Style } from '../style'

export class LinkElement extends Element {
	name = 'Link'
	icon = (<TbLink />)
	public children: Element[] = []
	data = { href: '', openInNewTab: false }
	style: Style = {
		desktop: {
			default: {
				minHeight: '100px',
			},
		},
	}

	render(renderFn: RenderFn): ReactNode {
		return renderFn(this)
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return (
			<div className="space-y-6">
				<TextInput
					size="xs"
					label="Link URL"
					value={this.data.href}
					onChange={(event) =>
						set(
							produce(this, (draft) => {
								draft.data.href = event.target.value
							})
						)
					}
				/>
				<Switch
					size="xs"
					label="Open in new tab"
					checked={this.data.openInNewTab}
					onChange={(event) =>
						set(
							produce(this, (draft) => {
								draft.data.openInNewTab = event.currentTarget.checked
							})
						)
					}
				/>
			</div>
		)
	}
}
