import _ from 'lodash'
import imageUrl from '../../../assets/themes/ecommerce/header.png'
import { Component } from '../../components/component'
import { ComponentName } from '../../components/helpers'
import { DndTabs } from '../../components/helpers/dnd-tabs'
import { OptionsWrapper } from '../../components/helpers/options-wrapper'
import { Element } from '../../elements/element'
import { BoxElement } from '../../elements/extensions/box'
import { LinkElement } from '../../elements/extensions/link'
import { TextElement } from '../../elements/extensions/text'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { shared } from '../shared'

export class Header extends Component {
	name = 'Header'
	image = imageUrl
	defaultData = component()
	renderOptions = () => <HeaderOptions />
}

function HeaderOptions() {
	const root = useSelectedElement<BoxElement>()!
	const logo = root.find<TextElement>(tagIds.logo)!
	const links = root.findAll<TextElement>(tagIds.linkText)!
	const menu = root.find<BoxElement>(tagIds.menu)!

	return (
		<OptionsWrapper>
			<ComponentName name="Header" />
			<TextStyler label="Logo" element={logo} />
			<BoxStyler label="Wrapper" element={root} />
			<TextStyler label="Links" element={links} noText />
			<DndTabs
				containerElement={menu}
				insertElement={() => navLink('Link')}
				renderItemOptions={(element) => <NavLinkOptions element={element} />}
			/>
		</OptionsWrapper>
	)
}

function NavLinkOptions({ element }: { element: Element }) {
	const link = element.find<TextElement>(tagIds.linkText)!

	return (
		<OptionsWrapper>
			<TextStyler label="Link" element={link} />
		</OptionsWrapper>
	)
}

const tagIds = {
	logo: 'logo',
	linkText: 'linkText',
	menu: 'menu',
}

const component = () => {
	const navbar = menu()
	const logoText = new TextElement().as('h1').txt('Logo').tag(tagIds.logo).css({
		fontSize: '1.5rem',
		opacity: 0.8,
	})
	const logo = new LinkElement().populate([logoText]).href('/')
	_.set(logo.style, 'desktop.hover.opacity', 1)
	const menuWrapper = new BoxElement().populate([logo, navbar]).css({
		display: 'flex',
		alignItems: 'center',
		gap: '24px',
	})
	const container = shared.container().populate([menuWrapper])
	const root = shared.paper().populate([container]).css({
		paddingTop: '24px',
		paddingBottom: '24px',
	})
	return root
}

const menu = () => {
	const home = navLink('Home')
	const about = navLink('About')
	const contact = navLink('Contact')
	const menu = new BoxElement().tag('menu').populate([home, about, contact]).css({
		display: 'flex',
	})
	return menu
}

const navLink = (text: string) => {
	const link = new LinkElement().txt(text).href('/').css({
		opacity: 0.8,
	})
	link.children[0]
		.css({
			padding: '12px',
			fontSize: '14px',
		})
		.tag(tagIds.linkText)
	_.set(link.style, 'desktop.hover.opacity', 1)
	_.set(link.style, 'desktop.hover.textDecoration', 'underline')
	return link
}
