import componentImage from '../../../assets/components/navbar/navbar-7.png'
import { gridCols } from '../../../utils/style-utils'
import { box, flex, grid, icn, txt } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar7 extends Component {
	name = 'Navbar 7'
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
			flex([cmn.logo.el(), menu()]).css({
				gap: '1.5rem',
				alignItems: 'center',
			}),
			cmn.buttons.el().cssTablet({
				display: 'none',
			}),
			cmn.menuBtn.el(),
		]).css({
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%',
		}),
	])

const menu = () =>
	cmn.menu.el([
		linkList(),
		cmn.buttons
			.el()
			.css({
				display: 'none',
			})
			.cssTablet({
				display: 'flex',
				paddingBottom: '1rem',
			}),
	])

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
									cmn.pageGroup.el('Page group three', [
										'Page Nine',
										'Page Ten',
										'Page Eleven',
										'Page Twelve',
									]),
									cmn.pageGroup.el('Page group four', [
										'Page Thirteen',
										'Page Fourteen',
										'Page Fifteen',
										'Page Sixteen',
									]),
								])
								.css({
									padding: '2rem 5%',
								})
								.cssTablet({
									gridTemplateColumns: gridCols(1),
								}),
							flex([
								flex([
									txt('Ready to get started?'),
									txt(' Sign up for free').css({
										textDecoration: 'underline',
									}),
								]).css({
									gap: '1ch',
								}),
								flex([btn(), btn()]).css({
									gap: '2rem',
								}),
							])
								.css({
									backgroundColor: '#F4F4F4',
									padding: '1.5rem 5%',
									justifyContent: 'space-between',
									alignItems: 'center',
								})
								.cssTablet({
									flexDirection: 'column',
									gap: '1rem',
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
	]).cssTablet({
		flexDirection: 'column',
	})

const btn = () =>
	flex([icn('cube').size('14px'), txt('Button')]).css({
		alignItems: 'center',
		gap: '1rem',
	})
