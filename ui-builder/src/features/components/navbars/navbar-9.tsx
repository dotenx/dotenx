import componentImage from '../../../assets/components/faq/faq-1.png'
import { flex, grid, txt } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar9 extends Component {
	name = 'Navbar 9'
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
			flex([cmn.logo.el(), linkList()]).css({
				gap: '1.5rem',
				alignItems: 'center',
			}),
			cmn.buttons.el(),
		])
		.css({
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			position: 'relative',
		})

const linkList = () =>
	flex([
		cmn.linkItem.el('Link One'),
		cmn.linkItem.el('Link Two'),
		cmn.linkItem.el('Link Three'),
		cmn.linkMenu
			.el(
				'Link Four',
				[
					cmn.linkSubmenu
						.el([
							grid(4)
								.populate([
									cmn.menuItem.el('Page one'),
									cmn.menuItem.el('Page two'),
									cmn.menuItem.el('Page three'),
									cmn.menuItem.el('Page four'),
								])
								.css({
									padding: '2rem 5%',
								}),
							flex([
								flex([
									txt('Ready to get started?'),
									txt(' Sign up for free').css({
										textDecoration: 'underline',
									}),
								]).css({
									gap: '1ch',
									textAlign: 'center',
								}),
							]).css({
								backgroundColor: '#F4F4F4',
								padding: '1rem 5%',
								justifyContent: 'center',
							}),
						])
						.css({
							top: '100%',
							right: '0',
							left: '0',
							width: 'auto',
							border: 'none',
							borderBottom: '1px solid #000',
							padding: '0',
						}),
				],
				false
			)
			.css({
				position: 'unset',
			}),
	])
