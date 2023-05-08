import componentImage from '../../../assets/components/faq/faq-1.png'
import { box, flex, icn } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar1 extends Component {
	name = 'Navbar 1'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return <ComponentWrapper></ComponentWrapper>
}

const component = () =>
	box([
		cmn.container.el([cmn.logo.el(), menu(), menuBtn()]).css({
			display: 'flex',
			justifyContent: 'space-between',
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

const menu = () =>
	flex([cmn.linkList.el(), cmn.buttons.el()])
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
