import imageUrl from '../../assets/components/basic-text.png'
import { box, img } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { SliderElement } from '../elements/extensions/slider'
import { useSelectedElement } from '../selection/use-selected-component'
import { ImageStyler } from '../simple/stylers/image-styler'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'

export class BasicSlideshow extends Component {
	name = 'Slideshow'
	image = imageUrl
	defaultData = component()

	renderOptions() {
		return <BasicTextOptions />
	}
}

// =============  renderOptions =============

function BasicTextOptions() {
	const root = useSelectedElement<BoxElement>()!
	const slider = root.children[0] as BoxElement

	return (
		<ComponentWrapper name="Slideshow">
			<DndTabs
				containerElement={slider}
				insertElement={() => img()}
				renderItemOptions={(item) => <ImageStyler element={item as ImageElement} />}
			/>
		</ComponentWrapper>
	)
}

// =============  defaultData =============

const component = () => box([new SliderElement().populate([img(), img(), img()])])
