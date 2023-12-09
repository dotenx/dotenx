import { produce } from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/footer-simple-links-on-right-2.png'
import { deserializeElement } from '../../utils/deserialize'
import { box, frame, img, link, txt } from '../elements/constructor'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import { useSelectedElement } from '../selection/use-selected-component'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component, ElementOptions } from './component'
import { DividerCollapsible } from './helpers'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'
import ProfessionalSocials from './basic-components/professional-socials'

export class FooterSimpleWithLinksOnRight2 extends Component {
	name = 'Simple footer with links on right - 2 '
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FooterSimpleWithLinksOnRight2Options options={options} />
	}
}

// =============  renderOptions =============

function FooterSimpleWithLinksOnRight2Options({ options }: { options: ElementOptions }) {
	const component = useSelectedElement<BoxElement>()!
	const logo = component.find<ImageElement>(tagIds.logo)!
	const topLinks = component.find(tagIds.topLinks) as BoxElement
	const topLeftLinks = component.find(tagIds.topLeftLinks) as BoxElement
	const bottomLinks = component.find(tagIds.bottomLinks) as BoxElement
	const bottomText = component.find(tagIds.bottomText) as TextElement
	const addressLabel = component.find(tagIds.addressLabel) as TextElement
	const addressText = component.find(tagIds.addressText) as TextElement
	const contactLabel = component.find(tagIds.contactLabel) as TextElement
	const socials = component.find(tagIds.socials) as BoxElement

	return (
		<ComponentWrapper name="Simple footer with links on right - 2">
			<ImageStyler element={logo} />
			<TextStyler label="Address label" element={addressLabel} />
			<TextStyler label="Address text" element={addressText} />
			<TextStyler label="Contact text" element={contactLabel} />
			<DividerCollapsible title="Contact links">
				<DndTabs
					containerElement={topLeftLinks}
					renderItemOptions={(item) => <TopLinksOptions item={item as LinkElement} />}
					insertElement={() => createLink('New Contact', true)}
				/>
			</DividerCollapsible>

			<DividerCollapsible title="top right links">
				<DndTabs
					containerElement={topLinks}
					renderItemOptions={(item) => <TopLinksOptions item={item as LinkElement} />}
					insertElement={() => createLink('New link')}
				/>
			</DividerCollapsible>
			{ProfessionalSocials.getOptions({
				set: options.set,
				root: socials,
				rootIsContainer: true,
			})}

			<DividerCollapsible closed title="Bottom links">
				<TextStyler label="Bottom text" element={bottomText} />

				<DndTabs
					containerElement={bottomLinks}
					renderItemOptions={(item) => <TopLinksOptions item={item as LinkElement} />}
					insertElement={() => createLink('New link', true)}
				/>
			</DividerCollapsible>
		</ComponentWrapper>
	)
}

function TopLinksOptions({ item }: { item: LinkElement }) {
	const link = item
	const text = item.children?.[0] as TextElement

	return (
		<OptionsWrapper>
			<LinkStyler label="Link" element={link} />
			<TextStyler label="Text" element={text} />
		</OptionsWrapper>
	)
}

// =============  defaultData =============

const tagIds = {
	logo: 'logo',
	addressLabel: 'addressLabel',
	addressText: 'addressText',
	contactLabel: 'contactLabel',
	button: 'button',
	inputDesc: 'inputDesc',
	inputLabel: 'inputLabel',
	submit: 'submit',
	topLinks: 'topLinks',
	topLeftLinks: 'topLeftLinks',
	bottomLinks: 'bottomLinks',
	socials: 'socials',
	bottomText: 'bottomText',
}

const logo = img('https://files.dotenx.com/assets/logo1-fwe14we.png')
	.tag(tagIds.logo)
	.alt('Logo')
	.css({
		maxWidth: '100px',
	})

const createLink = (text: string, underline?: boolean) => {
	const l = link()
		.txt(text)
		.href('#')
		.css({
			borderBottomWidth: '2px',
			borderBottomStyle: 'solid',
			borderBottomColor: 'white',
			...(underline
				? {
						textDecoration: 'underline',
				  }
				: {
						textDecoration: 'none',
						fontWeight: '600',
				  }),
		})
		.cssHover({
			borderBottomColor: '#0e0e0e',
			transition: 'border-bottom-color 0.2s',
			textDecoration: 'none',
		})
	l.children[0].css({
		fontSize: '1rem',
		color: '#000000',
	})
	return l
}

const topLinks = [
	createLink('Link one'),
	createLink('Link two'),
	createLink('Link three'),
	createLink('Link four'),
	createLink('Link five').cssMobile({ marginTop: '2rem' }),
	createLink('Link six'),
	createLink('Link seven'),
	createLink('Link eight'),
]
const topLeftLinks = [createLink('1600 201 7234', true), createLink('info@contact.com', true)]

const bottomLinks = [
	createLink('Terms and conditions', true),
	createLink('Privacy Policy', true),
	createLink('Cookie policy', true),
	createLink('Sitemap', true),
]
const topFooterLeft = box([
	logo,
	txt('Address:')
		.tag(tagIds.addressLabel)
		.css({
			fontSize: '16px',
			fontWeight: '600',
			gridColumn: 'span 3 / span 3',
			textAlign: 'left',
			marginTop: '2rem',
		})
		.cssTablet({}),
	txt('Level 1, 12 Sample St, Sydney NSW 2000')
		.tag(tagIds.addressText)
		.css({
			fontSize: '16px',
		})
		.cssTablet({}),
	txt('Contact:')
		.tag(tagIds.contactLabel)
		.css({
			fontSize: '16px',
			fontWeight: '600',
			gridColumn: 'span 3 / span 3',
			textAlign: 'left',
			marginTop: '2rem',
		})
		.cssTablet({}),
	box(topLeftLinks)
		.tag(tagIds.topLeftLinks)
		.css({
			display: 'flex',
			flexWrap: 'wrap',
			justifyContent: 'space-between',
			flexDirection: 'column',
			alignItems: 'start',
		})
		.cssMobile({}),
	produce(ProfessionalSocials.getComponent(), (draft) => {
		draft.style.desktop!.default!.width = 'auto'
		draft.style.desktop!.default!.marginTop = '2rem'
		draft.style.desktop!.default!.gap = '20px'
		draft.tagId = tagIds.socials
	}),
])
	.css({
		display: 'flex',
		flexWrap: 'wrap',
		flexDirection: 'column',
		alignItems: 'start',
		justifyContent: 'start',
	})
	.cssTablet({})
	.cssMobile({})
const topFooterRight = box([
	box(topLinks)
		.tag(tagIds.topLinks)
		.css({
			display: 'grid',
			gap: '1rem',
			columnGap: '3rem',
			flexWrap: 'wrap',
			gridTemplateColumns: ' 1fr 1fr',
		})
		.cssTablet({ marginTop: '3rem' })
		.cssMobile({
			gridTemplateColumns: ' 1fr ',
		}),
])
	.css({
		display: 'flex',
		flexWrap: 'wrap',
		flexDirection: 'column',
		alignItems: 'end',
		justifyContent: 'center',
		rowGap: '1rem',
	})
	.cssTablet({ alignItems: 'start', rowGap: '5px' })
	.cssMobile({})

const topFooter = box([topFooterLeft, topFooterRight])
	.css({
		display: 'grid',
		padding: '3rem',
		gridTemplateColumns: ' 1fr 1fr',
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: 'black',
	})
	.cssTablet({
		gridTemplateColumns: ' 1fr',

		minWidth: '300px',
	})
	.cssMobile({
		minWidth: '200px',
	})

const bottomFooter = box([
	txt('© 2023 Company name. All rights reserved.')
		.tag(tagIds.bottomText)
		.css({
			fontSize: '14px',
		})
		.cssTablet({
			marginBottom: '10px',
		})
		.cssMobile({ order: 2, marginTop: '1rem' }),

	box(bottomLinks)
		.tag(tagIds.bottomLinks)
		.css({
			display: 'flex',
			flexWrap: 'wrap',
			justifyContent: 'space-between',
			gap: '10px',
		})
		.cssMobile({
			flexDirection: 'column',
			alignItems: 'start',
		}),
])
	.css({
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingTop: '3rem',
		flexWrap: 'wrap',
	})
	.cssTablet({
		paddingTop: '3rem',
	})
	.cssMobile({
		flexDirection: 'column',
		alignItems: 'start',
		paddingTop: '2rem',
	})

const wrapperDiv = frame([topFooter, bottomFooter]).css({
	flexDirection: 'column',
	alignItems: 'stretch',
	paddingTop: '4rem',
	paddingBottom: '3rem',
})

const defaultData = wrapperDiv.serialize()
