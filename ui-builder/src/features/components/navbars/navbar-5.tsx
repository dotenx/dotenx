import componentImage from '../../../assets/components/faq/faq-1.png'
import { gridCols } from '../../../utils/style-utils'
import { box, column, flex, grid, icn, img, link, txt } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar5 extends Component {
	name = 'Navbar 5'
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

const menu = () => cmn.menu.el([linkList()])

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
							flex([
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
									.css({
										padding: '2rem 2rem 2rem 0',
										flex: '1',
									})
									.cssTablet({
										gridTemplateColumns: gridCols(1),
									}),
								featured(),
							]).cssTablet({
								flexDirection: 'column',
							}),
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
				],
				false
			)
			.css({
				position: 'unset',
			}),
		cmn.buttons
			.el()
			.css({
				display: 'none',
			})
			.cssTablet({
				display: 'flex',
			}),
	]).cssTablet({
		flexDirection: 'column',
	})

const featured = () =>
	column([
		txt('Featured from Blog').css({
			fontSize: '0.875rem',
			fontWeight: '600',
		}),
		articles(),
		arrowLink(),
	]).css({
		backgroundColor: '#f4f4f4',
		maxWidth: '40rem',
		flex: '1',
		padding: '2rem 5% 2rem 2rem',
		gap: '1.5rem',
		alignSelf: 'stretch',
	})

const articles = () =>
	column([article(), article()]).css({
		gap: '1rem',
	})

const article = () =>
	grid(2)
		.populate([
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
		])
		.css({
			gridTemplateColumns: '1fr 2fr',
			gap: '1.5rem',
		})
		.cssTablet({
			gridTemplateColumns: gridCols(1),
		})

const arrowLink = () =>
	link().populate([
		flex([txt('See all articles'), icn('chevron-right').size('14px')]).css({
			alignItems: 'center',
			gap: '8px',
		}),
	])
