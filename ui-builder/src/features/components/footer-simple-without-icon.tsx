import { ReactNode } from 'react'
import imageUrl from '../../assets/components/footer-simple-without-icon.png'
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
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class FooterSimpleWithoutIcon extends Component {
	name = 'Simple footer without icons'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FooterSimpleWithoutIconOptions options={options} />
	}
}

// =============  renderOptions =============

function FooterSimpleWithoutIconOptions({ options }: { options: ElementOptions }) {
	const component = useSelectedElement<BoxElement>()!
	const logo = component.find<ImageElement>(tagIds.logo)!
	const topLinks = component.find(tagIds.topLinks) as BoxElement
	const bottomLinks = component.find(tagIds.bottomLinks) as BoxElement
	const bottomText = component.find(tagIds.bottomText) as TextElement

	return (
		<ComponentWrapper name="Simple footer without icons">
			<ImageStyler element={logo} />
			<DndTabs
				containerElement={topLinks}
				renderItemOptions={(item) => <TopLinksOptions item={item as LinkElement} />}
				insertElement={() => createLink('New link')}
			/>
			<TextStyler label="Bottom text" element={bottomText} />
			<DndTabs
				containerElement={bottomLinks}
				renderItemOptions={(item) => <TopLinksOptions item={item as LinkElement} />}
				insertElement={() => createLink('New link', true)}
			/>
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
	topLinks: 'topLinks',
	bottomLinks: 'bottomLinks',
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
			...underline ? {
				textDecoration: 'underline',
			}: {
				textDecoration: 'none',
			},
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
	createLink('About us'),
	createLink('Contact us'),
	createLink('Terms of use'),
	createLink('Privacy policy'),
	createLink('FAQ'),
]

const bottomLinks = [
	createLink('Terms and conditions', true),
	createLink('Privacy Policy', true),
	createLink('Cookie policy', true),
	createLink('Sitemap', true),
]
const topFooter = box([
	logo,
	box(topLinks).tag(tagIds.topLinks).css({
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: '10px',
	}).cssMobile({
		flexDirection: 'column',
		alignItems: 'center',
	}),
]).css({
	display: 'flex',
	flexWrap: 'wrap',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'space-between',
	borderBottomWidth: '1px',
	borderBottomStyle: 'solid',
	borderBottomColor: '#eaeaea',
	rowGap: '2rem',
	paddingBottom: '5rem',
}).cssTablet({
	paddingBottom: '3rem',
})
.cssMobile({
	paddingBottom: '2rem',
})

const bottomFooter = box([
	txt('© 2022 Company name. All rights reserved.').tag(tagIds.bottomText).css({
		fontSize: '14px',
	}).cssTablet({
		marginBottom: '10px',
	}),
	box(bottomLinks).tag(tagIds.bottomLinks).css({
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: '10px',
	}).cssMobile({
		flexDirection: 'column',
		alignItems: 'center',
	})
]).css({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	paddingTop: '5rem',
	flexWrap: 'wrap',
}).cssTablet({
	paddingTop: '3rem',
}).cssMobile({
	flexDirection: 'column',
	alignItems: 'center',
	paddingTop: '2rem',
})

const wrapperDiv = frame([topFooter, bottomFooter]).css({
	flexDirection: 'column',
	alignItems: 'stretch',
})

const defaultData = wrapperDiv.serialize()
