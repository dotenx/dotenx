import componentImage from '../../../assets/components/navbar/navbar-12.png'
import { gridCols } from '../../../utils/style-utils'
import { box, flex, grid } from '../../elements/constructor'
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
				.el([
					grid(2)
						.populate([
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
						])
						.cssTablet({
							gridTemplateColumns: gridCols(1),
						}),
				])
				.css({
					width: '40rem',
					right: '-100%',
				})
				.cssTablet({
					width: 'auto',
				}),
		]),
	]).cssTablet({
		flexDirection: 'column',
	})
