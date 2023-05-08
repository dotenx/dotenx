import componentImage from '../../../assets/components/faq/faq-1.png'
import { column, flex, grid, txt } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar8 extends Component {
	name = 'Navbar 8'
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
						flex([
							grid(4)
								.populate([
									cmn.pageGroup
										.el('Page group one', [
											'Page One',
											'Page Two',
											'Page Three',
											'Page Four',
										])
										.css({
											padding: '2rem 0',
										}),
									cmn.pageGroup
										.el('Page group two', [
											'Page Five',
											'Page Six',
											'Page Seven',
											'Page Eight',
										])
										.css({
											padding: '2rem 0',
										}),
									cmn.pageGroup
										.el('Page group two', [
											'Page Nine',
											'Page Ten',
											'Page Eleven',
											'Page Twelve',
										])
										.css({
											padding: '2rem 0',
										}),
									column([
										txt('Page group four').css({
											fontWeight: '600',
										}),
										txt('Link one'),
										txt('Link two'),
										txt('Link three'),
										txt('Link four'),
										txt('Link five'),
									]).css({
										gap: '1rem',
										fontSize: '0.875rem',
										backgroundColor: '#f4f4f4',
										padding: '2rem 5% 2rem 2rem',
									}),
								])
								.css({
									flex: '1',
									padding: '0 0 0 5%',
								}),
						]),
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
