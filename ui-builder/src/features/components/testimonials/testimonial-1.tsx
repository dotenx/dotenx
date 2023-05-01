import _ from 'lodash'
import componentImage from '../../../assets/components/testimonials/testimonials-1.png'
import { box, column, flex, icn, img, txt } from '../../elements/constructor'
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

// r9
export class Testimonials1 extends Component {
	name = 'Testimonials 1'
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
				onInsert={() => set(dots, (draft) => draft.children.push(dot()))}
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
			iconButton('chevron-left').class('prev'),
			flex(_.times(5, item))
				.css({
					overflowX: 'auto',
				})
				.tag(tags.list)
				.class('list'),
			iconButton('chevron-right').class('next'),
		]).css({
			alignItems: 'center',
		}),
		dots()
			.css({
				alignSelf: 'center',
			})
			.class('dots')
			.tag(tags.dots),
	])

const item = () =>
	column([
		img('https://files.dotenx.com/assets/Logo10-nmi1.png')
			.css({
				width: '140px',
				height: '3.5rem',
			})
			.tag(tags.items.logo),
		txt(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'
		)
			.css({
				fontSize: '1.25rem',
				lineHeight: '1.4',
				fontWeight: '700',
				margin: '2rem 0',
			})
			.tag(tags.items.quote),
		img()
			.css({
				marginBottom: '1rem',
				width: '3.5rem',
				height: '3.5rem',
				backgroundColor: '#eee',
				borderRadius: '999px',
			})
			.tag(tags.items.image),
		txt('Name Surname')
			.css({
				fontWeight: '600',
			})
			.tag(tags.items.title),
		txt('Position, Company name').tag(tags.items.desc),
	])
		.css({
			alignItems: 'center',
			padding: '0 2rem',
			flexShrink: '0',
			flexBasis: 'calc(100% / 3)',
			marginBottom: '2.5rem',
			transition: 'transform 500ms ease',
		})
		.cssTablet({
			flexBasis: '50%',
		})
		.cssMobile({
			flexBasis: '100%',
		})

const iconButton = (icon: string) =>
	box([icn(icon).size('18px')])
		.css({
			border: '1px solid currentcolor',
			borderRadius: '999px',
			width: '3.5rem',
			height: '3.5rem',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			cursor: 'pointer',
			flexShrink: '0',
		})
		.cssTablet({
			display: 'none',
		})

const dots = () =>
	flex([
		dot().css({
			backgroundColor: '#222222',
		}),
		dot(),
		dot(),
		dot(),
		dot(),
	]).css({
		gap: '6px',
		cursor: 'pointer',
	})

const dot = () =>
	box([txt('')]).css({
		width: '8px',
		height: '8px',
		backgroundColor: '#22222266',
		borderRadius: '999px',
		transition: 'background-color 150ms ease-in-out',
	})
