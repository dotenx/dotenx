import _ from 'lodash'
import imageUrl from '../../assets/components/navbar.png'
import { flex, icn, img, link, paper, txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { setElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import componentScript from '../scripts/navbar.js?raw'
import { useSelectedElement } from '../selection/use-selected-component'
import { color } from '../simple/palette'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'

export class Navbar extends Component {
	name = 'Navbar'
	image = imageUrl
	defaultData = component()
	renderOptions = () => <NavbarOptions />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

function NavbarOptions() {
	const root = useSelectedElement<BoxElement>()!
	const logoLink = root.find<LinkElement>(tags.logoLink)!
	const logoImage = root.find<ImageElement>(tags.logoImage)!
	const links = root.find<BoxElement>(tags.links)!

	return (
		<ComponentWrapper name="Navbar">
			<LinkStyler element={logoLink} label="Logo" />
			<ImageStyler element={logoImage} />
			<DndTabs
				containerElement={links}
				insertElement={lnk}
				renderItemOptions={(item) => <ItemOptions item={item as LinkElement} />}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: LinkElement }) {
	const text = item.find<TextElement>(tags.linkText)!

	return (
		<OptionsWrapper>
			<LinkStyler element={item} label="Link address" />
			<TextStyler element={text} label="Link text" />
		</OptionsWrapper>
	)
}

const tags = {
	logoLink: 'logoLink',
	logoImage: 'logoImage',
	links: 'links',
	linkText: 'linkText',
}

const lnk = (text = 'Link', href = '/') =>
	link()
		.populate([txt(text).tag(tags.linkText)])
		.href(href)
		.css({
			padding: '0 10px',
			color: color('text'),
			textDecoration: 'none',
		})

const component = () =>
	paper([
		flex([
			link()
				.populate([
					img('https://files.dotenx.com/assets/logo1-fwe14we.png').tag(tags.logoImage),
				])
				.href('/')
				.tag(tags.logoLink),
			flex([
				lnk('Link One').href('/link-one'),
				lnk('Link Two').href('/link-two'),
				lnk('Link Three').href('/link-three'),
				lnk('Link Four').href('/link-four'),
			])
				.tag(tags.links)
				.class('navbar-menu')
				.css({
					alignItems: 'center',
					gap: '1rem',
				})
				.cssTablet({
					display: 'none',
					position: 'absolute',
					top: '100%',
					left: '0',
					right: '0',
					backgroundColor: color('background'),
					flexDirection: 'column',
					alignItems: 'start',
					padding: '24px 10px',
					gap: '24px',
				}),
			icn('bars')
				.size('20px')
				.class('open-navbar-btn')
				.css({
					display: 'none',
				})
				.cssTablet({
					display: 'flex',
				}),
			icn('xmark').size('20px').class('close-navbar-btn').css({
				display: 'none',
			}),
		])
			.css({
				justifyContent: 'space-between',
				alignItems: 'center',
				paddingLeft: '32px',
				paddingRight: '32px',
			})
			.cssTablet({
				paddingLeft: '24px',
				paddingRight: '24px',
			}),
	]).css({
		borderBottom: '1px solid',
		borderColor: color('text'),
		position: 'relative',
	})
