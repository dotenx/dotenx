import componentImage from '../../../assets/components/features/feature-12.png'
import { box } from '../../elements/constructor'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'

export class Feature12 extends Component {
	name = 'Feature 12'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return (
		<ComponentWrapper name="Feature 12">
			<cmn.tagline.Options />
			<cmn.heading.Options />
			<cmn.desc.Options />
			<cmn.icnLst.Options />
			<cmn.btnLinks.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	cmn.fullBg.el([
		cmn.halfGrid.el([
			box([cmn.tagline.el(), cmn.heading.el()]),
			box([cmn.desc.el(), cmn.icnLst.el(), cmn.btnLinks.el()]),
		]),
	])
