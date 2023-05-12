import componentImage from '../../../assets/components/hero-19.png'
import { column, grid } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Hero19 extends Component {
	name = 'Hero 19'
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
	cmn.ppr.el([
		grid(2)
			.populate([
				cmn.video.el(),
				column([cmn.heading.el(), cmn.desc.el(), cmn.inputWithbtn.el()]).css({
					alignItems: 'start',
					justifyItems: 'center',
					textAlign: 'left',
					maxWidth: '48rem',
				}),
			])
			.css({ alignItems: 'center', gap: '2rem' })
			.cssTablet({ gridTemplateColumns: '1fr', rowGap: '2rem' }),
	])
