import { TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import { TbLink } from 'react-icons/tb'
import { Element, RenderOptions } from '../../element'
import { Style } from '../../style'

export class NavLinkElement extends Element {
	name = 'NavLink'
	icon = (<TbLink />)
	data = { text: 'Nav Link', url: '' }
	style: Style = {
		desktop: {
			default: {
				marginLeft: '20px',
				marginRight: '20px',
			},
		},
	}

	render(): ReactNode {
		return <>{this.data.text}</>
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return (
			<div className="space-y-6">
				<TextInput
					size="xs"
					label="Link URL"
					value={this.data.url}
					onChange={(event) =>
						set(
							produce(this, (draft) => {
								draft.data.url = event.target.value
							})
						)
					}
				/>
				<TextInput
					size="xs"
					label="Text"
					value={this.data.text}
					onChange={(event) =>
						set(
							produce(this, (draft) => {
								draft.data.text = event.target.value
							})
						)
					}
				/>
			</div>
		)
	}
}
