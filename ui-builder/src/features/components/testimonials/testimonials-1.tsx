import _ from 'lodash'
import componentImage from '../../../assets/components/testimonials/testimonials-1.png'
import { column, flex, txt } from '../../elements/constructor'
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
import { FlexBasisEditor } from '../helpers/flex-basis-editor'
import { OptionsWrapper } from '../helpers/options-wrapper'

export class Testimonials1 extends Component {
	name = 'Testimonials 1'
	image = componentImage
	defaultData = componentWithData()
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
			<FlexBasisEditor listTag={tags.list} />
			<DndTabs
				containerElement={list}
				insertElement={() => item(component.internal.columns as number)}
				renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
				onDelete={() => set(dots, (draft) => draft.children.pop())}
				onInsert={() => set(dots, (draft) => draft.children.push(cmn.dot.el()))}
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
	dots: 'dots',
}

const componentWithData = () => {
	const c = component()
	c.internal = {
		columns: 3,
	}
	return c
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

const list = () =>
	column([
		flex([
			cmn.icnButton.el('chevron-left').class('prev').cssTablet({
				display: 'none',
			}),
			flex(_.times(6, () => item(3)))
				.css({
					overflowX: 'auto',
				})
				.tag(tags.list)
				.class('list'),
			cmn.icnButton.el('chevron-right').class('next').cssTablet({
				display: 'none',
			}),
		]).css({
			alignItems: 'center',
		}),
		cmn.dots
			.el()
			.css({
				alignSelf: 'center',
			})
			.class('dots')
			.tag(tags.dots),
	])

const item = (columns: number) =>
	cmn.sliderItm
		.el(
			[
				cmn.brand.el().tag(tags.items.logo),
				cmn.quote.el().tag(tags.items.quote),
				cmn.profile.el().tag(tags.items.image),
				txt('Name Surname')
					.css({
						fontWeight: '600',
					})
					.tag(tags.items.title),
				txt('Position, Company name').tag(tags.items.desc),
			],
			columns
		)
		.css({
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			padding: '0 2rem',
			marginBottom: '2.5rem',
		})
