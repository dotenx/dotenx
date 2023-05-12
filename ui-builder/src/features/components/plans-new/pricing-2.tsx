import _ from 'lodash'
import componentImage from '../../../assets/components/pricing-2.png'
import { regenElement } from '../../clipboard/copy-paste'
import { column, grid } from '../../elements/constructor'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import componentScript from '../../scripts/pricing-1.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { cmn } from './common'
import { Element } from '../../elements/element'
import { Divider } from '../helpers'

export class Pricing2 extends Component {
	name = 'Pricing 2'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

function Options() {
	const component = useSelectedElement<BoxElement>()!
	const gridDiv = component.find('plansContainer') as BoxElement
	return (
		<ComponentWrapper>
			<cmn.tagline.Options />
			<cmn.heading.Options />
			<cmn.desc.Options />
			<cmn.twoBtns.Options />
			<Divider title="Plan" />
			<DndTabs
				containerElement={gridDiv}
				insertElement={() =>
					regenElement(
						cmn.planTwo.el({
							plan: 'Basic plan',
							planDesc: 'or $199 yearly',
							price: '19',
							features: 3,

							yearlyPrice: '180',
						})
					)
				}
				renderItemOptions={(item) => <cmn.planTwo.Options tileDiv={item as BoxElement} />}
			/>
		</ComponentWrapper>
	)
}

const component = () =>
	cmn.ppr.el([
		column([cmn.tagline.el(), cmn.heading.el(), cmn.desc.el(), cmn.twoBtns.el()]).css({
			alignItems: 'center',
			justifyItems: 'center',
			textAlign: 'center',
			marginBottom: '2rem',
		}),
		grid(3)
			.populate([
				cmn.planTwo.el({
					plan: 'Basic plan',
					planDesc: 'or $199 yearly',
					price: '19',
					features: 3,

					yearlyPrice: '180',
				}),
				cmn.planTwo.el({
					plan: 'Business plan',
					planDesc: 'or $299 yearly',
					price: '29',
					features: 4,
					yearlyPrice: '280',
				}),
				cmn.planTwo.el({
					plan: 'Enterprise plan',
					planDesc: 'or $499 yearly',
					price: '49',
					features: 5,
					yearlyPrice: '480',
				}),
			])
			.css({ alignItems: 'center', gap: '2rem' })
			.cssTablet({ gridTemplateColumns: '1fr' })
			.tag('plansContainer'),
	])
