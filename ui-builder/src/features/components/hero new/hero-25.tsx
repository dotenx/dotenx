import componentImage from '../../../assets/components/hero-25.png'
import { column, grid } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Hero25 extends Component {
	name = 'Hero 25'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return (
		<ComponentWrapper>
			<cmn.backgroundImage.Options />
			<cmn.heading.Options />
			<cmn.desc.Options />
			<cmn.inputWithbtn.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	column([
		cmn.ppr.el([
			column([
				cmn.heading.el().css({ color: 'white' }),
				cmn.desc.el().css({ color: 'white' }),
				cmn.inputWithbtn.el().css({ color: 'white' }),
			])
				.css({
					alignItems: 'center',
					justifyItems: 'center',
					textAlign: 'center',
					paddingLeft: '20%',
					paddingRight: '20%',
				})
				.cssTablet({
					paddingLeft: '10%',
					paddingRight: '10%',
				})
				.cssMobile({ padding: '0px' }),
			cmn.backgroundImage.el(),
		]),
	]).css({
		alignItems: 'center',
		justifyItems: 'center',
	})
