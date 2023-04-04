import { Divider } from '@mantine/core'
import _ from 'lodash'
import { box, container, flex, icn, txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { setElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import componentScript from '../scripts/slider-1.js?raw'
import { useSelectedElement } from '../selection/use-selected-component'
import { color } from '../simple/palette'
import { BoxStyler } from '../simple/stylers/box-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class Slider1 extends Component {
	name = 'Slider 1'
	image = ''
	defaultData = component()
	renderOptions = () => <ComponentOptions />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

function ComponentOptions() {
	const root = useSelectedElement<BoxElement>()!
	const title = root.find<TextElement>(tags.title)!
	const buttons = root.findAll<BoxElement>(tags.buttons)!
	const cardList = root.find<BoxElement>(tags.cardList)!

	return (
		<ComponentWrapper name="Slider 1">
			<TextStyler element={title} label="Title" />
			<BoxStyler element={buttons} label="Buttons" />
			<div>
				<Divider label="Cards" />
				<DndTabs
					containerElement={cardList}
					insertElement={card}
					renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
				/>
			</div>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: BoxElement }) {
	const title = item.find<TextElement>(tags.cardTitle)!

	return (
		<OptionsWrapper>
			<BoxStyler element={item} label="Frame" stylers={['background-image']} />
			<TextStyler element={title} label="Title" />
		</OptionsWrapper>
	)
}

const tags = {
	title: 'title',
	buttons: 'buttons',
	cardList: 'cardList',
	card: 'card',
	cardTitle: 'cardTitle',
}

const title = () =>
	txt('Lorem ipsum')
		.css({
			fontSize: '3rem',
			fontFamily: 'Cambria',
		})
		.tag(tags.title)

const iconButton = (icon: string) =>
	box([icn(icon).size('12px')])
		.css({
			color: color('primary'),
			border: '1px solid',
			borderColor: color('primary'),
			borderRadius: '9999px',
			width: '32px',
			height: '32px',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			transition: 'all 150ms ease-in-out',
			cursor: 'pointer',
		})
		.cssHover({
			color: color('background'),
			backgroundColor: color('primary'),
		})
		.tag(tags.buttons)

const buttons = () =>
	flex([
		iconButton('chevron-left').class('leftButton'),
		iconButton('chevron-right').class('rightButton'),
	]).css({
		gap: '20px',
	})

const card = () =>
	flex([
		txt('Lorem ipsum')
			.css({
				fontSize: '2rem',
				fontFamily: 'Cambria',
			})
			.tag(tags.cardTitle),
	])
		.css({
			borderRadius: '10px',
			width: '350px',
			height: '500px',
			backgroundImage:
				'url(https://img.freepik.com/free-photo/beautiful-shot-sea-rocky-mountain-distance-with-clouds-sky_181624-2401.jpg?w=1060&t=st=1680522214~exp=1680522814~hmac=6d23262f07274406469be0561545981625d76ce4256967930dab6855046b5c38)',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'cover',
			flexDirection: 'column',
			justifyContent: 'flex-end',
			alignItems: 'center',
			padding: '40px 20px',
			gap: '14px',
			color: 'white',
			flexShrink: '0',
		})
		.tag(tags.card)

const cards = () =>
	flex(_.times(5, card))
		.css({
			gap: '20px',
			overflowX: 'auto',
			scrollBehavior: 'smooth',
		})
		.class('cards')
		.tag(tags.cardList)

const component = () =>
	box([
		container([
			flex([title(), buttons()]).css({
				paddingBottom: '20px',
				alignItems: 'center',
				justifyContent: 'space-between',
			}),
			cards(),
		]),
	]).css({
		color: color('text'),
	})
