import { TextInput } from '@mantine/core'
import produce from 'immer'
import { ReactNode } from 'react'
import { TbPhoto } from 'react-icons/tb'
import { BordersEditor } from '../../style/border-editor'
import { SizeEditor } from '../../style/size-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { ImageDrop } from '../../ui/image-drop'
import { Element, RenderOptions } from '../element'
import { Style } from '../style'

export class ImageElement extends Element {
	name = 'Image'
	icon = (<TbPhoto />)
	data = { src: '', alt: '' }
	style: Style = {
		desktop: {
			default: {
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				width: '100%',
			},
		},
	}

	render(): ReactNode {
		if (!this.data.src) {
			return (
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						color: '#334155',
						padding: '10px',
					}}
				>
					<TbPhoto size={48} />
				</div>
			)
		}

		return <img src={this.data.src} alt={this.data.alt} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return (
			<div className="space-y-6">
				<ImageDrop
					src={this.data.src}
					onChange={(value) =>
						set(
							produce(this, (draft) => {
								draft.data.src = value
							})
						)
					}
				/>
				<TextInput
					size="xs"
					label="Alt text"
					value={this.data.alt}
					onChange={(event) =>
						set(
							produce(this, (draft) => {
								draft.data.src = event.target.value
							})
						)
					}
				/>
				<SizeEditor simple />
				<SpacingEditor />
				<BordersEditor simple />
			</div>
		)
	}
}
