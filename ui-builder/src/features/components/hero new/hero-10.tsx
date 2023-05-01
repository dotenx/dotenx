// relume feature 136
import componentImage from '../../../assets/components/hero-10.png'
import { column, grid } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Hero10 extends Component {
	name = 'Hero 10'
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
			<cmn.twoBtns.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	column([
		cmn.ppr.el([
			column([cmn.heading.el(), cmn.desc.el(), cmn.twoBtns.el()])
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
			cmn.heroImage.el().css({ marginTop: '3rem' }),
		]),
	]).css({
		alignItems: 'start',
		justifyItems: 'center',
	})
