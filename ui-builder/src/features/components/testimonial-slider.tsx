import _ from 'lodash'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/testimonial-slider.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, icn, img, template, txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { setElement, useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { IconElement } from '../elements/extensions/icon'
import { ImageElement } from '../elements/extensions/image'
import { TemplateElement } from '../elements/extensions/template'
import { TextElement } from '../elements/extensions/text'
import testimonialSliderScript from '../scripts/testimonial-slider.js?raw'
import { useSelectedElement } from '../selection/use-selected-component'
import { fontSizes } from '../simple/font-sizes'
import { color } from '../simple/palette'
import { ColorStyler } from '../simple/stylers/color-styler'
import { ImageStyler } from '../simple/stylers/image-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Expression } from '../states/expression'
import { Component, ElementOptions, OnCreateOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class TestimonialSlider extends Component {
	name = 'Testimonials with slider'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(testimonialSliderScript)
		const script = compiled({
			id: root.id,
		})
		setElement(root, (draft) => (draft.script = script))
	}

	renderOptions(options?: ElementOptions<Element> | undefined): ReactNode {
		return <TestimonialSliderOptions />
	}
}

// =============  renderOptions =============

function TestimonialSliderOptions() {
	const set = useSetElement()
	const component = useSelectedElement<BoxElement>()!
	const splideList = component.find<BoxElement>(tagIds.splideList)!
	const template = component.find<TemplateElement>(tagIds.template)!
	const rightIconBackground = template.find<BoxElement>(tagIds.rightIconBackground)!
	const rightIcon = rightIconBackground.children![0] as IconElement
	const leftIconBackground = template.find<BoxElement>(tagIds.leftIconBackground)!
	const leftIcon = leftIconBackground.children![0] as IconElement

	const preview = component.find<BoxElement>(tagIds.preview)!
	const previewPhoto = component.find<ImageElement>(tagIds.previewPhoto)!
	const previewQuotationMark = preview.find<TextElement>(tagIds.quotationMark)!
	const previewName = preview.find<TextElement>(tagIds.name)!
	const previewTestimonial = preview.find<TextElement>(tagIds.testimonial)!
	const previewRightIconBackground = preview.find<BoxElement>(tagIds.rightIconBackground)!
	const previewRightIcon = previewRightIconBackground.children![0] as IconElement
	const previewLeftIconBackground = preview.find<BoxElement>(tagIds.leftIconBackground)!
	const previewLeftIcon = previewLeftIconBackground.children![0] as IconElement

	const updatePreview = (activeItemId: string) => {
		const activeItem = splideList.children!.find((item) => item.id === activeItemId)!
		if (!activeItem) {
			return
		}
		set(
			previewPhoto,
			(draft) => (draft.data.src = activeItem.find<ImageElement>(tagIds.photo)!.data.src)
		)
		set(
			previewName,
			(draft) => (draft.data.text = activeItem.find<TextElement>(tagIds.name)!.data.text)
		)
		set(
			previewTestimonial,
			(draft) =>
				(draft.data.text = activeItem.find<TextElement>(tagIds.testimonial)!.data.text)
		)
	}

	return (
		<ComponentWrapper name="Testimonials with slider">
			<DndTabs
				containerElement={splideList}
				insertElement={() =>
					createSplideItem(
						'https://files.dotenx.com/assets/profile-large-xz3.jpeg',
						'Sam Smith',
						'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
					)
				}
				renderItemOptions={(item) => (
					<ItemOptions
						item={item}
						previewPhoto={previewPhoto}
						previewName={previewName}
						previewTestimonial={previewTestimonial}
						previewQuotationMark={previewQuotationMark}
						set={set}
					/>
				)}
				onTabChanged={(id) => updatePreview(id)}
			/>
			<ColorStyler
				label="Button backgrounds"
				element={rightIconBackground}
				isBackground={true}
				onChange={(color) => {
					set(
						leftIconBackground,
						(draft) => (draft.style!.desktop!.default!.backgroundColor = color)
					)
					set(
						previewRightIconBackground,
						(draft) => (draft.style!.desktop!.default!.backgroundColor = color)
					)
					set(
						previewLeftIconBackground,
						(draft) => (draft.style!.desktop!.default!.backgroundColor = color)
					)
				}}
			/>
			<ColorStyler
				label="Arrows"
				element={rightIcon}
				onChange={(color) => {
					set(leftIcon, (draft) => (draft.style!.desktop!.default!.color = color))
					set(previewRightIcon, (draft) => (draft.style!.desktop!.default!.color = color))
					set(previewLeftIcon, (draft) => (draft.style!.desktop!.default!.color = color))
				}}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({
	item,
	previewPhoto,
	previewQuotationMark,
	previewName,
	previewTestimonial,
	set,
}: {
	item: Element
	previewPhoto: ImageElement
	previewQuotationMark: TextElement
	previewName: TextElement
	previewTestimonial: TextElement
	set: (element: Element, fn: (draft: Element) => void) => void
}) {
	const qm = item.find<TextElement>(tagIds.quotationMark)!
	const photo = item.find<ImageElement>(tagIds.photo)!
	const name = item.find<TextElement>(tagIds.name)!
	const testimonial = item.find<TextElement>(tagIds.testimonial)!

	return (
		<OptionsWrapper>
			<ImageStyler
				element={previewPhoto}
				onChange={(src) => set(photo, (draft) => (draft.data!.src = src))}
			/>
			<TextStyler
				label="Quotation mark"
				element={qm}
				onChange={(text) =>
					set(
						previewQuotationMark,
						(draft) => (draft.data!.text = Expression.fromString(text))
					)
				}
			/>
			<TextStyler
				label="Name"
				element={name}
				onChange={(text) =>
					set(previewName, (draft) => (draft.data!.text = Expression.fromString(text)))
				}
			/>
			<TextStyler
				label="Testimonial"
				element={testimonial}
				onChange={(text) =>
					set(
						previewTestimonial,
						(draft) => (draft.data!.text = Expression.fromString(text))
					)
				}
			/>
		</OptionsWrapper>
	)
}

const tagIds = {
	splideList: 'splideList',
	splideTrack: 'splideTrack',
	testimonial: 'testimonial',
	quotationMark: 'quotationMark',
	name: 'name',
	photo: 'photo',
	preview: 'preview',
	previewPhoto: 'previewPhoto',
	rightIconBackground: 'rightIconBackground',
	leftIconBackground: 'leftIconBackground',
	template: 'template',
}
// =============  defaultData =============

const wrapper = box([])
	.css({
		textAlign: 'center',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		paddingLeft: '15%',
		paddingRight: '15%',
		paddingTop: '50px',
		paddingBottom: '50px',
	})
	.cssTablet({
		paddingLeft: '10%',
		paddingRight: '10%',
		paddingTop: '40px',
		paddingBottom: '40px',
	})
	.cssMobile({
		paddingLeft: '5%',
		paddingRight: '5%',
		paddingTop: '30px',
		paddingBottom: '30px',
	})
	.serialize()

const createSplideItem = (image: string, name: string, testimonial: string) => {
	return box([
		box([
			img(image)
				.css({
					display: 'none',
					width: '0px',
				})
				.class(['photo'])
				.tag(tagIds.photo),
			txt('“')
				.css({
					color: color('secondary'),
					fontSize: '36px',
					fontWeight: 'bold',
					height: '3px',
					marginBottom: '5px',
				})
				.tag(tagIds.quotationMark),
			txt(testimonial)
				.css({
					color: color('text'),
					fontSize: fontSizes.h2.desktop,
					margin: '0px',
					textAlign: 'start',
				})
				.cssTablet({
					fontSize: fontSizes.h2.tablet,
				})
				.cssMobile({
					fontSize: fontSizes.h2.mobile,
				})
				.tag(tagIds.testimonial),
			txt(name)
				.css({
					color: color('text', 0.9),
					fontSize: fontSizes.normal.desktop,
					margin: '0px',
				})
				.cssTablet({
					fontSize: fontSizes.normal.tablet,
				})
				.cssMobile({
					fontSize: fontSizes.normal.mobile,
				})
				.tag(tagIds.name),
		])
			.css({
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'start',
				justifyContent: 'center',
				rowGap: '15px',
			})
			.cssMobile({
				paddingLeft: '12%',
				paddingRight: '12%',
			}),
	]).class(['splide__slide'])
}

const splideList = [
	createSplideItem(
		'https://files.dotenx.com/assets/profile-large-349.jpeg',
		'- Alex Smith',
		'Vitae suscipit tellus mauris a diam maecenas sed enim ut. Mauris augue neque gravida in fermentum. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
	),
	createSplideItem(
		'https://files.dotenx.com/assets/profile-large-o123.jpeg',
		'- John Smith',
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
	),
	createSplideItem(
		'https://files.dotenx.com/assets/profile-large-xc92.jpeg',
		'- Jane Smith',
		'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
	),
	createSplideItem(
		'https://files.dotenx.com/assets/profile-large-xz3.jpeg',
		'- Sam Smith',
		'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
	),
]

const arrows = box([
	box([
		icn('chevron-left').css({
			color: color('primary'),
			fontSize: '16px',
			width: '16px',
			height: '16px',
		}),
	])
		.as('button')
		.tag(tagIds.leftIconBackground)
		.class(['prev'])
		.css({
			backgroundColor: color('background', 0.8),
			border: 'none',
			borderRadius: '50%',
			width: '40px',
			height: '40px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}),
	box([
		icn('chevron-right').css({
			color: color('primary'),
			fontSize: '16px',
			width: '16px',
			height: '16px',
			display: 'flex',
			justifyContent: 'center',
		}),
	])
		.as('button')
		.tag(tagIds.rightIconBackground)
		.class(['next'])
		.css({
			backgroundColor: color('background', 0.8),
			border: 'none',
			borderRadius: '50%',
			width: '40px',
			height: '40px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		}),
])
	.css({
		display: 'flex',
		columnGap: '15px',
		marginTop: '20px',
	})
	.cssTablet({
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	})

const splideListWrapper = box(splideList).tag(tagIds.splideList).class(['splide__list'])

const splide = template(
	box([box([splideListWrapper]).class(['splide__track']), arrows])
		.tag(tagIds.splideTrack)
		.css({
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'start',
			justifyContent: 'start',
			rowGap: '15px',
		})
		.class(['splide'])
)
	.class(['template'])
	.tag(tagIds.template)

const image = box([
	img('https://files.dotenx.com/assets/profile-large-349.jpeg')
		.css({
			width: '100%',
			borderRadius: '20px',
			maxWidth: '100%',
			aspectRatio: '1',
			overflow: 'hidden',
		})
		.cssTablet({
			maxWidth: '50%',
		})
		.tag(tagIds.previewPhoto)
		.class(['photo']),
]).css({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
})

// This is similar to splide variable but it doesn't have the Splide classes and also has only one item
const preview = box([
	box([
		box([
			createSplideItem(
				'https://files.dotenx.com/assets/profile-large-xz3.jpeg',
				'- Sam Smith',
				'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
			),
			arrows,
		]).tag(tagIds.preview),
	]).class(['preview']),
])
	.css({
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'start',
		justifyContent: 'center',
	})
	.class(['splide-place-holder'])

const grid = box([image, preview, splide])
	.css({
		display: 'grid',
		gridTemplateColumns: '1fr 4fr',
		columnGap: '40px',
	})
	.cssTablet({
		gridTemplateColumns: '1fr',
		rowGap: '10px',
	})
	.serialize()

const defaultData = {
	...wrapper,
	components: [grid],
}
