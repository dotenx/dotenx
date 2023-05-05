import { Switch } from '@mantine/core'
import produce from 'immer'
import _ from 'lodash'
import { gridCols } from '../../../../utils/style-utils'
import {
	box,
	btn,
	container,
	flex,
	form,
	grid,
	icn,
	img,
	input,
	link,
	submit,
	txt,
	video,
} from '../../../elements/constructor'
import { Element } from '../../../elements/element'
import { useSetElement } from '../../../elements/elements-store'
import { BoxElement } from '../../../elements/extensions/box'
import { ButtonElement } from '../../../elements/extensions/button'
import { IconElement } from '../../../elements/extensions/icon'
import { ImageElement } from '../../../elements/extensions/image'
import { LinkElement } from '../../../elements/extensions/link'
import { TextElement } from '../../../elements/extensions/text'
import { VideoElement } from '../../../elements/extensions/video'
import { useSelectedElement } from '../../../selection/use-selected-component'
import { ButtonStyler } from '../../../simple/stylers/button-styler'
import { IconStyler } from '../../../simple/stylers/icon-styler'
import { ImageStyler } from '../../../simple/stylers/image-styler'
import { LinkStyler } from '../../../simple/stylers/link-styler'
import { TextStyler } from '../../../simple/stylers/text-styler'
import { VideoStyler } from '../../../simple/stylers/video-styler'
import { Expression } from '../../../states/expression'
import { DividerCollapsible } from '../../helpers'
import { DndTabs } from '../../helpers/dnd-tabs'
import { OptionsWrapper } from '../../helpers/options-wrapper'

export const duplicate = (elConstructor: () => Element, number: number) =>
	_.range(number).map(elConstructor)

const tag = {
	icnSubheading: {
		lst: 'lst',
		icn: 'icn',
		title: 'title',
		desc: 'desc',
	},
	input: {
		submit: 'submit',
		button: 'button',
		inputDesc: 'inputDesc',
		form: 'form',
	},
	tagline: 'tagline',
	backgroundImage: 'backgroundImage',
	video: 'video',
	heroImage: 'heroImage',
	heading: 'heading',
	desc: 'desc',
	btnLink: {
		link1Txt: 'link1Txt',
		link1: 'link1',
		link2Txt: 'link2Txt',
		link2: 'link2',
	},
	twoBtns: {
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

// =============================================================== Background Image
const backgroundImage = () =>
	img('https://files.dotenx.com/bg-light-138489_7f92bfb9-ae49-4809-9265-27f2497e3a8b.jpg')
		.css({
			position: 'absolute',
			left: '0',
			top: '0',
			right: '0',
			bottom: '0',
			width: '100%',
			maxHeight: '100vh',
			objectFit: 'cover',
			zIndex: '-2',
		})
		.tag(tag.backgroundImage)

function backgroundImageOptions({ root }: { root?: BoxElement }) {
	const component = useSelectedElement<BoxElement>()!
	const parent = root ?? component
	const backgroundImage = parent.find<ImageElement>(tag.backgroundImage)!
	return <ImageStyler element={backgroundImage} />
}

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
const heading = () =>
	txt('Medium length section heading goes here')
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

// =============================================================== two Btns
const twoBtns = () =>
	flex([
		link()
			.populate([txt('Button').tag(tag.twoBtns.link1Txt)])
			.css({
				background: 'black',
				color: 'white',
				border: '1px solid black',
				padding: '0.75rem 1.5rem',
			})
			.tag(tag.twoBtns.link1),
		link()
			.populate([txt('Button').tag(tag.twoBtns.link2Txt)])
			.css({
				border: '1px solid currentcolor',
				padding: '0.75rem 1.5rem',
			})
			.tag(tag.twoBtns.link2),
	]).css({
		gap: '1rem',
	})

function twoBtnsOptions({ root }: { root?: BoxElement }) {
	const component = useSelectedElement<BoxElement>()!
	const parent = root ?? component
	const link1 = parent.find<LinkElement>(tag.twoBtns.link1)!
	const link1Text = link1.find<TextElement>(tag.twoBtns.link1Txt)!
	const link2 = parent.find<LinkElement>(tag.twoBtns.link2)!
	const link2Text = link2.find<TextElement>(tag.twoBtns.link2Txt)!

	return (
		<>
			<TextStyler label="Button 1 " element={link1Text} />
			<LinkStyler label="Button 1 link" element={link1} />
			<TextStyler label="Button 2 " element={link2Text} />
			<LinkStyler label="Button 2 link" element={link2} />
		</>
	)
}
// =============================================================== input Btns
const inputWithbtn = () =>
	form([
		input().type('text').placeholder('Enter your email address').setName('email').css({
			borderWidth: '1px',
			borderColor: '#000',
			borderStyle: 'solid',
			padding: '10px',
			width: '100%',
			fontSize: '16px',
			fontWeight: '500',
			color: '#6B7280',
			outline: 'none',
			gridColumn: 'span 2 / span 3',
		}),
		submit('Sign Up')
			.tag(tag.input.submit)
			.css({
				background: 'black',
				textAlign: 'center',
				color: 'white',
				border: '1px solid black',
				padding: '0.75rem 1.5rem',
			})
			.class('submit')
			.tag(tag.input.button),
		txt('By subscribing you agree to with our Privacy Policy')
			.tag(tag.input.inputDesc)
			.css({
				gridColumn: 'span 3 / span 3',
				marginTop: '0.5rem',
				fontSize: '14px',
			})
			.cssTablet({
				marginBottom: '10px',
			}),
	])
		.tag(tag.input.form)
		.css({
			maxWidth: '30rem',
			width: '100%',
			display: 'grid',
			gridTemplateColumns: '1fr 1fr 1fr ',
			gap: '10px',
		})
		.cssTablet({
			width: '100%',
		})
		.cssMobile({})

function inputWithbtnOptions({ root }: { root?: BoxElement }) {
	const component = useSelectedElement<BoxElement>()!
	const parent = root ?? component
	const inputDesc = parent.find(tag.input.inputDesc) as TextElement
	const button = parent.find(tag.input.button) as ButtonElement

	return (
		<>
			<TextStyler label="Bottom description" element={inputDesc} />
			<ButtonStyler label="Submit button" element={button} />
		</>
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

// =============================================================== Hero Image
const heroImage = () =>
	img('https://files.dotenx.com/assets/hero-bg-wva.jpeg')
		.tag(tag.heroImage)
		.css({
			maxHeight: '500px',
			width: '100%',
		})
		.class('image')

function heroImageOptions({ root }: { root?: BoxElement }) {
	const component = useSelectedElement<BoxElement>()!
	const parent = root ?? component
	const image = parent.find<ImageElement>(tag.heroImage)!
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
	box([img('https://files.dotenx.com/assets/Logo10-nmi1.png').tag(tag.brands.img)])

function BrandsOptions() {
	const component = useSelectedElement<BoxElement>()!
	const brandList = component.find<BoxElement>(tag.brands.lst)!
	return (
		<DndTabs
			containerElement={brandList}
			insertElement={brand}
			renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
		/>
	)
}

// =============================================================== Video
const videoComponent = () =>
	video('https://files.dotenx.com/assets/team-wer19v.mp4')
		.autoplay(false)
		.controls(true)
		.css({
			width: '100%',
		})
		.tag(tag.video)

function videoOptions() {
	const component = useSelectedElement<BoxElement>()!
	const element = component.find<VideoElement>(tag.video)!

	const set = useSetElement()
	return (
		<DividerCollapsible title="video">
			<VideoStyler element={element} />
			<Switch
				size="xs"
				label="Controls"
				checked={element.data.controls}
				onChange={(event) =>
					set(element, (draft) => (draft.data.controls = event.target.checked))
				}
			/>
			<Switch
				size="xs"
				label="Auto play"
				checked={element.data.autoplay}
				onChange={(event) =>
					set(element, (draft) => (draft.data.autoplay = event.target.checked))
				}
			/>
			<Switch
				size="xs"
				label="Loop"
				checked={element.data.loop}
				onChange={(event) =>
					set(element, (draft) => (draft.data.loop = event.target.checked))
				}
			/>
			<Switch
				size="xs"
				label="Muted"
				checked={element.data.muted}
				onChange={(event) =>
					set(element, (draft) => (draft.data.muted = event.target.checked))
				}
			/>
		</DividerCollapsible>
	)
}
//===========================================================================================
function ItemOptions({ item }: { item: BoxElement }) {
	const image = item.find<ImageElement>(tag.brands.img)!
	return <ImageStyler element={image} />
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
	inputWithbtn: {
		el: inputWithbtn,
		Options: inputWithbtnOptions,
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
	twoBtns: {
		el: twoBtns,
		Options: twoBtnsOptions,
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
	heroImage: {
		el: heroImage,
		Options: heroImageOptions,
	},
	brands: {
		el: brands,
		Options: BrandsOptions,
	},
	video: {
		el: videoComponent,
		Options: videoOptions,
	},
	backgroundImage: {
		el: backgroundImage,
		Options: backgroundImageOptions,
	},
}
