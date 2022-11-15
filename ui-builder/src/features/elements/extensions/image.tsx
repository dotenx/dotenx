import { TextInput } from '@mantine/core'
import { CSSProperties, ReactNode } from 'react'
import { TbPhoto } from 'react-icons/tb'
import { Expression } from '../../states/expression'
import { BordersEditor } from '../../style/border-editor'
import { SizeEditor } from '../../style/size-editor'
import { SpacingEditor } from '../../style/spacing-editor'
import { ImageDropWithState } from '../../ui/image-drop'
import { Element, RenderFn, RenderOptions } from '../element'
import { useSetElement } from '../elements-store'
import { Style } from '../style'

export class ImageElement extends Element {
	name = 'Image'
	icon = (<TbPhoto />)
	data = { src: new Expression(), alt: '' }
	style: Style = {
		desktop: {
			default: {
				objectFit: 'contain',
			},
		},
	}

	render(): ReactNode {
		if (!this.data.src.exists()) {
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

		return (
			<img
				src={this.data.src.toString()}
				alt={this.data.alt}
				style={{ opacity: 0, position: 'relative', zIndex: -10 }}
			/>
		)
	}

	renderPreview(renderFn: RenderFn, style?: CSSProperties) {
		return <ImagePreview element={this} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <ImageOptions element={this} />
	}
}

function ImageOptions({ element }: { element: ImageElement }) {
	const set = useSetElement()

	return (
		<div className="space-y-6">
			<ImageDropWithState
				src={element.data.src}
				onChange={(value) => set(element, (draft) => (draft.data.src = value))}
			/>
			<TextInput
				size="xs"
				label="Alt text"
				value={element.data.alt}
				onChange={(event) => set(element, (draft) => (draft.data.alt = event.target.value))}
			/>
			<SizeEditor simple />
			<SpacingEditor />
			<BordersEditor simple />
		</div>
	)
}

function ImagePreview({ element }: { element: ImageElement }) {
	return (
		<img
			src={element.data.src.toString()}
			alt={element.data.alt}
			className={element.generateClasses()}
		/>
	)
}
