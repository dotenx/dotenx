import componentImage from '../../../assets/components/faq/faq-1.png'
import { box, flex } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar11 extends Component {
	name = 'Navbar 11'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return <ComponentWrapper></ComponentWrapper>
}

const component = () =>
	cmn.container.el([
		box([
			cmn.logo.el(),
			flex([menu()]).css({
				gap: '1.5rem',
				alignItems: 'center',
			}),
			cmn.menuBtn.el(),
		]).css({
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%',
		}),
	])

const menu = () => cmn.menu.el([linkList(), cmn.buttons.el()])

const linkList = () =>
	flex([
		cmn.linkItem.el('Link One'),
		cmn.linkItem.el('Link Two'),
		cmn.linkItem.el('Link Three'),
		cmn.linkMenu.el('Link Four', [
			cmn.linkSubmenu
				.el(['Page One', 'Page Two', 'Page Three', 'Page Four'].map(cmn.menuItem.el))
				.css({
					width: '20rem',
				}),
		]),
	]).cssTablet({
		flexDirection: 'column',
	})
