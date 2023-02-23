import { gridCols } from '../../../utils/style-utils'
import { box, btn, flex, grid, icn, img, template, textarea, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'

const boughItems = () =>
	box([
		container([
			grid(3)
				.populate([boughtItem()])
				.css({
					gap: '60px',
				})
				.cssTablet({
					gridTemplateColumns: gridCols(2),
				})
				.cssMobile({
					gridTemplateColumns: gridCols(1),
				}),
		]).css({
			padding: '60px',
		}),
	])

const boughtItem = () =>
	template(
		box([
			img().css({
				minHeight: '400px',
				border: '1px solid #D1D1D1',
				backgroundColor: '#F1F1F1',
			}),
			flex([
				txt('Title').css({
					fontSize: '24px',
					fontWeight: '600',
				}),
				txt('Date').css({
					fontSize: '20px',
					color: '#6B6B6B',
				}),
			]).css({
				border: '1px solid #D1D1D1',
				borderTop: 'none',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '12px 14px',
			}),
			flex([
				txt('Price').css({
					padding: '12px 14px',
					fontSize: '22px',
				}),
			]).css({
				border: '1px solid #D1D1D1',
				borderTop: 'none',
				alignItems: 'center',
				justifyContent: 'space-between',
			}),
		])
	)

const boughtItemDetails = () => {
	const title = () =>
		txt('Title').css({
			fontSize: '30px',
		})

	const summary = () =>
		box([
			img()
				.css({
					minHeight: '400px',
					border: '1px solid #D1D1D1',
					backgroundColor: '#F1F1F1',
				})
				.class('image'),
			flex([
				txt('Name')
					.css({
						fontSize: '24px',
						fontWeight: '600',
					})
					.class('name'),
				txt('Price')
					.css({
						fontSize: '20px',
						color: '#6B6B6B',
					})
					.class('price'),
			]).css({
				border: '1px solid #D1D1D1',
				borderTop: 'none',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '12px 14px',
			}),
		])

	const feedback = () =>
		box([
			flex([txt('Rate this product')]).css({
				alignItems: 'center',
				justifyContent: 'space-between',
			}),
			textarea()
				.css({
					marginTop: '12px',
					width: '100%',
					border: 'none',
					backgroundColor: '#D9D9D9',
				})
				.class('feedback'),
			flex([
				btn('Submit')
					.css({
						backgroundColor: '#5FD8FE',
						color: 'white',
						padding: '10px 20px',
						fontSize: '18px',
						marginTop: '12px',
					})
					.class('submit'),
			]).css({
				justifyContent: 'end',
			}),
		]).css({
			border: '1px solid #D1D1D1',
			padding: '24px 32px',
		})

	const attachments = () =>
		flex([
			txt('Attachments').css({
				fontSize: '20px',
			}),
			flex([
				template(
					flex([
						icn('file').size('10px'),
						txt('file name'),
						flex([
							btn('Download').css({
								backgroundColor: 'white',
								border: '1px solid #D1D1D1',
								padding: '4px 10px',
							}),
						]).css({
							justifyContent: 'end',
							flexGrow: '1',
						}),
					]).css({
						backgroundColor: '#f1f1f1',
						border: '1px solid #D1D1D1',
						padding: '10px 20px',
						alignItems: 'center',
						gap: '10px',
					})
				).class('attachment'),
			]).class('attachments'),
		]).css({
			flexDirection: 'column',
			gap: '10px',
		})

	const content = () =>
		box()
			.css({
				minHeight: '500px',
				backgroundColor: '#f1f1f1',
			})
			.class('content')

	return box([
		template(
			container([
				title(),
				grid(2)
					.css({
						gridTemplateColumns: '1fr 2fr',
						gap: '60px',
						marginTop: '40px',
					})
					.populate([
						flex([summary(), feedback(), attachments()]).css({
							flexDirection: 'column',
							gap: '30px',
						}),
						content(),
					]),
			])
		).class('template'),
	])
}

const container = (children: Element[]) =>
	box(children).css({
		maxWidth: '1440px',
		margin: '0 auto',
		padding: '40px',
	})

export const theme4 = {
	boughItems,
	boughtItemDetails,
}
