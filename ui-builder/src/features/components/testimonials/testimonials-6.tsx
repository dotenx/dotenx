import componentImage from '../../../assets/components/testimonials/testimonials-6.png'
import { box, flex, txt } from '../../elements/constructor'
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

export class Testimonials6 extends Component {
	name = 'Testimonials 6'
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
				insertElement={() =>
					item(
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.'
					)
				}
				renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: BoxElement }) {
	const quote = item.find(tags.items.quote) as TextElement
	const image = item.find(tags.items.image) as ImageElement
	const title = item.find(tags.items.title) as TextElement
	const desc = item.find(tags.items.desc) as TextElement

	return (
		<OptionsWrapper>
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
	cmn.ppr.el([
		box([
			cmn.heading.el('Customer testimonials'),
			cmn.desc.el('Lorem ipsum dolor sit amet, consectetur adipiscing elit.').css({
				marginBottom: '3rem',
			}),
		]).css({
			textAlign: 'center',
		}),
		list(),
	])

const list = () =>
	box([
		item(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.'
		),
		item(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.'
		),
		item(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.'
		),
		item(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.'
		),
		item(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.'
		),
		item(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.'
		),
	])
		.css({
			columnCount: '3',
		})
		.cssTablet({
			columnCount: '2',
		})
		.cssMobile({
			columnCount: '1',
		})
		.tag(tags.list)

const item = (text: string) =>
	box([
		cmn.stars.el().css({
			marginBottom: '1.5rem',
		}),
		cmn.desc
			.el(text)
			.css({
				marginBottom: '1.5rem',
			})
			.tag(tags.items.quote),
		flex([
			cmn.profile.el().tag(tags.items.image),
			box([
				txt('Name Surname')
					.css({
						fontWeight: '600',
					})
					.tag(tags.items.title),
				txt('Position, Company name').tag(tags.items.desc),
			]),
		]).css({
			gap: '1rem',
			alignItems: 'center',
		}),
	]).css({
		border: '1px solid #000',
		padding: '2rem',
		marginBottom: '2rem',
		display: 'inline-block',
		width: '100%',
	})
