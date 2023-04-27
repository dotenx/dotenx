// relume feature 113
import componentImage from '../../../assets/components/features/feature-17.png'
import { box } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Feature17 extends Component {
	name = 'Feature 17'
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
			<cmn.fullImg.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	cmn.ppr.el([
		cmn.halfGrid.el([
			box([cmn.icnHeading.el(), cmn.heading.el()]),
			box([
				cmn.desc.el(
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.'
				),
				cmn.btnLinks.el(),
			]),
		]),
		cmn.fullImg.el(),
	])
