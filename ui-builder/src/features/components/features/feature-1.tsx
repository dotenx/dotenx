// relume feature 7
import componentImage from '../../../assets/components/features/feature-1.png'
import { box } from '../../elements/constructor'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'

export class Feature1 extends Component {
	name = 'Feature 1'
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
			<cmn.icnSubheadings.Options />
			<cmn.btnLinks.Options />
			<cmn.fullImg.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	cmn.ppr.el([
		cmn.halfGrid.el([
			box([
				cmn.tagline.el(),
				cmn.heading.el(),
				cmn.desc.el(),
				cmn.icnSubheadings.el(),
				cmn.btnLinks.el(),
			]),
			cmn.fullImg.el(),
		]),
	])
