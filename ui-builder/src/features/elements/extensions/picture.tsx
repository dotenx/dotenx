import { Divider } from '@mantine/core'
import { useAtomValue } from 'jotai'
import { CSSProperties, ReactNode } from 'react'
import { TbPhoto, TbPictureInPicture } from 'react-icons/tb'
import { ImageDrop } from '../../ui/image-drop'
import { viewportAtom } from '../../viewport/viewport-store'
import { Element, RenderFn, RenderOptions } from '../element'
import { useSetElement } from '../elements-store'
import { Style } from '../style'

export class PictureElement extends Element {
	name = 'Picture'
	icon = (<TbPictureInPicture />)
	data = { desktopSrc: '', tabletSrc: '', mobileSrc: '' }
	style: Style = {
		desktop: {
			default: {
				objectFit: 'cover',
			},
		},
	}

	render(): ReactNode {
		if (!this.data.desktopSrc) {
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
				src={this.data.desktopSrc}
				style={{ opacity: 0, position: 'relative', zIndex: -10 }}
			/>
		)
	}

	renderPreview(renderFn: RenderFn, style?: CSSProperties) {
		return <PicturePreview element={this} />
	}

	renderOptions({ set }: RenderOptions): ReactNode {
		return <PictureOptions element={this} />
	}
}

function PictureOptions({ element }: { element: PictureElement }) {
	const set = useSetElement()

	return (
		<div className="space-y-6">
			<Divider label="Desktop image" />
			<ImageDrop
				src={element.data.desktopSrc}
				onChange={(value) => set(element, (draft) => (draft.data.desktopSrc = value))}
			/>
			<Divider label="Tablet image" />
			<ImageDrop
				src={element.data.tabletSrc}
				onChange={(value) => set(element, (draft) => (draft.data.tabletSrc = value))}
			/>
			<Divider label="Mobile image" />
			<ImageDrop
				src={element.data.mobileSrc}
				onChange={(value) => set(element, (draft) => (draft.data.mobileSrc = value))}
			/>
		</div>
	)
}

function PicturePreview({ element }: { element: PictureElement }) {
	const viewPort = useAtomValue(viewportAtom)
	const src =
		viewPort === 'desktop'
			? element.data.desktopSrc
			: viewPort === 'tablet'
			? element.data.tabletSrc
			: element.data.mobileSrc

	return <img src={src} className={element.generateClasses()} />
}
