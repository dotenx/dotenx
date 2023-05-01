// relume feature 136
import componentImage from '../../../assets/components/hero-8.png'
import { column, grid } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Hero8 extends Component {
	name = 'Hero 8'
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
	cmn.ppr.el([
		grid(2)
			.populate([
				cmn.heroImage.el(),
				column([cmn.heading.el(), cmn.desc.el(), cmn.twoBtns.el()]).css({
					alignItems: 'start',
					justifyItems: 'center',
					textAlign: 'left',
					maxWidth: '48rem',
				}),
			])
			.css({ alignItems: 'center', gap: '2rem' })
			.cssTablet({ gridTemplateColumns: '1fr', rowGap: '2rem' }),
	])
