// relume feature 31
import componentImage from '../../../assets/components/features/feature-7.png'
import { gridCols } from '../../../utils/style-utils'
import { box, container, flex, grid, icn, img, link, txt } from '../../elements/constructor'
import { BoxElement } from '../../elements/extensions/box'
import { IconElement } from '../../elements/extensions/icon'
import { ImageElement } from '../../elements/extensions/image'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import { useSelectedElement } from '../../selection/use-selected-component'
import { IconStyler } from '../../simple/stylers/icon-styler'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { LinkStyler } from '../../simple/stylers/link-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'

export class Feature7 extends Component {
	name = 'Feature 7'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	const component = useSelectedElement<BoxElement>()!
	const image = component.find<ImageElement>(tags.image)!
	const subheadingList = component.find<BoxElement>(tags.subheading.list)!

	return (
		<ComponentWrapper name="Feature 7">
			<ImageStyler element={image} />
			<DndTabs
				containerElement={subheadingList}
				insertElement={subheading}
				renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: BoxElement }) {
	const title = item.find<TextElement>(tags.subheading.title)!
	const description = item.find<TextElement>(tags.subheading.description)!
	const icon = item.find<IconElement>(tags.subheading.icon)!
	const link = item.find<LinkElement>(tags.subheading.link)!
	const linkText = link.find<TextElement>(tags.subheading.linkText)!

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={description} />
			<IconStyler label="Icon" element={icon} />
			<LinkStyler label="Link" element={link} />
			<TextStyler label="Link text" element={linkText} />
		</OptionsWrapper>
	)
}

const tags = {
	subheading: {
		list: 'list',
		title: 'title',
		description: 'description',
		icon: 'icon',
		link: 'link',
		linkText: 'linkText',
	},
	image: 'image',
}

const component = () =>
	box([
		container([
			grid(2)
				.populate([
					box([
						grid(2)
							.populate([subheading(), subheading(), subheading(), subheading()])
							.css({
								paddingTop: '0.5rem',
								paddingBottom: '0.5rem',
								columnGap: '1.5rem',
								rowGap: '2rem',
							})
							.cssTablet({
								gridTemplateColumns: gridCols(1),
							})
							.tag(tags.subheading.list),
					]),
					img('https://files.dotenx.com/assets/hero-bg-wva.jpeg').tag(tags.image),
				])
				.css({
					columnGap: '80px',
					rowGap: '64px',
				})
				.cssTablet({
					gridTemplateColumns: gridCols(1),
				}),
		]),
	])
		.css({
			paddingTop: '7rem',
			paddingBottom: '7rem',
			paddingRight: '5%',
			paddingLeft: '5%',
		})
		.cssTablet({
			paddingTop: '4rem',
			paddingBottom: '4rem',
		})

const subheading = () =>
	box([
		icn('square').size('3rem').tag(tags.subheading.icon).css({
			marginBottom: '1rem',
		}),
		box([
			txt('Short heading here')
				.css({
					fontWeight: '700',
					fontSize: '1.5rem',
					lineHeight: '1.4',
					marginBottom: '1rem',
				})
				.cssTablet({
					fontSize: '1.25rem',
				})
				.tag(tags.subheading.title),
			txt(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'
			)
				.css({
					fontSize: '1rem',
					lineHeight: '1.5',
					marginBottom: '1.5rem',
				})
				.tag(tags.subheading.description),
		]),
		link()
			.populate([
				flex([
					txt('Button').tag(tags.subheading.linkText),
					icn('chevron-right').size('16px'),
				]).css({
					alignItems: 'center',
					padding: '0.25rem 0',
					gap: '8px',
				}),
			])
			.tag(tags.subheading.link),
	])
