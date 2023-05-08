import componentImage from '../../../assets/components/faq/faq-1.png'
import { flex, grid, icn, txt } from '../../elements/constructor'
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
			.el('Link Four', [
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
						]).css({
							backgroundColor: '#F4F4F4',
							padding: '1.5rem 5%',
							justifyContent: 'space-between',
							alignItems: 'center',
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
			])
			.css({
				position: 'unset',
			}),
	])

const btn = () =>
	flex([icn('cube').size('14px'), txt('Button')]).css({
		alignItems: 'center',
		gap: '1rem',
	})
