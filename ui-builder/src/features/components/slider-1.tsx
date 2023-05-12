import { Divider } from '@mantine/core'
import _ from 'lodash'
import imageUrl from '../../assets/components/slider-1.png'
import { box, container, flex, icn, paper, txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { setElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { TextElement } from '../elements/extensions/text'
import componentScript from '../scripts/slider-1.js?raw'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { BoxStyler } from '../simple/stylers/box-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { BackgroundImageEditor } from '../style/background-image-editor'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class Slider1 extends Component {
	name = 'Slider - 1'
	image = imageUrl
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
		<ComponentWrapper name="Slider - 1">
			<TextStyler element={title} label="Title" />
			<BoxStyler element={buttons} label="Arrows" />
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
			<TextStyler element={title} label="Title" />
			<BackgroundImageEditor element={item} />
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
			fontSize: fontSizes.h1.desktop,
		})
		.cssTablet({
			fontSize: fontSizes.h1.tablet,
		})
		.cssMobile({
			fontSize: fontSizes.h1.mobile,
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
			})
			.tag(tags.cardTitle),
	])
		.css({
			borderRadius: '10px',
			height: '450px',
			backgroundImage: 'url(https://files.dotenx.com/assets/hero-bg-wva.jpeg)',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'cover',
			flexDirection: 'column',
			justifyContent: 'flex-end',
			alignItems: 'center',
			padding: '40px 20px',
			color: 'white',
			flexShrink: '0',
			flexBasis: 'calc(100% / 3 - 20px * 2 / 3)',
		})
		.cssTablet({
			flexBasis: 'calc(100% / 2 - 20px * 1 / 2)',
			height: '400px',
		})
		.cssMobile({
			flexBasis: '100%',
			height: '350px',
		})
		.tag(tags.card)

const cards = () =>
	flex(_.times(5, card))
		.css({
			gap: '20px',
			overflowX: 'auto',
			scrollBehavior: 'smooth',
			borderRadius: '10px',
		})
		.class('list')
		.tag(tags.cardList)

const component = () =>
	paper([
		container([
			flex([title(), buttons()]).css({
				paddingBottom: '20px',
				alignItems: 'center',
				justifyContent: 'space-between',
			}),
			cards(),
		]),
	])
