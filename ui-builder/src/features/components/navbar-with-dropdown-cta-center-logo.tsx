import _ from 'lodash'
import imageUrl from '../../assets/components/navbar.png'
import { ActionIcon, Menu, Select, TextInput } from '@mantine/core'
import { box, icn, img, link, paper, txt } from '../elements/constructor'
import { Element } from '../elements/element'
import { setElement, useSetElement } from '../elements/elements-store'
import { BoxElement } from '../elements/extensions/box'
import { ImageElement } from '../elements/extensions/image'
import { LinkElement } from '../elements/extensions/link'
import { TextElement } from '../elements/extensions/text'
import componentScript from '../scripts/navbar-with-dropdown-cta.js?raw'
import { useSelectedElement } from '../selection/use-selected-component'
import { color } from '../simple/palette'
import { ImageStyler } from '../simple/stylers/image-styler'
import { LinkStyler } from '../simple/stylers/link-styler'
import { TextStyler } from '../simple/stylers/text-styler'
import { Component } from './component'
import { ComponentWrapper } from './helpers/component-wrapper'
import { DndTabs } from './helpers/dnd-tabs'
import { OptionsWrapper } from './helpers/options-wrapper'
import { repeatObject } from './helpers'
import { TbPlus } from 'react-icons/tb'

export class NavbarWithDropDownCtaCenterLogo extends Component {
	name = 'Navbar with dropdown and CTA - logo centered'
	image = imageUrl
	defaultData = defaultData
	renderOptions = () => <NavbarWithDropDownCtaCenterLogoOptions />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

function NavbarWithDropDownCtaCenterLogoOptions() {
	const set = useSetElement()
	const root = useSelectedElement<BoxElement>()!
	const logoLink = root.find<LinkElement>(tags.logoLink)!
	const logoImage = root.find<ImageElement>(tags.logoImage)!
	const cta1 = root.find<LinkElement>(tags.cta1)!
	const cta1Text = root.find<TextElement>(tags.cta1Text)!
	const cta2 = root.find<LinkElement>(tags.cta2)!
	const cta2Text = root.find<TextElement>(tags.cta2Text)!
	const links = root.find<BoxElement>(tags.links)!

	return (
		<ComponentWrapper name="Navbar with dropdown and CTA - logo centered">
			<LinkStyler linkOnly element={logoLink} label="Logo's link" />
			<ImageStyler element={logoImage} />
			<TextStyler textOnly label="CTA-1" element={cta1Text} />
			<LinkStyler label="CTA-1 Link" element={cta1} />
			<TextStyler textOnly label="CTA-2" element={cta2Text} />
			<LinkStyler label="CTA-2 Link" element={cta2} />
			<DndTabs
				containerElement={links}
				insertElement={() => item('Link')}
				rightSection={
					<Menu position="left">
						<Menu.Target>
							<ActionIcon variant="transparent">
								<TbPlus
									size={16}
									className="text-red-500 rounded-full border-red-500 border"
								/>
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								onClick={() =>
									set(links, (draft) => draft.children.push(item('Link')))
								}
							>
								Link
							</Menu.Item>
							<Menu.Item
								onClick={() =>
									set(links, (draft) => draft.children.push(item('Link', true)))
								}
							>
								Link & Submenu
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				}
				renderItemOptions={(item) => <ItemOptions item={item as BoxElement} />}
			/>
		</ComponentWrapper>
	)
}

function ItemOptions({ item }: { item: BoxElement }) {
	const link = item.find<LinkElement>(tags.link)!
	const text = link.find<TextElement>(tags.linkText)!
	const submenu = item.find<BoxElement>(tags.submenu)

	return (
		<OptionsWrapper>
			<LinkStyler linkOnly element={link} label="Link address" />
			<TextStyler textOnly element={text} label="Link text" />
			{submenu && (
				<>
					<div className="w-full mt-4">Submenu</div>
					<DndTabs
						containerElement={submenu}
						insertElement={submenuLink}
						renderItemOptions={(item) => (
							<SubmenuItemOptions item={item as LinkElement} />
						)}
					/>
				</>
			)}
		</OptionsWrapper>
	)
}

function SubmenuItemOptions({ item }: { item: LinkElement }) {
	const text = item.find<TextElement>(tags.linkText)!

	return (
		<OptionsWrapper>
			<LinkStyler linkOnly element={item} label="Link address" />
			<TextStyler textOnly element={text} label="Link text" />
		</OptionsWrapper>
	)
}

const tags = {
	logoLink: 'logoLink',
	logoImage: 'logoImage',
	links: 'links',
	linkText: 'linkText',
	cta1: 'cta1',
	cta1Text: 'cta1Text',
	cta2: 'cta2',
	cta2Text: 'cta2Text',
	link: 'link',
	submenu: 'submenu',
}

const logo = box([
	link()
		.href('/index.html')
		.tag(tags.logoLink)
		.populate([img('https://files.dotenx.com/assets/logo1-fwe14we.png').tag(tags.logoImage)]),
])
	.as('li')
	.css({
		padding: '7.5px 0px',
		textDecoration: 'none',
		whiteSpace: 'nowrap',
		order: '1',
	})

const submenuLink = () =>
	link()
		.tag(tags.link)
		.href('#')
		.css({
			padding: '15px',
			textDecoration: 'none',
		})
		.populate([txt('Submenu').tag(tags.linkText)])

const item = (text: string, hasSubmenu = false) => {
	const children: Element[] = [
		link()
			.href('#')
			.tag(tags.link)
			.css({
				textDecoration: 'none',
				padding: '15px 5px',
				display: 'block',
			})
			.populate([
				txt(text).tag(tags.linkText).as('span').css({
					display: 'inline',
				}),
			]),
	]
	if (hasSubmenu) {
		const submenu = box(repeatObject(submenuLink(), 4))
			.as('ul')
			.tag(tags.submenu)
			.class('submenu')
			.css({
				height: '0',
				width: '0',
				visibility: 'hidden',
				overflow: 'hidden',
				transform: 'translateY(20px)',
				display: 'block', // If we set this to none the transition effect won't work. Stupid HTML!
				padding: '0px 10px',
				margin: '0px',
			})

		children.push(submenu)
	}

	const itemClasses = ['item']
	if (hasSubmenu) {
		itemClasses.push('has-submenu')
	}

	return box(children)
		.as('li')
		.class(itemClasses)
		.css({
			position: 'relative',
			display: 'block',
			padding: '10px',
		})
		.cssTablet({
			width: '100%',
			textAlign: 'center',
			display: 'none',
		})
}

const cta1 = link()
	.href('#')
	.css({
		backgroundColor: 'hsla(0, 0%, 0%, 1)',
		border: 'none',
		borderRadius: '10px',
		textAlign: 'center',
		textDecoration: 'none',
		cursor: 'pointer',
		whiteSpace: 'nowrap',
		display: 'block',
		order: '2',
		color: 'hsla(0, 0%, 100%, 1)',
		fontSize: '1rem',
		paddingTop: '8px',
		paddingBottom: '8px',
		paddingLeft: '24px',
		paddingRight: '24px',
	})
	.cssTablet({
		justifySelf: 'center',
		paddingLeft: '15px',
		paddingRight: '15px',
	})
	.cssMobile({
		borderRadius: '0px',
	})
	.populate([txt('Button1').tag(tags.cta1Text)])
	.tag(tags.cta1)

const cta2 = link()
	.href('#')
	.css({
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: 'hsla(0, 0%, 0%, 1)',
		borderRadius: '10px',
		textAlign: 'center',
		textDecoration: 'none',
		cursor: 'pointer',
		whiteSpace: 'nowrap',
		display: 'block',
		order: '2',
		color: 'hsla(0, 0%, 0%, 1)',
		fontSize: '1rem',
		paddingTop: '8px',
		paddingBottom: '8px',
		paddingLeft: '24px',
		paddingRight: '24px',
	})
	.cssTablet({
		justifySelf: 'center',
		paddingLeft: '15px',
		paddingRight: '15px',
	})
	.cssMobile({
		borderRadius: '0px',
	})
	.populate([txt('Button2').css({}).tag(tags.cta2Text)])
	.tag(tags.cta2)

const toggle = box([
	link()
		.href('#')
		.class('toggle')
		.populate([icn('bars').size('20px')])
		.css({
			textDecoration: 'none',
		}),
])
	.css({
		display: 'none',
		order: '0',
	})
	.cssTablet({
		display: 'block',
		textAlign: 'right',
	})
const navbarItems = box([
	item('Link One'),
	item('Link Two'),
	item('Link Three'),
	item('Link Four', true),
])
	.class('navbar_items')
	.css({
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
		order: '0',
	})
	.cssTablet({
		width: '100%',
		order: '4',
		display: 'block',
		visibility: 'hidden',
		transform: 'translateX(-200px)',
	})
	.tag(tags.links)

const buttons = box([cta1, cta2])
	.css({
		display: 'flex',
		order: '2',
		justifyContent: 'flex-end',
		columnGap: '10px',
		alignItems: 'center',
	})
	.cssMobile({
		order: '2',
		display: 'none',
		alignItems: 'stretch',
		rowGap: '10px',
	})
	.class('buttons')

const defaultData = paper([
	box([toggle, logo, navbarItems, buttons])
		.as('ul')
		.class('menu')
		.css({
			padding: '0px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			flexWrap: 'nowrap',
			listStyleType: 'none',
		})
		.cssTablet({
			flexWrap: 'wrap',
			alignItems: 'center',
			justifyContent: 'space-between',
		})
])
	.as('nav')
	.css({
		paddingTop: '10px',
		paddingBottom: '10px',
		paddingLeft: '5%',
		paddingRight: '5%',
		width: '100%',
		fontSize: '1rem',
		color: color('text'),
	})
	.cssTablet({
		fontSize: '1.125rem',
	})
	.customCss('.submenu-active .submenu', {
		height: 'auto',
		width: 'auto',
		visibility: 'visible',
		transform: 'translateY(0px)',
		transition: 'transform 0.2s cubic-bezier(0.35, -0.9, 0.13, 1.59)',
		display: 'block',
		position: 'absolute',
		left: '0',
		top: '68px',
	})
	.customCss('.has-submenu > a::after', {
		fontFamily: "'Font Awesome 5 Free'",
		fontSize: '12px',
		lineHeight: '16px',
		fontWeight: '900',
		content: "'\\f078'",
		display: 'inline-block',
		color: 'black',
		paddingLeft: '2px',
		paddingRight: '2px',
	})
	.customCss('.has-submenu.submenu-active > a::after', {
		transform: 'rotate(-180deg) !important',
		transition: 'transform 0.2s ease-in-out',
	})
	.customCssTablet('.submenu-active .submenu', {
		position: 'static',
	})
	.customCssTablet('.active .item', {
		display: 'block',
	})
	.customCssTablet('.active .navbar_items', {
		visibility: 'visible',
		width: '100%',
		transform: 'translateX(0px)',
		transition: 'transform 0.2s cubic-bezier(0.35, -0.9, 0.13, 1.59)',
	})
	.customCssMobile('.active .buttons', {
		width: '100%',
		textAlign: 'center',
		display: 'flex',
		flexDirection: 'column',
		rowGap: '10px',
		paddingTop: '20px',
	})
