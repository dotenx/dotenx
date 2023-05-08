import { box, column, flex, icn, img, link, txt } from '../../../elements/constructor'
import { Element } from '../../../elements/element'

const container = (children: Element[]) =>
	box(children).css({
		paddingLeft: '5%',
		paddingRight: '5%',
		minHeight: '4.5rem',
		borderBottom: '1px solid #000',
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
						transition: 'all 150ms ease-out',
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
			transition: 'all 150ms ease-out, max-height 300ms ease-out',
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
}
