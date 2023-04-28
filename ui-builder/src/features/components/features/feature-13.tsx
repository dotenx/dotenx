// relume feature 79
import componentImage from '../../../assets/components/features/feature-13.png'
import { box } from '../../elements/constructor'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'

export class Feature13 extends Component {
	name = 'Feature 13'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return (
		<ComponentWrapper>
			<cmn.icnHeading.Options />
			<cmn.heading.Options />
			<cmn.desc.Options />
			<cmn.btnLinks.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	cmn.fullBg.el([
		cmn.halfGrid.el([
			box([cmn.icnHeading.el(), cmn.heading.el()]),
			box([
				cmn.desc.el(
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.'
				),
				cmn.btnLinks.el(),
			]),
		]),
	])
