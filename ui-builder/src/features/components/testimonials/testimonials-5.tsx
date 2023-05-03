import _ from 'lodash'
import componentImage from '../../../assets/components/testimonials/testimonials-5.png'
import { box, flex, img, txt } from '../../elements/constructor'
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

// r15
export class Testimonials5 extends Component {
	name = 'Testimonials 5'
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
	const title = item.find(tags.items.title) as TextElement
	const desc = item.find(tags.items.desc) as TextElement

	return (
		<OptionsWrapper>
			<cmn.stars.Options root={item} />
			<TextStyler label="Quote" element={quote} />
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
		title: 'title',
		desc: 'desc',
		brand: 'brand',
	},
}
const component = () =>
	cmn.ppr.el([
		list(),
		flex([cmn.dots.el(2).tag(tags.dots).class('dots'), buttons()]).css({
			justifyContent: 'space-between',
			alignItems: 'center',
		}),
	])

const list = () =>
	flex(_.times(2, item))
		.css({
			overflowX: 'auto',
			marginBottom: '2.5rem',
		})
		.tag(tags.list)
		.class('list')

const item = () =>
	cmn.halfGrid
		.el([
			img('https://files.dotenx.com/assets/hero-bg-wva.jpeg').css({
				aspectRatio: '1/1',
			}),
			box([
				cmn.stars.el(),
				cmn.quote
					.el(
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.'
					)
					.tag(tags.items.quote),
				flex([
					box([
						txt('Name Surname')
							.css({
								fontWeight: '600',
							})
							.tag(tags.items.title),
						txt('Position, Company name').tag(tags.items.desc),
					]),
					cmn.vr.el(),
					cmn.brand.el().tag(tags.items.brand),
				]),
			]),
		])
		.css({
			paddingRight: '3rem',
			flexShrink: '0',
			flexBasis: '100%',
			transition: 'transform 500ms ease',
			alignItems: 'center',
		})

const buttons = () =>
	flex([
		cmn.icnButton.el('chevron-left').class('prev'),
		cmn.icnButton.el('chevron-right').class('next'),
	]).css({
		gap: '1rem',
	})
