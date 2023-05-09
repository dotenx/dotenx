import componentImage from '../../../assets/components/faq/faq-1.png'
import { box, column, flex, icn, link, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar4 extends Component {
	name = 'Navbar 4'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return <ComponentWrapper></ComponentWrapper>
}

const component = () =>
	cmn.container
		.el([
			box([
				cmn.logo.el(),
				menu(),
				flex([cmn.fillBtn.el(), menuBtn()]).css({
					gap: '1.5rem',
					display: 'flex',
				}),
			]).css({
				alignItems: 'center',
				width: '100%',
				display: 'flex',
				justifyContent: 'space-between',
			}),
		])
		.customCss('> div:hover .menu', {
			visibility: 'visible',
			maxHeight: '100vh',
		})
		.customCss('> div:hover .menu-btn-bars', {
			display: 'none',
		})
		.customCss('> div:hover .menu-btn-times', {
			display: 'block',
		})

const menuBtn = () =>
	box([
		icn('bars').size('20px').class('menu-btn-bars'),
		icn('times').size('20px').class('menu-btn-times').css({
			display: 'none',
		}),
	]).css({
		padding: '0.5rem',
	})

const menu = () =>
	flex([linkList()])
		.css({
			visibility: 'hidden',
			gap: '1.5rem',
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
			overflowY: 'auto',
			justifySelf: 'center',
		})
		.class('menu')

const linkList = () =>
	column([
		cmn.linkItem.el('Link One').css({
			padding: '0.5rem 1rem',
		}),
		cmn.linkItem.el('Link Two').css({
			padding: '0.5rem 1rem',
		}),
		cmn.linkItem.el('Link Three').css({
			padding: '0.5rem 1rem',
		}),
		linkMenu('Link Four', [
			linkSubmenu(['Link Five', 'Link Six', 'Link Seven'].map(cmn.submenuLink.el)),
		]).css({
			padding: '0.5rem 1rem',
		}),
	])

const linkMenu = (text: string, children: Element[]) =>
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
			display: 'block',
			opacity: '1',
		})

const linkSubmenu = (children: Element[]) =>
	box(children)
		.css({
			zIndex: '1',
			top: 'calc(100% + 1rem)',
			backgroundColor: 'white',
			width: 'max-content',
			transition: 'all 150ms ease-in-out',
			display: 'none',
			position: 'static',
			border: 'none',
			padding: '0.5rem 1rem',
			opacity: '0',
		})
		.class('submenu')
