import imageUrl from '../../assets/components/columns.png'
import { box } from '../elements/constructor'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'

export class BasicBox extends Component {
	name = 'Basic Box'
	image = imageUrl
	defaultData = box().unlock().css({
		padding: '100px',
	})

	renderOptions() {
		return <BasicBoxOptions />
	}
}

function BasicBoxOptions() {
	return <ComponentWrapper name="Box"></ComponentWrapper>
}
