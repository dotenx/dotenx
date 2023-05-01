import componentImage from '../../../assets/components/hero-30.png'
import { column, grid } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Hero30 extends Component {
	name = 'Hero 30'
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
	grid(2)
		.populate([
			cmn.ppr.el([
				column([cmn.heading.el(), cmn.desc.el(), cmn.twoBtns.el()]).css({
					alignItems: 'start',
					justifyItems: 'center',
					textAlign: 'left',
					maxWidth: '48rem',
				}),
			]),
			cmn.heroImage.el().css({ height: '100%', maxHeight: '100%' }),
		])
		.css({ alignItems: 'center', gap: '1rem' })
		.cssTablet({ gridTemplateColumns: '1fr', rowGap: '2rem' })
