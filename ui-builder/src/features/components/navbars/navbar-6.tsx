import componentImage from '../../../assets/components/faq/faq-1.png'
import { box, column, flex, grid, icn, img, link, txt } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar6 extends Component {
	name = 'Navbar 6'
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
							grid(3)
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
									cmn.pageGroup.el('Page group two', [
										'Page Nine',
										'Page Ten',
										'Page Eleven',
										'Page Twelve',
									]),
								])
								.css({
									padding: '2rem 2rem 2rem 0',
									flex: '1',
								}),
							featured(),
						]),
					])
					.css({
						top: '100%',
						right: '0',
						left: '0',
						width: 'auto',
						border: 'none',
						borderBottom: '1px solid #000',
						paddingLeft: '5%',
						padding: '0',
					}),
			])
			.css({
				position: 'unset',
			}),
	])

const featured = () =>
	column([
		txt('Featured from Blog').css({
			fontSize: '0.875rem',
			fontWeight: '600',
		}),
		article(),
		arrowLink(),
	]).css({
		backgroundColor: '#f4f4f4',
		maxWidth: '25rem',
		flex: '1',
		padding: '2rem 5% 2rem 2rem',
		gap: '1.5rem',
		alignSelf: 'stretch',
	})

const article = () =>
	box([
		img('https://files.dotenx.com/assets/hero-bg-wva.jpeg'),
		box([
			txt('Article Title').css({
				fontWeight: '600',
				lineHeight: '1.5',
				paddingTop: '0.5rem',
			}),
			txt('Lorem ipsum dolor sit amet, consectetur adipiscing elit').css({
				fontSize: '0.875rem',
				lineHeight: '1.5',
				paddingTop: '0.5rem',
			}),
			txt('Read more').css({
				fontSize: '0.875rem',
				textDecoration: 'underline',
				lineHeight: '1.5',
				paddingTop: '0.5rem',
			}),
		]),
	]).css({
		gridTemplateColumns: '1fr 2fr',
		gap: '1.5rem',
	})

const arrowLink = () =>
	link().populate([
		flex([txt('See all articles'), icn('chevron-right').size('14px')]).css({
			alignItems: 'center',
			gap: '8px',
		}),
	])
