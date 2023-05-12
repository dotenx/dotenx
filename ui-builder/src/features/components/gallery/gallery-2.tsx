import _ from 'lodash'
import componentImage from '../../../assets/components/gallery/gallery-2.png'
import { flex, img } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement, useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ImageElement } from '../../elements/extensions/image'
import componentScript from '../../scripts/testimonials-1.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { FlexBasisEditor } from '../helpers/flex-basis-editor'
import { OptionsWrapper } from '../helpers/options-wrapper'

export class Gallery2 extends Component {
	name = 'Gallery 2'
	image = componentImage
	defaultData = componentWithData()
	renderOptions = () => <Options />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({
			id: root.id,
			overflow: 'visible',
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
	const image = item.find(tags.items.image) as ImageElement

	return (
		<OptionsWrapper>
			<ImageStyler element={image} />
		</OptionsWrapper>
	)
}

const tags = {
	list: 'list',
	items: {
		image: 'image',
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
			cmn.heading.el('Image Gallery'),
			cmn.desc.el('Lorem ipsum dolor sit amet, consectetur adipiscing elit.').css({
				marginBottom: '5rem',
			}),
			list(),
			flex([cmn.dots.el().tag(tags.dots).class('dots'), buttons()]).css({
				justifyContent: 'space-between',
				alignItems: 'center',
			}),
		])
		.css({
			overflowX: 'hidden',
		})

const list = () =>
	flex(_.times(6, () => item(3)))
		.css({
			overflowX: 'auto',
			marginBottom: '2.5rem',
		})
		.tag(tags.list)
		.class('list')

const item = (columns: number) =>
	cmn.sliderItm
		.el(
			[
				img('https://files.dotenx.com/assets/hero-bg-wva.jpeg')
					.css({
						aspectRatio: '1/1',
						userSelect: 'none',
					})
					.tag(tags.items.image),
			],
			columns
		)
		.css({
			paddingRight: '2rem',
		})

const buttons = () =>
	flex([
		cmn.icnButton.el('chevron-left').class('prev'),
		cmn.icnButton.el('chevron-right').class('next'),
	]).css({
		gap: '1rem',
	})
