// relume feature 123
import componentImage from '../../../assets/components/features/feature-19.png'
import { box } from '../../elements/constructor'
import { BoxElement } from '../../elements/extensions/box'
import { useSelectedElement } from '../../selection/use-selected-component'
import { cmn, duplicate } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'

export class Feature19 extends Component {
	name = 'Feature 19'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	const component = useSelectedElement<BoxElement>()!
	const grid = component.find<BoxElement>(tags.grid)!

	return (
		<ComponentWrapper>
			<DndTabs
				containerElement={grid}
				insertElement={item}
				autoAdjustGridTemplateColumns={false}
				renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: BoxElement }) {
	return (
		<OptionsWrapper>
			<cmn.tagline.Options root={item} />
			<cmn.heading.Options root={item} />
			<cmn.desc.Options root={item} />
			<cmn.btnLinks.Options root={item} />
		</OptionsWrapper>
	)
}

const tags = {
	grid: 'grid',
}

const component = () => cmn.fullBg.el([cmn.halfGrid.el(duplicate(item, 2)).tag(tags.grid)])

const item = () => box([cmn.tagline.el(), cmn.heading.el(), cmn.desc.el(), cmn.btnLinks.el()])
