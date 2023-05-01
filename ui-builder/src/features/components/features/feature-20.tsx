// r feature 136
import componentImage from '../../../assets/components/features/feature-20.png'
import { column } from '../../elements/constructor'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'

export class Feature20 extends Component {
	name = 'Feature 20'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return (
		<ComponentWrapper>
			<cmn.icnHeading.Options />
			<cmn.tagline.Options />
			<cmn.heading.Options />
			<cmn.desc.Options />
			<cmn.btnLinks.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	cmn.ppr.el([
		column([
			cmn.icnHeading.el(),
			cmn.tagline.el(),
			cmn.heading.el(),
			cmn.desc.el(),
			cmn.btnLinks.el(),
		]).css({
			alignItems: 'center',
			textAlign: 'center',
			maxWidth: '48rem',
			margin: '0 auto',
		}),
	])
