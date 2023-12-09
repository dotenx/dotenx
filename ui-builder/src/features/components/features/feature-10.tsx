import { produce } from 'immer'
import _ from 'lodash'
import componentImage from '../../../assets/components/features/feature-10.png'
import { gridCols } from '../../../utils/style-utils'
import { box, container, flex, grid, img, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { findElement, setElement, useElementsStore } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ImageElement } from '../../elements/extensions/image'
import { TextElement } from '../../elements/extensions/text'
import componentScript from '../../scripts/feature-10.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { Expression } from '../../states/expression'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'

export class Feature10 extends Component {
	name = 'Feature 10'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		console.log(componentScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

function Options() {
	const silenceSet = useElementsStore((store) => store.silenceSet)
	const component = useSelectedElement<BoxElement>()!
	const subheadingList = component.find<BoxElement>(tags.subheading.list)!
	const image = component.find<ImageElement>(tags.image)!

	return (
		<ComponentWrapper name="Feature 10">
			<DndTabs
				containerElement={subheadingList}
				insertElement={() =>
					subheading('https://files.dotenx.com/assets/random-10-b01.jpg')
				}
				renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
				onTabChanged={(id) => {
					const item = findElement(id, subheadingList.children)
					if (!item) return
					const img = item.find<ImageElement>(tags.subheading.image)
					if (!img) return
					silenceSet(
						produce(image, (draft) => {
							draft.data.src = img.data.src
						})
					)
					silenceSet(
						produce(subheadingList, (draft) => {
							draft.children.forEach((child) => {
								if (child.id !== id) {
									_.set(
										child,
										'style.desktop.default.borderLeftColor',
										'transparent'
									)
								}
							})
						})
					)
					silenceSet(
						produce(item, (draft) => {
							_.set(draft, 'style.desktop.default.borderLeftColor', '#000')
						})
					)
				}}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: BoxElement }) {
	const silenceSet = useElementsStore((store) => store.silenceSet)
	const component = useSelectedElement<BoxElement>()!
	const title = item.find<TextElement>(tags.subheading.title)!
	const description = item.find<TextElement>(tags.subheading.description)!
	const placeholderImage = component.find<ImageElement>(tags.image)!
	const image = item.find<ImageElement>(tags.subheading.image)!

	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={description} />
			<ImageStyler
				element={image}
				onChange={(src) => {
					silenceSet(
						produce(placeholderImage, (draft) => {
							draft.data.src = Expression.fromString(src)
						})
					)
				}}
			/>
		</OptionsWrapper>
	)
}

const tags = {
	subheading: {
		list: 'list',
		title: 'title',
		description: 'description',
		image: 'subheading-image',
	},
	image: 'image',
}

const component = () =>
	box([
		container([
			grid(2)
				.populate([
					box([
						flex([
							subheading('https://files.dotenx.com/assets/random-10-b01.jpg').css({
								borderLeftColor: '#000',
							}),
							subheading('https://files.dotenx.com/assets/random-120-zed.jpg'),
							subheading('https://files.dotenx.com/assets/random-200-o24.jpg'),
						])
							.css({
								paddingTop: '0.5rem',
								paddingBottom: '0.5rem',
								columnGap: '1rem',
								rowGap: '2.5rem',
								flexDirection: 'column',
							})
							.cssTablet({
								gridTemplateColumns: gridCols(1),
							})
							.tag(tags.subheading.list),
					]),
					img('https://files.dotenx.com/assets/random-10-b01.jpg')
						.tag(tags.image)
						.css({
							maxHeight: '500px',
							width: '100%',
						})
						.class('image'),
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

const subheading = (imgUrl: string) =>
	box([
		txt('Short heading goes here')
			.css({
				fontWeight: '700',
				fontSize: '2rem',
				lineHeight: '1.3',
				marginBottom: '1rem',
			})
			.cssTablet({
				fontSize: '1.5rem',
				lineHeight: '1.4',
			})
			.tag(tags.subheading.title),
		txt(
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.'
		)
			.css({
				fontSize: '1rem',
				lineHeight: '1.5',
			})
			.tag(tags.subheading.description),
		img(imgUrl).tag(tags.subheading.image).css({
			display: 'none',
		}),
	])
		.css({
			paddingLeft: '2rem',
			cursor: 'pointer',
			borderLeft: '2px solid transparent',
		})
		.class('subheading')
