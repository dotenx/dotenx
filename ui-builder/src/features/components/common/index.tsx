import _, { times } from 'lodash'
import { useCallback, useEffect } from 'react'
import { gridCols } from '../../../utils/style-utils'
import { box, container, flex, grid, icn, img, link, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { IconElement } from '../../elements/extensions/icon'
import { ImageElement } from '../../elements/extensions/image'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import { useSelectedElement } from '../../selection/use-selected-component'
import { SliderNoMemo } from '../../simple/stylers/columns-styler'
import { IconStyler } from '../../simple/stylers/icon-styler'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { LinkStyler } from '../../simple/stylers/link-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { DndTabs } from '../helpers/dnd-tabs'
import { OptionsWrapper } from '../helpers/options-wrapper'

export const duplicate = (elConstructor: () => Element, number: number) =>
	_.range(number).map(elConstructor)

const tag = {
	icnSubheading: {
		lst: 'lst',
		icn: 'icn',
		title: 'title',
		desc: 'desc',
	},
	tagline: 'tagline',
	heading: 'heading',
	desc: 'desc',
	btnLink: {
		link1Txt: 'link1Txt',
		link1: 'link1',
		link2Txt: 'link2Txt',
		link2: 'link2',
	},
	icnLst: {
		lst: 'lst',
		icn: 'icn',
		txt: 'txt',
	},
	icnHeading: 'icnHeading',
	subheading: {
		lst: 'lst',
		title: 'title',
		desc: 'desc',
	},
	fullImg: 'fullImg',
	smlSubheading: {
		title: 'title',
		desc: 'desc',
	},
	brands: {
		lst: 'lst',
		img: 'img',
	},
	stars: 'stars',
}
// ---------------------------------------------------------------

// =============================================================== Icon Subheadings
const icnSubheadings = () =>
	grid(2)
		.populate([icnSubheading('Subheading one'), icnSubheading('Subheading two')])
		.css({
			paddingTop: '0.5rem',
			paddingBottom: '0.5rem',
			gap: '1.5rem',
		})
		.cssTablet({
			gridTemplateColumns: gridCols(1),
		})
		.tag(tag.icnSubheading.lst)

const icnSubheading = (title: string) =>
	flex([
		icn('cube').size('32px').tag(tag.icnSubheading.icn),
		box([
			txt(title)
				.css({
					fontWeight: '700',
					fontSize: '1.25rem',
					lineHeight: '1.4',
					marginBottom: '1rem',
				})
				.tag(tag.icnSubheading.title),
			txt(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'
			)
				.css({
					fontSize: '1rem',
					lineHeight: '1.5',
				})
				.tag(tag.icnSubheading.desc),
		]),
	]).css({
		gap: '1rem',
	})

function IcnSubheadingsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const subheadingList = component.find<BoxElement>(tag.icnSubheading.lst)!
	return (
		<DndTabs
			containerElement={subheadingList}
			insertElement={() => icnSubheading('Subheading')}
			renderItemOptions={(item) => <IcnSubheadingOptions item={item as BoxElement} />}
		/>
	)
}

function IcnSubheadingOptions({ item }: { item: BoxElement }) {
	const title = item.find<TextElement>(tag.icnSubheading.title)!
	const description = item.find<TextElement>(tag.icnSubheading.desc)!
	const icon = item.find<IconElement>(tag.icnSubheading.icn)!
	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={description} />
			<IconStyler label="Icon" element={icon} />
		</OptionsWrapper>
	)
}

// =============================================================== Paper
const ppr = (children: Element[]) =>
	box([container(children)])
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

// =============================================================== Full Background
const fullBg = (children: Element[]) =>
	ppr(children).css({
		color: '#fff',
		backgroundImage: 'url(https://files.dotenx.com/assets/hero-bg-wva.jpeg)',
	})

// =============================================================== Half Grid
const halfGrid = (children: Element[]) =>
	grid(2)
		.populate(children)
		.css({
			columnGap: '80px',
			rowGap: '64px',
		})
		.cssTablet({
			gridTemplateColumns: gridCols(1),
		})

// =============================================================== Tagline
const tagline = () =>
	txt('Tagline')
		.css({
			fontWeight: '600',
			fontSize: '1rem',
			lineHeight: '1.5',
			marginBottom: '1rem',
		})
		.tag(tag.tagline)

function TaglineOptions({ root }: { root?: BoxElement }) {
	const component = useSelectedElement<BoxElement>()!
	const parent = root ?? component
	const tagline = parent.find<TextElement>(tag.tagline)!
	return <TextStyler label="Tagline" element={tagline} />
}

// =============================================================== Heading
const heading = (text?: string) =>
	txt(text ?? 'Medium length section heading goes here')
		.css({
			fontWeight: '700',
			fontSize: '3rem',
			lineHeight: '1.2',
			marginBottom: '1.5rem',
		})
		.cssTablet({
			fontSize: '2.25rem',
		})
		.tag(tag.heading)

function HeadingOptions({ root }: { root?: BoxElement }) {
	const component = useSelectedElement<BoxElement>()!
	const parent = root ?? component
	const heading = parent.find<TextElement>(tag.heading)!
	return <TextStyler label="Heading" element={heading} />
}

// =============================================================== Description
const desc = (text?: string) =>
	txt(
		text ??
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.'
	)
		.css({
			fontSize: '1.125rem',
			lineHeight: '1.5',
			marginBottom: '2rem',
		})
		.cssTablet({
			fontSize: '1rem',
		})
		.tag(tag.desc)

function DescOptions({ root }: { root?: BoxElement }) {
	const component = useSelectedElement<BoxElement>()!
	const parent = root ?? component
	const description = parent.find<TextElement>(tag.desc)!
	return <TextStyler label="Description" element={description} />
}

// =============================================================== Icon List
const icnLst = () =>
	flex(duplicate(icnLstItm, 3))
		.css({
			paddingTop: '0.5rem',
			paddingBottom: '0.5rem',
			gap: '1rem',
			flexDirection: 'column',
		})
		.tag(tag.icnLst.lst)

const icnLstItm = () =>
	flex([
		icn('cube').size('24px').tag(tag.icnLst.icn),
		txt('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
			.css({
				fontSize: '1rem',
				lineHeight: '1.5',
			})
			.tag(tag.icnLst.txt),
	]).css({
		gap: '1rem',
		alignItems: 'center',
	})

function IcnLstOptions() {
	const component = useSelectedElement<BoxElement>()!
	const iconList = component.find<BoxElement>(tag.icnLst.lst)!
	return (
		<DndTabs
			containerElement={iconList}
			insertElement={icnLstItm}
			renderItemOptions={(item) => <IcnLstItmOptions item={item as BoxElement} />}
		/>
	)
}

function IcnLstItmOptions({ item }: { item: BoxElement }) {
	const text = item.find<TextElement>(tag.icnLst.txt)!
	const icon = item.find<IconElement>(tag.icnLst.icn)!

	return (
		<OptionsWrapper>
			<TextStyler label="Description" element={text} />
			<IconStyler label="Icon" element={icon} />
		</OptionsWrapper>
	)
}

// =============================================================== Button Links
const btnLinks = () =>
	flex([
		link()
			.populate([txt('Button').tag(tag.btnLink.link1Txt)])
			.css({
				border: '1px solid currentcolor',
				padding: '0.75rem 1.5rem',
			})
			.tag(tag.btnLink.link1),
		link()
			.populate([
				flex([
					txt('Button').tag(tag.btnLink.link2Txt),
					icn('chevron-right').size('16px'),
				]).css({
					alignItems: 'center',
					padding: '0.75rem 1.5rem',
					gap: '8px',
				}),
			])
			.tag(tag.btnLink.link2),
	]).css({
		marginTop: '2rem',
		gap: '1rem',
	})

function BtnLinksOptions({ root }: { root?: BoxElement }) {
	const component = useSelectedElement<BoxElement>()!
	const parent = root ?? component
	const link1 = parent.find<LinkElement>(tag.btnLink.link1)!
	const link1Text = link1.find<TextElement>(tag.btnLink.link1Txt)!
	const link2 = parent.find<LinkElement>(tag.btnLink.link2)!
	const link2Text = link2.find<TextElement>(tag.btnLink.link2Txt)!
	return (
		<>
			<LinkStyler label="Link 1" element={link1} />
			<TextStyler label="Link 1 text" element={link1Text} />
			<LinkStyler label="Link 2" element={link2} />
			<TextStyler label="Link 2 text" element={link2Text} />
		</>
	)
}

// =============================================================== Icon Heading
const icnHeading = () =>
	icn('cube')
		.size('48px')
		.css({
			marginBottom: '1.5rem',
		})
		.tag(tag.icnHeading)

function IcnHeadingOptions({ root }: { root?: BoxElement }) {
	const component = useSelectedElement<BoxElement>()!
	const parent = root ?? component
	const icon = parent.find<IconElement>(tag.icnHeading)!
	return <IconStyler label="Icon" element={icon} />
}

// =============================================================== Subheadings
const subheadings = () =>
	grid(2)
		.populate(duplicate(subheading, 2))
		.css({
			paddingTop: '0.5rem',
			paddingBottom: '0.5rem',
			gap: '1.5rem',
		})
		.cssTablet({
			gridTemplateColumns: gridCols(1),
		})
		.tag(tag.subheading.lst)

const subheading = () =>
	flex([
		box([
			txt('50%')
				.css({
					fontSize: '3rem',
					lineHeight: '1.2',
					fontWeight: '700',
					marginBottom: '0.5rem',
				})
				.tag(tag.subheading.title),
			txt(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'
			)
				.css({
					fontSize: '1rem',
					lineHeight: '1.5',
				})
				.tag(tag.subheading.desc),
		]),
	]).css({
		gap: '1rem',
	})

function SubheadingsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const subheadingList = component.find<BoxElement>(tag.subheading.lst)!
	return (
		<DndTabs
			containerElement={subheadingList}
			insertElement={subheading}
			renderItemOptions={(item) => <SubheadingOptions item={item as BoxElement} />}
		/>
	)
}

function SubheadingOptions({ item }: { item: BoxElement }) {
	const title = item.find<TextElement>(tag.subheading.title)!
	const description = item.find<TextElement>(tag.subheading.desc)!
	return (
		<OptionsWrapper>
			<TextStyler label="Title" element={title} />
			<TextStyler label="Description" element={description} />
		</OptionsWrapper>
	)
}

// =============================================================== Full Image
const fullImg = () =>
	img('https://files.dotenx.com/assets/hero-bg-wva.jpeg')
		.css({
			marginTop: '5rem',
		})
		.tag(tag.fullImg)

function FullImgOptions({ root }: { root?: BoxElement }) {
	const component = useSelectedElement<BoxElement>()!
	const parent = root ?? component
	const image = parent.find<ImageElement>(tag.fullImg)!
	return <ImageStyler element={image} />
}

// =============================================================== Small Subheading
const smlSubheading = (title: string) =>
	flex([
		box([
			txt(title)
				.css({
					fontWeight: '700',
					fontSize: '1.25rem',
					lineHeight: '1.4',
					marginBottom: '1rem',
				})
				.tag(tag.smlSubheading.title),
			txt(
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'
			)
				.css({
					fontSize: '1rem',
					lineHeight: '1.5',
				})
				.tag(tag.smlSubheading.desc),
		]),
	]).css({
		gap: '1rem',
	})

// =============================================================== Brands
const brands = () =>
	flex([brand(), brand(), brand(), brand()])
		.css({
			paddingTop: '0.5rem',
			paddingBottom: '0.5rem',
			columnGap: '2rem',
			rowGap: '1.5rem',
			flexWrap: 'wrap',
		})
		.tag(tag.brands.lst)

const brand = () =>
	img('https://files.dotenx.com/assets/Logo10-nmi1.png')
		.css({
			width: '120px',
			height: '48px',
		})
		.tag(tag.brands.img)

function BrandsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const brandList = component.find<BoxElement>(tag.brands.lst)!
	return (
		<DndTabs
			containerElement={brandList}
			insertElement={brand}
			renderItemOptions={(item) => <BrandOptions item={item as BoxElement} />}
		/>
	)
}

function BrandOptions({ item }: { item: BoxElement }) {
	const image = item.find<ImageElement>(tag.brands.img)!
	return <ImageStyler element={image} />
}

// =============================================================== Quote
const quote = () =>
	txt(
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'
	).css({
		fontSize: '1.25rem',
		lineHeight: '1.4',
		fontWeight: '700',
		margin: '2rem 0',
	})

// =============================================================== Profile
const profile = () =>
	img().css({
		marginBottom: '1rem',
		width: '3.5rem',
		height: '3.5rem',
		backgroundColor: '#eee',
		borderRadius: '999px',
	})

// =============================================================== Stars
const stars = () =>
	flex(genStars(3.5, 5))
		.css({
			gap: '4px',
		})
		.tag(tag.stars)

const star = () => icn('star').size('20px')
const halfStar = () => icn('star-half-alt').size('20px')
const emptyStar = () => icn('star', 'far').size('20px')

function StarsOptions({ root }: { root?: BoxElement }) {
	const set = useSetElement()
	const component = useSelectedElement() as BoxElement
	const parent = root ?? component
	const stars = parent.find(tag.stars) as BoxElement
	const rating = (stars.internal.rating as number) ?? 3.5

	const setStars = useCallback(
		(count: number) =>
			set(stars, (draft) => {
				draft.internal.rating = count
				draft.children = genStars(count, 5)
			}),
		[set, stars]
	)

	useEffect(() => {
		if (!stars.internal.rating) {
			setStars(3.5)
		}
	}, [setStars, stars.internal.rating])

	return (
		<OptionsWrapper>
			<SliderNoMemo step={0.5} max={5} min={0} value={rating} onChange={setStars} />
		</OptionsWrapper>
	)
}

const genStars = (rating: number, maxRating: number) => [
	...times(Math.floor(rating), star),
	...(_.isInteger(rating) ? [] : [halfStar()]),
	...times(Math.floor(maxRating - rating), emptyStar),
]

// =============================================================== Dots
const dots = () =>
	flex([
		dot().css({
			backgroundColor: '#222222',
		}),
		dot(),
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

// =============================================================== Icon Button
const icnButton = (icon: string) =>
	box([icn(icon).size('18px')]).css({
		border: '1px solid currentcolor',
		borderRadius: '999px',
		width: '3rem',
		height: '3rem',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		cursor: 'pointer',
		flexShrink: '0',
		backgroundColor: '#fff',
		zIndex: '1',
	})

// =============================================================== Slider Item
const sliderItm = (children: Element[]) =>
	box(children)
		.css({
			flexShrink: '0',
			flexBasis: 'calc(100% / 3)',
			transition: 'transform 500ms ease',
		})
		.cssTablet({
			flexBasis: '50%',
		})
		.cssMobile({
			flexBasis: '100%',
		})

// =============================================================== Outline Button
const outlineBtn = () =>
	link()
		.populate([txt('Button').tag(tag.btnLink.link1Txt)])
		.css({
			border: '1px solid currentcolor',
			padding: '0.75rem 1.5rem',
			display: 'inline-flex',
		})
		.tag(tag.btnLink.link1)

function OutlineBtnOptions() {
	const component = useSelectedElement<BoxElement>()!
	const link1 = component.find<LinkElement>(tag.btnLink.link1)!
	const link1Text = link1.find<TextElement>(tag.btnLink.link1Txt)!
	return (
		<>
			<LinkStyler label="Link 1" element={link1} />
			<TextStyler label="Link 1 text" element={link1Text} />
		</>
	)
}
// ---------------------------------------------------------------
export const cmn = {
	icnSubheadings: {
		el: icnSubheadings,
		Options: IcnSubheadingsOptions,
	},
	ppr: {
		el: ppr,
	},
	fullBg: {
		el: fullBg,
	},
	halfGrid: {
		el: halfGrid,
	},
	tagline: {
		el: tagline,
		Options: TaglineOptions,
	},
	heading: {
		el: heading,
		Options: HeadingOptions,
	},
	desc: {
		el: desc,
		Options: DescOptions,
	},
	icnLst: {
		el: icnLst,
		Options: IcnLstOptions,
	},
	btnLinks: {
		el: btnLinks,
		Options: BtnLinksOptions,
	},
	icnHeading: {
		el: icnHeading,
		Options: IcnHeadingOptions,
	},
	subheadings: {
		el: subheadings,
		Options: SubheadingsOptions,
	},
	subheading: {
		el: subheading,
		Options: SubheadingOptions,
	},
	fullImg: {
		el: fullImg,
		Options: FullImgOptions,
	},
	smlSubheading: {
		el: smlSubheading,
	},
	brands: {
		el: brands,
		Options: BrandsOptions,
	},
	brand: {
		el: brand,
	},
	quote: {
		el: quote,
	},
	profile: {
		el: profile,
	},
	stars: {
		el: stars,
		Options: StarsOptions,
	},
	dots: {
		el: dots,
	},
	dot: {
		el: dot,
	},
	icnButton: {
		el: icnButton,
	},
	sliderItm: {
		el: sliderItm,
	},
	outlineBtn: {
		el: outlineBtn,
		Options: OutlineBtnOptions,
	},
}
