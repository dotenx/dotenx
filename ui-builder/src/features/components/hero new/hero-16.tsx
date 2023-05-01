import componentImage from '../../../assets/components/hero-16.png'
import { column, grid } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Hero16 extends Component {
	name = 'Hero 16'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return (
		<ComponentWrapper>
			<cmn.video.Options />
			<cmn.heading.Options />
			<cmn.desc.Options />
			<cmn.twoBtns.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	column([
		cmn.ppr.el([
			grid(2)
				.populate([
					cmn.heading.el(),
					column([cmn.desc.el(), cmn.twoBtns.el()]).css({
						alignItems: 'start',
						justifyItems: 'center',
						textAlign: 'left',
						maxWidth: '48rem',
					}),
				])
				.css({ alignItems: 'start', gap: '1rem' })
				.cssTablet({ gridTemplateColumns: '1fr' }),
			cmn.video.el().css({ marginTop: '3rem' }),
		]),
	]).css({
		alignItems: 'start',
		justifyItems: 'center',
	})
