import componentImage from '../../../assets/components/hero-12.png'
import { column, grid } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Hero12 extends Component {
	name = 'Hero 12'
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
	cmn.ppr.el([
		grid(2)
			.populate([
				column([cmn.heading.el(), cmn.desc.el(), cmn.twoBtns.el()]).css({
					alignItems: 'start',
					justifyItems: 'center',
					textAlign: 'left',
					maxWidth: '48rem',
				}),
				cmn.video.el(),
			])
			.css({ alignItems: 'center', gap: '1rem' })
			.cssTablet({ gridTemplateColumns: '1fr', rowGap: '2rem' }),
	])
