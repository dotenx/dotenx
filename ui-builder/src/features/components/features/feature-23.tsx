// relume feature 138
import componentImage from '../../../assets/components/features/feature-23.png'
import { column } from '../../elements/constructor'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'

export class Feature23 extends Component {
	name = 'Feature 23'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return (
		<ComponentWrapper>
			<cmn.tagline.Options />
			<cmn.heading.Options />
			<cmn.desc.Options />
			<cmn.btnLinks.Options />
			<cmn.brands.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	cmn.ppr.el([
		column([
			cmn.tagline.el(),
			cmn.heading.el(),
			cmn.desc.el(),
			cmn.brands.el(),
			cmn.btnLinks.el(),
		]).css({
			alignItems: 'center',
			textAlign: 'center',
			maxWidth: '48rem',
			margin: '0 auto',
		}),
	])
