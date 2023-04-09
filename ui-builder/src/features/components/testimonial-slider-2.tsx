import { Divider } from '@mantine/core'
import _ from 'lodash'
import imageUrl from '../../assets/components/testimonial-slider-2.png'
import { box, btn, container, flex, img, link, paper, txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { setElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import componentScript from '../scripts/testimonial-slider-2.js?raw'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { BoxStylerSimple } from '../simple/stylers/box-styler'
import { ColorStyler } from '../simple/stylers/color-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class TestimonialSlider2 extends Component {
	name = 'Testimonials with slider'
	image = imageUrl
	defaultData = component()
	renderOptions = () => <ComponentOptions />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({
			id: root.id,
			cardsPerPage: JSON.stringify({
				desktop: 1,
				tablet: 1,
				mobile: 1,
			}),
		})
		setElement(root, (draft) => (draft.script = script))
	}
}

function ComponentOptions() {
	const root = useSelectedElement<BoxElement>()!
	const cardList = root.find<BoxElement>(tags.cardList)!
	const activeButton = root.find<LinkElement>(tags.buttonActive)!
	const inactiveButton = root.find<LinkElement>(tags.buttonInactive)!

	return (
		<ComponentWrapper name="Testimonials with slider">
			<DndTabs
				containerElement={cardList}
				insertElement={card}
				renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
			/>
			<Divider label="Buttons" />
			<ColorStyler element={activeButton} label="Active button" isBackground />
			<ColorStyler element={inactiveButton} label="Inactive button" isBackground />
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: BoxElement }) {
	const testimonial = item.find<TextElement>(tags.testimonial)!
	const name = item.find<TextElement>(tags.name)!
	const title = item.find<TextElement>(tags.title)!
	const image = item.find<ImageElement>(tags.image)!

	return (
		<OptionsWrapper>
			<ImageStyler element={image} />
			<TextStyler element={testimonial} label="Testimonial" />
			<TextStyler element={name} label="Name" />
			<TextStyler element={title} label="Title" />
			<BoxStylerSimple label="Block" element={item} />
		</OptionsWrapper>
	)
}

const tags = {
	cardList: 'cardList',
	card: 'card',
	cardTitle: 'cardTitle',
	image: 'image',
	testimonial: 'testimonial',
	name: 'name',
	title: 'title',
	buttonActive: 'buttonActive',
	buttonInactive: 'buttonInactive',
}

const card = () =>
	box([
		flex([
			txt(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
			)
				.tag(tags.testimonial)
				.css({
					fontSize: fontSizes.h2.desktop,
					color: color('primary'),
					marginBottom: '15px',
				})
				.cssTablet({
					fontSize: fontSizes.h2.tablet,
				})
				.cssMobile({
					fontSize: fontSizes.h2.mobile,
				}),
			txt('Jane Smith')
				.tag(tags.name)
				.css({
					color: color('primary', 0.9),
					fontSize: fontSizes.h4.desktop,
				})
				.cssTablet({
					fontSize: fontSizes.h4.tablet,
				})
				.cssMobile({
					fontSize: fontSizes.h4.mobile,
				}),
			txt('Founder, Green Tech')
				.tag(tags.title)
				.css({
					fontSize: fontSizes.normal.desktop,
					color: color('text'),
				})
				.cssTablet({
					fontSize: fontSizes.normal.tablet,
				})
				.cssMobile({
					fontSize: fontSizes.normal.mobile,
				}),
		]).css({
			flexDirection: 'column',
		}),
		flex([
			img('https://files.dotenx.com/assets/profile2-ba1.jpeg')
				.tag(tags.image)
				.css({
					width: '70%',
					borderRadius: '10px',
					aspectRatio: '1/1',
				})
				.css({
					maxHeight: '200px',
					width: 'auto',
				}),
		])
			.css({
				alignItems: 'center',
				justifyContent: 'center',
			})
			.cssMobile({
				order: '-1',
			}),
	])
		.css({
			display: 'grid',
			gridTemplateColumns: '1fr 1fr',
			backgroundColor: color('background'),
			flex: '100% 0 0',
			paddingTop: '50px',
			paddingBottom: '50px',
			paddingLeft: '30px',
			paddingRight: '30px',
		})
		.cssTablet({
			paddingTop: '30px',
			paddingBottom: '30px',
			paddingLeft: '20px',
			paddingRight: '20px',
			rowGap: '15px',
		})
		.cssMobile({
			gridTemplateColumns: '1fr',
		})

const cards = () =>
	flex(_.times(5, card))
		.css({
			gap: '20px',
			overflowX: 'auto',
			scrollBehavior: 'smooth',
			borderRadius: '10px',
		})
		.class('cards')
		.tag(tags.cardList)

const pagination = box([
	btn('')
		.css({
			width: '30px',
			height: '5px',
			padding: '0',
			backgroundColor: color('primary'),
		})
		.tag(tags.buttonActive)
		.class('active'),
	btn('')
		.css({
			width: '30px',
			height: '5px',
			padding: '0',
			backgroundColor: color('primary', 0.5),
		})
		.tag(tags.buttonInactive)
		.class('inactive'),
])
	.css({
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		columnGap: '10px',
		marginTop: '20px',
	})
	.class('pagination')

const component = () => paper([container([cards(), pagination])])
