import _ from 'lodash'
import componentImage from '../../../assets/components/pricing-6.png'
import { regenElement } from '../../clipboard/copy-paste'
import { column, grid } from '../../elements/constructor'
import { BoxElement } from '../../elements/extensions/box'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { cmn } from './common'
import { Divider } from '../helpers'

export class Pricing6 extends Component {
	name = 'Pricing 6'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	const component = useSelectedElement<BoxElement>()!
	const gridDiv = component.find('plansContainer') as BoxElement
	return (
		<ComponentWrapper>
			<cmn.tagline.Options />
			<cmn.heading.Options />
			<cmn.desc.Options />
			<Divider title="Plan" />
			<DndTabs
				containerElement={gridDiv}
				insertElement={() =>
					regenElement(
						cmn.planSix.el({
							plan: 'Basic plan',
							price: '19',
							features: 3,
						})
					)
				}
				renderItemOptions={(item) => <cmn.planSix.Options tileDiv={item as BoxElement} />}
			/>
		</ComponentWrapper>
	)
}

const component = () =>
	cmn.ppr.el([
		column([cmn.tagline.el(), cmn.heading.el(), cmn.desc.el()]).css({
			alignItems: 'center',
			justifyItems: 'center',
			textAlign: 'center',
			marginBottom: '2rem',
		}),
		grid(3)
			.populate([
				cmn.planSix.el({
					plan: 'Basic plan',
					price: '19',
					features: 3,
				}),
				cmn.planSix.el({
					plan: 'Business plan',
					price: '29',
					features: 4,
				}),
				cmn.planSix.el({
					plan: 'Enterprise plan',
					price: '49',
					features: 5,
				}),
			])
			.css({ alignItems: 'center', gap: '2rem' })
			.cssTablet({ gridTemplateColumns: '1fr' })
			.tag('plansContainer'),
	])
