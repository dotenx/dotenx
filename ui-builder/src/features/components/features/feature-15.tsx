// relume feature 97
import componentImage from '../../../assets/components/features/feature-15.png'
import { box } from '../../elements/constructor'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'

export class Feature15 extends Component {
	name = 'Feature 15'
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
			<cmn.icnSubheadings.Options />
			<cmn.fullImg.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	cmn.ppr.el([
		cmn.halfGrid.el([
			box([cmn.tagline.el(), cmn.heading.el()]),
			box([cmn.desc.el(), cmn.icnSubheadings.el(), cmn.btnLinks.el()]),
		]),
		cmn.fullImg.el(),
	])
