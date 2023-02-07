import _ from 'lodash'
import { gridCols } from '../../../utils/style-utils'
import { box, btn, flex, grid, icn, img, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'

const theme = {
	colors: {
		primary: '#00A3FF',
		white: '#FFFFFF',
		gray: '#EBEBEB',
		gray1: '#F2F2F4',
		gray2: '#515151',
		gray3: '#FBFBFB',
		gray4: '#BDBDBD',
		gray5: '#D1D1D1',
		secondary: '#FF9BB6',
	},
	shadows: {
		normal: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
	},
}

const tags = {}

// ----------------------------------------------

const navbar = () => box([auth(), links()])

const auth = () =>
	box([
		container([
			box(),
			txt('Free international shipping on orders over $99'),
			flex([txt('SIGN UP'), txt('SIGN IN')]).css({
				gap: '50px',
			}),
		]).css({
			padding: '0',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
		}),
	]).css({
		backgroundColor: theme.colors.primary,
		color: theme.colors.white,
		padding: '18px 0',
		fontSize: '20px',
		fontWeight: '500',
	})

const links = () =>
	box([
		container([txt('MEN'), txt('WOMEN'), txt('SALE'), icn('basket-shopping').size('36px')]).css(
			{
				display: 'flex',
				justifyContent: 'end',
				alignItems: 'center',
				gap: '80px',
			}
		),
	]).css({
		backgroundColor: theme.colors.gray,
		color: theme.colors.primary,
		fontSize: '22px',
		fontWeight: '500',
	})

const hero = () =>
	box([
		container([
			grid(2)
				.populate([
					box([
						txt('Minimal Men Style').css({
							fontSize: '64px',
						}),
						txt(
							'Lorem ipsum dolor sit amet, consectet adipisicing elit., reprehenderit sed aliquid quaerat.'
						).css({
							fontSize: '36px',
							color: theme.colors.gray2,
						}),
						btn('SHOP NOW').css({
							fontWeight: '500',
							fontSize: '32px',
							color: theme.colors.white,
							backgroundColor: theme.colors.primary,
							padding: '20px 52px',
						}),
					]).css({
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						gap: '58px',
						textAlign: 'center',
					}),
					img().css({
						height: '856px',
					}),
				])
				.css({
					justifyItems: 'center',
				}),
		]),
	]).css({
		backgroundColor: theme.colors.gray1,
	})

const collections = () =>
	container([
		grid(3)
			.populate([
				collection({
					title: "Men's Fashion",
					image: 'https://img.freepik.com/free-psd/black-t-shirt-model-front-view-mockup_125540-1059.jpg?w=1060&t=st=1675764214~exp=1675764814~hmac=164ebf1fecc80be9e31568c09a727c8e36741ccbbb1d55d3bd11007d81b7ec9f',
					color: theme.colors.primary,
				}),
				collection({
					title: "Women's Fashion",
					image: 'https://img.freepik.com/free-psd/black-t-shirt-model-front-view-mockup_125540-1059.jpg?w=1060&t=st=1675764214~exp=1675764814~hmac=164ebf1fecc80be9e31568c09a727c8e36741ccbbb1d55d3bd11007d81b7ec9f',
					color: theme.colors.secondary,
				}),
				collection({
					title: 'Sale',
					image: 'https://img.freepik.com/free-psd/black-t-shirt-model-front-view-mockup_125540-1059.jpg?w=1060&t=st=1675764214~exp=1675764814~hmac=164ebf1fecc80be9e31568c09a727c8e36741ccbbb1d55d3bd11007d81b7ec9f',
					color: theme.colors.gray2,
				}),
			])
			.css({
				gap: '50px',
				padding: '50px 0',
			}),
	])

const collection = ({ title, image, color }: { title: string; image: string; color: string }) =>
	box([
		txt(title).css({
			fontSize: '40px',
			fontWeight: '500',
			color: theme.colors.white,
			padding: '36px 0 18px 0',
			background: `linear-gradient(180deg, ${color}00 0%, ${color}AA 100%)`,
			width: '100%',
			textAlign: 'center',
		}),
	]).css({
		backgroundImage: `url(${image})`,
		minHeight: '270px',
		textAlign: 'center',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'end',
		alignItems: 'center',
	})

const featuredProduct = () =>
	box([
		container([
			grid(2)
				.populate([
					img().css({
						height: '410px',
						backgroundColor: theme.colors.gray,
						boxShadow: theme.shadows.normal,
						width: '100%',
					}),
					box([
						txt('FLORAL JACKQUARD PULLOVER').css({
							fontWeight: '700',
							fontSize: '30px',
							color: theme.colors.white,
						}),
						txt('$50.00').css({
							marginTop: '32px',
							fontWeight: '700',
							fontSize: '30px',
							color: theme.colors.white,
						}),
						box([
							icn('basket-shopping').size('40px'),
							txt('ADD TO CART').css({
								fontWeight: '500',
								fontSize: '32px',
							}),
						]).css({
							marginTop: '32px',
							color: theme.colors.primary,
							backgroundColor: theme.colors.white,
							padding: '20px 8px',
							display: 'inline-flex',
							gap: '10px',
						}),
					]),
				])
				.css({
					gridTemplateColumns: '1fr 2fr',
					alignItems: 'center',
					gap: '102px',
				}),
		]),
	]).css({
		backgroundColor: theme.colors.primary,
		padding: '60px 0',
	})

const productList = () =>
	box([
		container([
			flex([
				txt('MEN').css({
					borderBottom: `4px solid ${theme.colors.primary}`,
					padding: '10px 0',
				}),
				txt('WOMEN').css({
					padding: '10px 0',
				}),
				txt('SALE').css({
					padding: '10px 0',
				}),
			]).css({
				gap: '40px',
				fontSize: '22px',
				fontWeight: '500',
			}),
			grid(4)
				.populate(
					_.range(8).map(() =>
						productItem({
							title: 'FLORAL JACKQUARD PULLOVER',
							price: '$50.00',
							image: '',
						})
					)
				)
				.css({
					gap: '66px 46px',
					marginTop: '50px',
				})
				.cssTablet({
					gridTemplateColumns: gridCols(2),
				})
				.cssMobile({
					gridTemplateColumns: gridCols(1),
				}),
			flex([
				btn('Show More').css({
					marginTop: '88px',
					fontSize: '32px',
					fontWeight: '500',
					backgroundColor: theme.colors.gray4,
					color: theme.colors.white,
					padding: '20px 56px',
				}),
			]).css({
				justifyContent: 'center',
			}),
		]),
	]).css({
		backgroundColor: theme.colors.gray3,
	})

const productItem = ({ title, price, image }: { title: string; price: string; image: string }) =>
	box([
		box([
			grid(2)
				.populate([
					btn('ADD TO CART').css({
						backgroundColor: theme.colors.white,
						color: theme.colors.primary,
						fontWeight: '500',
						fontSize: '12px',
						padding: '10px 20px',
					}),
					btn('BUY NOW').css({
						backgroundColor: theme.colors.primary,
						color: theme.colors.white,
						fontWeight: '500',
						fontSize: '12px',
						padding: '10px 20px',
					}),
				])
				.css({
					gap: '20px',
				}),
		]).css({
			backgroundColor: theme.colors.gray5,
			backgroundImage: `url(${image})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			minHeight: '254px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'end',
			alignItems: 'center',
			gap: '20px',
			padding: '18px',
			border: `1px solid ${theme.colors.gray5}`,
		}),
		box([
			txt(title).css({
				fontWeight: '300',
			}),
			txt(price).css({
				marginTop: '6px',
				fontWeight: '500',
			}),
		]).css({
			border: `1px solid ${theme.colors.gray5}`,
			padding: '14px 10px',
			backgroundColor: theme.colors.white,
		}),
	]).css({
		boxShadow: theme.shadows.normal,
	})

// ----------------------------------------------

const container = (children: Element[]) =>
	box(children).css({
		maxWidth: '1440px',
		margin: '0 auto',
		padding: '40px',
	})

export const theme3 = {
	navbar,
	hero,
	collections,
	featuredProduct,
	productList,
}
