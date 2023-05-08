import { box, column, flex, icn, img, link, txt } from '../../../elements/constructor'
import { Element } from '../../../elements/element'

const container = (children: Element[]) =>
	box([
		box(children).css({
			paddingLeft: '5%',
			paddingRight: '5%',
			minHeight: '4.5rem',
			borderBottom: '1px solid #000',
			display: 'flex',
			alignItems: 'center',
			position: 'relative',
		}),
	])
		.customCssTablet('> div:hover .menu', {
			visibility: 'visible',
			maxHeight: '100vh',
		})
		.customCssTablet('> div:hover .menu-btn-bars', {
			display: 'none',
		})
		.customCssTablet('> div:hover .menu-btn-times', {
			display: 'block',
		})

const logo = () =>
	link()
		.populate([img('https://files.dotenx.com/assets/Logo10-nmi1.png')])
		.href('/')
		.css({
			display: 'flex',
			alignItems: 'center',
		})

const buttons = () =>
	flex([outlineBtn(), fillBtn()])
		.css({
			gap: '1rem',
		})
		.cssTablet({
			flexDirection: 'column',
		})
		.cssTablet({
			margin: '0 1rem',
		})

const outlineBtn = () =>
	link()
		.populate([txt('Button')])
		.css({
			border: '1px solid #000',
			padding: '0.5rem 1.25rem',
			display: 'inline-flex',
			justifyContent: 'center',
		})

const fillBtn = () =>
	link()
		.populate([
			txt('Button').css({
				color: 'white',
			}),
		])
		.css({
			border: '1px solid #000',
			padding: '0.5rem 1.25rem',
			display: 'inline-flex',
			backgroundColor: '#000',
			justifyContent: 'center',
		})

const linkList = () =>
	flex([
		linkItem('Link One'),
		linkItem('Link Two'),
		linkItem('Link Three'),
		linkMenu('Link Four', [
			linkSubmenu(['Link Five', 'Link Six', 'Link Seven'].map(submenuLink)),
		]),
	]).cssTablet({
		flexDirection: 'column',
	})

const linkItem = (text: string) =>
	link()
		.populate([txt(text)])
		.href('/')
		.css({
			padding: '1.5rem 1rem',
			color: '#222',
		})
		.cssTablet({
			padding: '0.5rem 1rem',
		})

const linkMenu = (text: string, children: Element[], transitionTop = true) =>
	box([
		link()
			.populate([
				flex([
					txt(text),
					icn('chevron-down').size('14px').class('chevron-down').css({
						rotate: '0deg',
						transition: 'all 150ms ease-in-out',
					}),
				])
					.css({
						alignItems: 'center',
						padding: '1.5rem 1rem',
						gap: '0.5rem',
						justifyContent: 'space-between',
					})
					.cssTablet({
						padding: '0.5rem 1rem',
					}),
				...children,
			])
			.class('submenu-link'),
	])
		.css({
			position: 'relative',
		})
		.customCss('> .submenu-link:hover .chevron-down', {
			rotate: '180deg',
		})
		.customCss('> .submenu-link:hover .submenu', {
			visibility: 'visible',
			opacity: '1',
			top: transitionTop ? 'calc(100% - 1rem)' : undefined,
		})
		.customCssTablet('> .submenu-link:hover .submenu', {
			maxHeight: '100vh',
		})

const linkSubmenu = (children: Element[]) =>
	box(children)
		.css({
			visibility: 'hidden',
			position: 'absolute',
			border: '1px solid #000',
			padding: '0.5rem',
			zIndex: '1',
			top: 'calc(100% + 1rem)',
			backgroundColor: 'white',
			width: 'max-content',
			opacity: '0',
			transition: 'all 150ms ease-in-out, max-height 300ms ease-in-out',
		})
		.cssTablet({
			position: 'static',
			border: 'none',
			padding: '0.5rem 1rem',
			maxHeight: '0vh',
		})
		.class('submenu')

const submenuLink = (text: string) =>
	link()
		.populate([
			txt(text).css({
				padding: '0.5rem 1rem',
			}),
		])
		.href('/')

const menuItem = (text: string) =>
	link()
		.populate([
			flex([
				icn('cube').size('20px'),
				box([
					txt(text).css({
						fontWeight: '600',
					}),
					txt('Lorem ipsum dolor sit amet consectetur adipisicing elit').css({
						fontSize: '0.875rem',
					}),
				]),
			]).css({
				gap: '0.75rem',
			}),
		])
		.href('/')
		.css({
			padding: '0.5rem',
		})

const pageGroup = (title: string, items: string[]) =>
	column([
		txt(title).css({
			fontWeight: '600',
			fontSize: '0.875rem',
		}),
		...items.map(menuItem),
	]).css({
		gap: '1rem',
	})

const menu = (children: Element[]) =>
	flex(children)
		.css({
			gap: '1.5rem',
			alignItems: 'center',
		})
		.cssTablet({
			visibility: 'hidden',
			position: 'absolute',
			left: '0',
			right: '0',
			top: '100%',
			height: 'calc(100vh - 5rem)',
			maxHeight: '0',
			backgroundColor: 'white',
			flexDirection: 'column',
			alignItems: 'stretch',
			zIndex: '1',
			transition: 'all 0.3s ease-in-out',
			borderBottom: '1px solid #000',
			overflow: 'hidden',
		})
		.class('menu')

const menuBtn = () =>
	box([
		icn('bars').size('20px').class('menu-btn-bars'),
		icn('times').size('20px').class('menu-btn-times').css({
			display: 'none',
		}),
	])
		.css({
			display: 'none',
			padding: '0.5rem',
		})
		.cssTablet({
			display: 'block',
		})

export const cmn = {
	container: {
		el: container,
	},
	logo: {
		el: logo,
	},
	buttons: {
		el: buttons,
	},
	outlineBtn: {
		el: outlineBtn,
	},
	fillBtn: {
		el: fillBtn,
	},
	linkList: {
		el: linkList,
	},
	linkItem: {
		el: linkItem,
	},
	linkMenu: {
		el: linkMenu,
	},
	linkSubmenu: {
		el: linkSubmenu,
	},
	submenuLink: {
		el: submenuLink,
	},
	menuItem: {
		el: menuItem,
	},
	pageGroup: {
		el: pageGroup,
	},
	menu: {
		el: menu,
	},
	menuBtn: {
		el: menuBtn,
	},
}
