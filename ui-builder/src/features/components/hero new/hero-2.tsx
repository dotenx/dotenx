import componentImage from '../../../assets/components/hero-2.png'
import { column, grid } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Hero2 extends Component {
	name = 'Hero 2'
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
				column([cmn.heading.el(), cmn.desc.el(), cmn.twoBtns.el()]).css({
					alignItems: 'start',
					justifyItems: 'center',
					textAlign: 'left',
					maxWidth: '48rem',
				}),
				cmn.heroImage.el(),
			])
			.css({ alignItems: 'center', gap: '1rem' })
			.cssTablet({ gridTemplateColumns: '1fr', rowGap: '2rem' }),
	])
