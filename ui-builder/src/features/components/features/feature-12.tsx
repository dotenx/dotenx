// relume feature 67
import componentImage from '../../../assets/components/features/feature-11.png'
import { box } from '../../elements/constructor'
import { BoxElement } from '../../elements/extensions/box'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Feature12 extends Component {
	name = 'Feature 12'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	const component = useSelectedElement<BoxElement>()!

	return <ComponentWrapper name="Feature 12"></ComponentWrapper>
}

const component = () =>
	cmn.fullBg.el([
		cmn.halfGrid.el([
			box([cmn.tagline.el(), cmn.heading.el()]),
			box([cmn.desc.el(), cmn.icnLst.el(), cmn.btnLinks.el()]),
		]),
	])
