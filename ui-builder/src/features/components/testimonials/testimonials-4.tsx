import _ from 'lodash'
import componentImage from '../../../assets/components/testimonials/testimonials-4.png'
import { txt } from '../../elements/constructor'
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

export class Testimonials4 extends Component {
	name = 'Testimonials 4'
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
	const logo = item.find(tags.items.logo) as ImageElement
	const quote = item.find(tags.items.quote) as TextElement
	const image = item.find(tags.items.image) as ImageElement
	const title = item.find(tags.items.title) as TextElement
	const desc = item.find(tags.items.desc) as TextElement

	return (
		<OptionsWrapper>
			<ImageStyler element={logo} />
			<TextStyler label="Quote" element={quote} />
			<ImageStyler element={image} />
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={desc} />
		</OptionsWrapper>
	)
}

const tags = {
	list: 'list',
	items: {
		logo: 'logo',
		quote: 'quote',
		image: 'image',
		title: 'title',
		desc: 'desc',
	},
}

const component = () =>
	cmn.ppr
		.el([
			cmn.heading.el('Customer testimonials'),
			cmn.desc.el('Lorem ipsum dolor sit amet, consectetur adipiscing elit.').css({
				marginBottom: '3rem',
			}),
			list(),
		])
		.css({
			textAlign: 'center',
		})

const list = () => cmn.thirdGrid.el(_.times(3, item)).tag(tags.list)

const item = () =>
	cmn.sliderItm
		.el([
			cmn.brand.el().tag(tags.items.logo),
			cmn.quote
				.el(
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare'
				)
				.tag(tags.items.quote),
			cmn.profile.el().tag(tags.items.image),
			txt('Name Surname')
				.css({
					fontWeight: '600',
				})
				.tag(tags.items.title),
			txt('Position, Company name').tag(tags.items.desc),
		])
		.css({
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			marginBottom: '2.5rem',
		})
