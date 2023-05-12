import componentImage from '../../../assets/components/hero-28.png'
import { column, grid } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Hero28 extends Component {
	name = 'Hero 28'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return (
		<ComponentWrapper>
			<cmn.heroImage.Options />
			<cmn.heading.Options />
			<cmn.desc.Options />
			<cmn.inputWithbtn.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	column([
		cmn.ppr.el([
			column([cmn.heading.el(), cmn.desc.el(), cmn.inputWithbtn.el()])
				.css({
					alignItems: 'start',
					justifyItems: 'center',
					textAlign: 'left',
					width: '50%',
				})
				.cssTablet({
					width: '80%',
				})
				.cssMobile({ width: '100%' }),
			cmn.heroImage.el().css({ marginTop: '3rem' }),
		]),
	]).css({
		alignItems: 'start',
		justifyItems: 'center',
	})
