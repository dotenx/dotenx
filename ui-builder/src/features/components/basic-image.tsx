import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/basic-image.png'
import { deserializeElement } from '../../utils/deserialize'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { useSelectedElement } from '../selection/use-selected-component'
import { ImageStyler } from '../simple/stylers/image-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'

export class BasicImage extends Component {
	name = 'Image'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <BasicImageOptions />
	}
}

// =============  renderOptions =============

function BasicImageOptions() {
	const component = useSelectedElement<BoxElement>()!
	const image = component.children[0] as ImageElement

	return (
		<ComponentWrapper
			name="Image"
			stylers={['alignment', 'backgrounds', 'borders', 'spacing', 'animation']}
		>
			<ImageStyler element={image} />
		</ComponentWrapper>
	)
}

// =============  defaultData =============

const defaultData = produce(new BoxElement(), (draft) => {
	draft.style.desktop = {
		default: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
		},
	}
	const element = produce(new ImageElement(), (draft) => {
		draft.data.src = Expression.fromString('https://files.dotenx.com/assets/hero-9bb.jpeg')
	})

	draft.children = [element]
}).serialize()
