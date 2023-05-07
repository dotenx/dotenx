import produce from 'immer'
import _ from 'lodash'
import { gridCols } from '../../../../utils/style-utils'
import {
	box,
	btn,
	column,
	container,
	flex,
	grid,
	icn,
	img,
	link,
	txt,
} from '../../../elements/constructor'
import { Element } from '../../../elements/element'
import { BoxElement } from '../../../elements/extensions/box'
import { ButtonElement } from '../../../elements/extensions/button'
import { IconElement } from '../../../elements/extensions/icon'
import { ImageElement } from '../../../elements/extensions/image'
import { LinkElement } from '../../../elements/extensions/link'
import { TextElement } from '../../../elements/extensions/text'
import { useSelectedElement } from '../../../selection/use-selected-component'
import { ButtonStyler } from '../../../simple/stylers/button-styler'
import { IconStyler } from '../../../simple/stylers/icon-styler'
import { ImageStyler } from '../../../simple/stylers/image-styler'
import { LinkStyler } from '../../../simple/stylers/link-styler'
import { TextStyler } from '../../../simple/stylers/text-styler'
import { Expression } from '../../../states/expression'
import { DividerCollapsible, repeatObject } from '../../helpers'
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
	plan: {
		title: 'title',
		featureText: 'featureText',
		featureIcon: 'featureIcon',
		container: 'container',
		monthlyPlanDesc: 'monthlyPlanDesc',
		monthlyPrice: 'monthlyPrice',
		monthlyPlanUnit: 'monthlyPlanUnit',
		yearlyPlanDesc: 'yearlyPlanDesc',
		yearlyPrice: 'yearlyPrice',
		yearlyPlanUnit: 'yearlyPlanUnit',
		desc: 'desc',
		btnTxt: 'btnTxt',
		btnLink: 'btnLink',
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
		link2Txt: 'link2Txt',
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
	txt('Pricing plan')
		.css({
			fontWeight: '700',
			fontSize: '2.5rem',
			lineHeight: '1.2',
			marginBottom: '1.5rem',
		})
		.cssTablet({
			fontSize: '2rem',
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
	txt(text ?? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
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
		btn('Monthly')
			.css({
				transitionProperty: 'all',
				transitionDuration: '150ms',
				cursor: 'pointer',
				background: 'black',
				color: 'white',
				border: '1px solid black',
				padding: '0.75rem 1.5rem',
			})
			.class(['monthly', 'active'])
			.tag(tag.twoBtns.link1Txt),
		btn('Yearly')
			.tag(tag.twoBtns.link2Txt)
			.css({
				transitionProperty: 'all',
				transitionDuration: '150ms',
				border: '1px solid black',
				cursor: 'pointer',
				padding: '0.75rem 1.5rem',
			})
			.class('yearly'),
	])

function TwoBtnsOptions() {
	const component = useSelectedElement<BoxElement>()!

	// TODO: use a better name
	const link1Text = component.find<ButtonElement>(tag.twoBtns.link1Txt)!
	const link2Text = component.find<ButtonElement>(tag.twoBtns.link2Txt)!

	return (
		<>
			<ButtonStyler label="Pricing mode 1 (& Active style)" element={link1Text} />
			<ButtonStyler label="Pricing mode 2 (& Inactive style)" element={link2Text} />
			
		</>
	)
}
// =============================================================== input Btns
const createFeatureLine = () =>
	produce(new BoxElement(), (draft) => {
		draft.style.desktop = {
			default: {
				display: 'flex',
				alignItems: 'center',
				marginTop: '10px',
				marginBottom: '10px',
				marginLeft: '0px',
				marginRight: '0px',
			},
		}
		const icon = produce(new IconElement(), (draft) => {
			draft.style.desktop = {
				default: {
					flex: '0 0 auto',
					width: '16px',
					height: '16px',
					fontSize: '16px',
					marginRight: '10px',
				},
			}
			draft.style.tablet = {
				default: {
					width: '12px',
					height: '12px',
					fontSize: '12px',
					marginRight: '8px',
				},
			}
			draft.style.mobile = {
				default: {
					width: '8px',
					height: '8px',
					fontSize: '8px',
					marginRight: '4px',
				},
			}
			draft.data.name = 'check'
			draft.data.type = 'fas'
		}).tag(tag.plan.featureIcon)

		const text = produce(new TextElement(), (draft) => {
			draft.style.desktop = {
				default: {
					marginLeft: '8px',
				},
			}
			draft.data.text = Expression.fromString('Feature text goes here')
		}).tag(tag.plan.featureText)

		draft.children = [icon, text]
	})
const plan = ({
	plan,
	price,
	yearlyPrice,
	planDesc,
	features,
}: {
	plan: string
	price: string
	yearlyPrice: string
	planDesc: string
	features: number
}) => {
	return column([
		box([
			txt(plan).css({ fontSize: '1.25rem', fontWeight: '600' }).tag(tag.plan.title),
			txt('Lorem ipsum dolor sit amet').css({ fontSize: '1rem' }).tag(tag.plan.desc),
		]),
		box([
			box([
				box([
					txt(`$${price}`).css({ fontSize: '3rem' }).tag(tag.plan.monthlyPrice),
					txt('/mo').css({ fontSize: '2rem' }).tag(tag.plan.monthlyPlanUnit),
				]).css({
					fontWeight: '600',
					display: 'flex',
					alignItems: 'center',
				}),
				txt(planDesc).css({ fontSize: '1rem' }).tag(tag.plan.monthlyPlanDesc),
			]).class('monthly_wrapper'),
			box([
				box([
					txt(`$${yearlyPrice}`).css({ fontSize: '3rem' }).tag(tag.plan.yearlyPrice),
					txt('/yr').css({ fontSize: '2rem' }).tag(tag.plan.yearlyPlanUnit),
				]).css({
					fontWeight: '600',
					display: 'flex',
					alignItems: 'center',
				}),
				txt('Save 20%').css({ fontSize: '1rem' }).tag(tag.plan.yearlyPlanDesc),
			])
				.class('yearly_wrapper')
				.css({
					display: 'none',
				}),
			link()
				.populate([txt('Get started').tag(tag.plan.btnTxt)])
				.css({
					display: 'inline-block',
					marginTop: '1rem',
					marginBottom: '1rem',
					textAlign: 'center',
					background: 'black',
					width: '100%',
					color: 'white',
					border: '1px solid black',
					padding: '0.75rem 1.5rem',
				})
				.tag(tag.plan.btnLink),
		]).css({
			paddingTop: '1rem',
			paddingBottom: '1rem',
			borderTop: '1px solid black',
			borderBottom: '1px solid black',
		}),

		box([...repeatObject(createFeatureLine(), features)]).tag(tag.plan.container),
	]).css({
		height: '100%',
		rowGap: '1rem',
		border: '1px solid black',
		padding: '2rem 1.5rem',
	})
}

function planOptions({ root, tileDiv }: { root?: BoxElement; tileDiv: BoxElement }) {
	const planTitle = tileDiv.find(tag.plan.title) as TextElement
	const planDesc = tileDiv.find(tag.plan.desc) as TextElement
	const monthlyPlanPrice = tileDiv.find(tag.plan.monthlyPrice) as TextElement
	const monthlyPlanUnit = tileDiv.find(tag.plan.monthlyPlanUnit) as TextElement
	const monthlyPlanPriceDesc = tileDiv.find(tag.plan.monthlyPlanDesc) as TextElement
	const yearlyPlanPrice = tileDiv.find(tag.plan.yearlyPrice) as TextElement
	const yearlyPlanUnit = tileDiv.find(tag.plan.yearlyPlanUnit) as TextElement
	const yearlyPlanPriceDesc = tileDiv.find(tag.plan.yearlyPlanDesc) as TextElement
	const btnLink = tileDiv.find(tag.plan.btnLink) as LinkElement
	const btnTxt = tileDiv.find(tag.plan.btnTxt) as TextElement
	const container = tileDiv.find(tag.plan.container) as BoxElement

	return (
		<div className="space-y-3">
			<TextStyler label="Title" element={planTitle} />
			<TextStyler label="Subtitle" element={planDesc} />
			<DividerCollapsible title="monthly" closed>
				<TextStyler label="" element={monthlyPlanPrice} />
				<TextStyler label="" element={monthlyPlanUnit} />
				<TextStyler label="" element={monthlyPlanPriceDesc} />
			</DividerCollapsible>
			<DividerCollapsible title="yearly" closed>
				<TextStyler label="" element={yearlyPlanPrice} />
				<TextStyler label="" element={yearlyPlanUnit} />
				<TextStyler label="" element={yearlyPlanPriceDesc} />
			</DividerCollapsible>
			<LinkStyler label="Button link" element={btnLink} />
			<TextStyler label="Button text" element={btnTxt} />
			<DndTabs
				containerElement={container}
				insertElement={() => createFeatureLine()}
				renderItemOptions={(item: any) => {
					const featureText = item.find(tag.plan.featureText) as TextElement
					const featureIcon = item.find(tag.plan.featureIcon) as IconElement
					return (
						<div className="space-y-3">
							<TextStyler label="Feature text" element={featureText} />
							<IconStyler label="Feature icon" element={featureIcon} />
						</div>
					)
				}}
			/>
		</div>
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
	plan: {
		el: plan,
		Options: planOptions,
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
	twoBtns: {
		el: twoBtns,
		Options: TwoBtnsOptions,
	},
	icnHeading: {
		el: icnHeading,
		Options: IcnHeadingOptions,
	},
	brands: {
		el: brands,
		Options: BrandsOptions,
	},
}
