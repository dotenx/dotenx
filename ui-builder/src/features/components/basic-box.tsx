import imageUrl from '../../assets/components/basic-box.png'
import { box } from '../elements/constructor'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'

export class BasicBox extends Component {
	name = 'Basic Box'
	image = imageUrl
	defaultData = box()
		.unlock()
		.css({
			padding: '80px',
		})
		.cssTablet({
			padding: '40px',
		})
		.cssMobile({
			padding: '20px',
		})

	renderOptions() {
		return <BasicBoxOptions />
	}
}

function BasicBoxOptions() {
	return <ComponentWrapper name="Box"  stylers={['backgrounds', 'spacing', 'background-image', 'shadow']}></ComponentWrapper>
}
