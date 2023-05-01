// r feature 85
import componentImage from '../../../assets/components/features/feature-14.png'
import { box } from '../../elements/constructor'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'

export class Feature14 extends Component {
	name = 'Feature 14'
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
			<cmn.subheadings.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	cmn.fullBg.el([
		cmn.halfGrid.el([
			box([cmn.tagline.el(), cmn.heading.el()]),
			box([cmn.desc.el(), cmn.subheadings.el(), cmn.btnLinks.el()]),
		]),
	])
