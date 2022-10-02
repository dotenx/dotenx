import { TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import { TbMenu2 } from 'react-icons/tb'
import { BackgroundsEditor } from '../../../style/background-editor'
import { BordersEditor } from '../../../style/border-editor'
import { ShadowsEditor } from '../../../style/shadow-editor'
import { SizeEditor } from '../../../style/size-editor'
import { SpacingEditor } from '../../../style/spacing-editor'
import { Element, RenderOptions } from '../../element'
import { Style } from '../../style'

export class MenuButtonElement extends Element {
	name = 'MenuButton'
	icon = (<TbMenu2 />)
	style: Style = {
		desktop: {
			default: {
				display: 'none',
				paddingTop: '20px',
				paddingLeft: '20px',
				paddingRight: '20px',
				paddingBottom: '20px',
			},
		},
		tablet: { default: { display: 'flex' } },
	}
	data = { text: 'Menu', menuId: '' }

	render(): ReactNode {
		return <>{this.data.text}</>
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return (
			<div className="space-y-6">
				<TextInput
					label="Text"
					size="xs"
					value={this.data.text}
					onChange={(event) =>
						set(
							produce(this, (draft) => {
								draft.data.text = event.target.value
							})
						)
					}
				/>
				<BackgroundsEditor simple />
				<SizeEditor simple />
				<SpacingEditor />
				<BordersEditor />
				<ShadowsEditor />
			</div>
		)
	}
}
