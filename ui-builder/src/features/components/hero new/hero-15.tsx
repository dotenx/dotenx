import componentImage from '../../../assets/components/hero-15.png'
import { column, grid } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Hero15 extends Component {
	name = 'Hero 15'
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
			<cmn.inputWithbtn.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	column([
		cmn.video.el().css({ maxHeight: '50vh', objectFit: 'cover' }),
		cmn.ppr.el([
			grid(2)
				.populate([
					cmn.heading.el(),
					column([cmn.desc.el(), cmn.inputWithbtn.el()]).css({
						alignItems: 'start',
						justifyItems: 'center',
						textAlign: 'left',
						maxWidth: '48rem',
					}),
				])
				.css({ alignItems: 'start', gap: '1rem' })
				.cssTablet({ gridTemplateColumns: '1fr' }),
		]),
	]).css({
		alignItems: 'start',
		justifyItems: 'center',
	})
