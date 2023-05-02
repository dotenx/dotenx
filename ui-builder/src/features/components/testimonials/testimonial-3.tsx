import _ from 'lodash'
import componentImage from '../../../assets/components/testimonials/testimonials-3.png'
import { gridCols } from '../../../utils/style-utils'
import { grid, txt } from '../../elements/constructor'
import { BoxElement } from '../../elements/extensions/box'
import { ImageElement } from '../../elements/extensions/image'
import { TextElement } from '../../elements/extensions/text'
import { useSelectedElement } from '../../selection/use-selected-component'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'

// r6
export class Testimonials3 extends Component {
	name = 'Testimonials 3'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	const component = useSelectedElement() as BoxElement
	const list = component.find(tags.list) as BoxElement

	return (
		<ComponentWrapper>
			<cmn.heading.Options />
			<cmn.desc.Options />
			<DndTabs
				containerElement={list}
				insertElement={item}
				renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: BoxElement }) {
	const brand = item.find(tags.items.brand) as ImageElement
	const quote = item.find(tags.items.quote) as TextElement
	const image = item.find(tags.items.image) as ImageElement
	const title = item.find(tags.items.title) as TextElement
	const desc = item.find(tags.items.desc) as TextElement

	return (
		<OptionsWrapper>
			<cmn.stars.Options root={item} />
			<TextStyler label="Quote" element={quote} />
			<ImageStyler element={image} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={desc} />
			<ImageStyler element={brand} />
		</OptionsWrapper>
	)
}

const tags = {
	list: 'list',
	items: {
		quote: 'quote',
		image: 'image',
		title: 'title',
		desc: 'desc',
		brand: 'brand',
	},
}
const component = () =>
	cmn.ppr.el([
		cmn.heading.el('Customer testimonials'),
		cmn.desc.el('Lorem ipsum dolor sit amet, consectetur adipiscing elit.').css({
			marginBottom: '5rem',
		}),
		list(),
	])

const list = () =>
	grid(3)
		.populate(_.times(3, item))
		.css({
			marginBottom: '2.5rem',
			columnGap: '3rem',
			rowGap: '4rem',
		})
		.cssTablet({
			gridTemplateColumns: gridCols(2),
			columnGap: '2rem',
			rowGap: '3rem',
		})
		.cssMobile({
			gridTemplateColumns: gridCols(1),
		})
		.tag(tags.list)
		.class('list')

const item = () =>
	cmn.sliderItm
		.el([
			cmn.stars.el(),
			cmn.quote.el().tag(tags.items.quote),
			cmn.profile.el().tag(tags.items.image),
			txt('Name Surname')
				.css({
					fontWeight: '600',
				})
				.tag(tags.items.title),
			txt('Position, Company name')
				.css({
					marginBottom: '1rem',
				})
				.tag(tags.items.desc),
			cmn.brand.el().tag(tags.items.brand),
		])
		.css({
			paddingRight: '3rem',
		})
