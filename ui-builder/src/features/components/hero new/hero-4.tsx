// relume feature 136
import componentImage from '../../../assets/components/hero-4.png'
import { column, grid } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Hero4 extends Component {
	name = 'Hero 4'
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
		cmn.heroImage.el(),
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
		]),
	]).css({
		alignItems: 'start',
		justifyItems: 'center',
	})
