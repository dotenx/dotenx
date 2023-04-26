import _ from 'lodash'
import { gridCols } from '../../../../utils/style-utils'
import { box, container, flex, grid, icn, link, txt } from '../../../elements/constructor'
import { Element } from '../../../elements/element'
import { BoxElement } from '../../../elements/extensions/box'
import { IconElement } from '../../../elements/extensions/icon'
import { LinkElement } from '../../../elements/extensions/link'
import { TextElement } from '../../../elements/extensions/text'
import { useSelectedElement } from '../../../selection/use-selected-component'
import { IconStyler } from '../../../simple/stylers/icon-styler'
import { LinkStyler } from '../../../simple/stylers/link-styler'
import { TextStyler } from '../../../simple/stylers/text-styler'
import { DndTabs } from '../../helpers/dnd-tabs'
import { OptionsWrapper } from '../../helpers/options-wrapper'

const duplicate = (elConstructor: () => Element, number: number) =>
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
		icn('square').size('32px').tag(tag.icnSubheading.icn),
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

// =============================================================== Full Background
const fullBg = (children: Element[]) =>
	box([container(children)])
		.css({
			paddingTop: '7rem',
			paddingBottom: '7rem',
			paddingRight: '5%',
			paddingLeft: '5%',
			color: '#fff',
			backgroundImage: 'url(https://files.dotenx.com/assets/hero-bg-wva.jpeg)',
		})
		.cssTablet({
			paddingTop: '4rem',
			paddingBottom: '4rem',
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

function TaglineOptions() {
	const component = useSelectedElement<BoxElement>()!
	const tagline = component.find<TextElement>(tag.tagline)!
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

function HeadingOptions() {
	const component = useSelectedElement<BoxElement>()!
	const heading = component.find<TextElement>(tag.heading)!
	return <TextStyler label="Heading" element={heading} />
}

// =============================================================== Description
const desc = () =>
	txt(
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

function DescOptions() {
	const component = useSelectedElement<BoxElement>()!
	const description = component.find<TextElement>(tag.desc)!
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
		icn('square').size('24px').tag(tag.icnLst.icn),
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
				border: '1px solid #fff',
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

function BtnLinksOptions() {
	const component = useSelectedElement<BoxElement>()!
	const link1 = component.find<LinkElement>(tag.btnLink.link1)!
	const link1Text = link1.find<TextElement>(tag.btnLink.link1Txt)!
	const link2 = component.find<LinkElement>(tag.btnLink.link2)!
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

// ---------------------------------------------------------------
export const cmn = {
	icnSubheading: {
		el: icnSubheadings,
		Options: IcnSubheadingsOptions,
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
}
