import componentImage from '../../../assets/components/faq/faq-1.png'
import { flex } from '../../elements/constructor'
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
	cmn.container
		.el([
			cmn.logo.el(),
			flex([linkList(), cmn.buttons.el()]).css({
				gap: '1.5rem',
				alignItems: 'center',
			}),
		])
		.css({
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
		})

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
	])
