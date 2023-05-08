import componentImage from '../../../assets/components/faq/faq-1.png'
import { flex, grid } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar12 extends Component {
	name = 'Navbar 12'
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
				.el([
					grid(2).populate([
						cmn.pageGroup.el('Page group one', [
							'Page One',
							'Page Two',
							'Page Three',
							'Page Four',
						]),
						cmn.pageGroup.el('Page group two', [
							'Page Five',
							'Page Six',
							'Page Seven',
							'Page Eight',
						]),
					]),
				])
				.css({
					width: '40rem',
					right: '-100%',
				}),
		]),
	])
