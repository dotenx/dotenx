import produce from 'immer'
import { ReactNode } from 'react'
import imageUrl from '../../assets/components/footer-simple-center.png'
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
import { Socials } from './basic-components/professional-socials'
import { Component, ElementOptions } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class FooterSimpleCentered extends Component {
	name = 'Simple footer with centered content'
	image = imageUrl
	defaultData = deserializeElement(defaultData)

	renderOptions(options: ElementOptions): ReactNode {
		return <FooterSimpleCenteredOptions options={options} />
	}
}

// =============  renderOptions =============

function FooterSimpleCenteredOptions({ options }: { options: ElementOptions }) {
	const component = useSelectedElement<BoxElement>()!
	const logo = component.find<ImageElement>(tagIds.logo)!
	const topLinks = component.find(tagIds.topLinks) as BoxElement
	const bottomLinks = component.find(tagIds.bottomLinks) as BoxElement
	const bottomText = component.find(tagIds.bottomText) as TextElement

	return (
		<ComponentWrapper name="Simple footer with centered content">
			<ImageStyler element={logo} />
			<DndTabs
				containerElement={topLinks}
				renderItemOptions={(item) => <TopLinksOptions item={item as LinkElement} />}
				insertElement={() => createLink('New link')}
			/>
			<TextStyler label="Bottom text" element={bottomText} />
			{Socials.getOptions({ set: options.set, root: bottomLinks, rootIsContainer: true })}
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

const createLink = (text: string) => {
	const l = link()
		.txt(text)
		.href('#')
		.css({
			borderBottomWidth: '2px',
			borderBottomStyle: 'solid',
			borderBottomColor: 'white',
			textDecoration: 'none',
		})
		.cssHover({
			borderBottomColor: '#0e0e0e',
			transition: 'border-bottom-color 0.2s',
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
const topFooter = box([
	logo,
	box(topLinks).tag(tagIds.topLinks).css({
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: '10px',
	}),
])
	.css({
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
	})
	.cssTablet({
		paddingBottom: '3rem',
	})
	.cssMobile({
		paddingBottom: '2rem',
	})

const bottomFooter = box([
	txt('© 2023 Company name. All rights reserved.')
		.tag(tagIds.bottomText)
		.css({
			fontSize: '14px',
		})
		.cssTablet({
			marginBottom: '10px',
		}),
	produce(Socials.getComponent(), (draft) => {
		draft.style.desktop!.default!.width = 'auto'
		draft.style.desktop!.default!.gap = '20px'
		draft.tagId = tagIds.bottomLinks
	}),
])
	.css({
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingTop: '5rem',
		flexWrap: 'wrap',
	})
	.cssTablet({
		paddingTop: '3rem',
	})
	.cssMobile({
		alignItems: 'center',
		paddingTop: '2rem',
	})

const wrapperDiv = frame([topFooter, bottomFooter]).css({
	flexDirection: 'column',
	alignItems: 'stretch',
})

const defaultData = wrapperDiv.serialize()
