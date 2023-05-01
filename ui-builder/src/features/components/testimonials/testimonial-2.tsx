import _ from 'lodash'
import componentImage from '../../../assets/components/testimonials/testimonials-2.png'
import { flex, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement, useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ImageElement } from '../../elements/extensions/image'
import { TextElement } from '../../elements/extensions/text'
import componentScript from '../../scripts/testimonials-1.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'

// r12
export class Testimonials2 extends Component {
	name = 'Testimonials 2'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({
			id: root.id,
			overflow: 'hidden',
		})
		setElement(root, (draft) => (draft.script = script))
	}
}

function Options() {
	const set = useSetElement()
	const component = useSelectedElement() as BoxElement
	const list = component.find(tags.list) as BoxElement
	const dots = component.find(tags.dots) as BoxElement

	return (
		<ComponentWrapper>
			<cmn.heading.Options />
			<cmn.desc.Options />
			<DndTabs
				containerElement={list}
				insertElement={item}
				renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
				onDelete={() => set(dots, (draft) => draft.children.pop())}
				onInsert={() => set(dots, (draft) => draft.children.push(cmn.dot.el()))}
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
	dots: 'dots',
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
		flex([cmn.dots.el().tag(tags.dots).class('dots'), buttons()]).css({
			justifyContent: 'space-between',
			alignItems: 'center',
		}),
	])

const list = () =>
	flex(_.times(6, item))
		.css({
			overflowX: 'auto',
			marginBottom: '2.5rem',
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

const buttons = () =>
	flex([
		cmn.icnButton.el('chevron-left').class('prev'),
		cmn.icnButton.el('chevron-right').class('next'),
	]).css({
		gap: '1rem',
	})
