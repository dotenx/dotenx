import { gridCols } from '../../../utils/style-utils'
import { box, btn, flex, grid, icn, img, template, txt } from '../../elements/constructor'
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

const tags = {
	navbar: {
		text: 'text',
		signUp: 'signUp',
		signIn: 'signIn',
		links: 'links',
	},
	hero: {
		title: 'title',
		subtitle: 'subtitle',
		button: 'button',
		image: 'image',
	},
	collections: {
		list: 'list',
		item: {
			title: 'title',
		},
	},
	featuredProduct: {
		title: 'title',
		image: 'image',
		price: 'price',
		button: 'button',
	},
	productList: {
		list: 'list',
		tabs: 'tabs',
		item: {
			title: 'title',
			price: 'price',
		},
	},
}

// ----------------------------------------------

const navbar = () => box([auth(), links()])

const auth = () =>
	box([
		container([
			box().cssTablet({
				display: 'none',
			}),
			txt('Free international shipping on orders over $99').tag(tags.navbar.text),
			flex([
				btn('SIGN UP').tag(tags.navbar.signUp),
				btn('SIGN IN').tag(tags.navbar.signIn),
			]).css({
				gap: '50px',
				flexWrap: 'wrap',
			}),
		]).css({
			padding: '0',
			display: 'flex',
			justifyContent: 'space-between',
			flexWrap: 'wrap',
			alignItems: 'center',
		}),
	]).css({
		backgroundColor: theme.colors.primary,
		color: theme.colors.white,
		padding: '18px 10px',
		fontSize: '20px',
		fontWeight: '500',
	})

const links = () =>
	box([
		container([
			flex([txt('MEN'), txt('WOMEN'), txt('SALE')])
				.tag(tags.navbar.links)
				.css({
					flexWrap: 'wrap',
					gap: '80px',
				}),
			icn('basket-shopping').size('36px'),
		]).css({
			display: 'flex',
			flexWrap: 'wrap',
			justifyContent: 'end',
			alignItems: 'center',
			gap: '80px',
		}),
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
						txt('Minimal Men Style')
							.tag(tags.hero.title)
							.css({
								fontSize: '64px',
							})
							.cssTablet({
								fontSize: '48px',
							})
							.cssMobile({
								fontSize: '32px',
							}),
						txt(
							'Lorem ipsum dolor sit amet, consectet adipisicing elit., reprehenderit sed aliquid quaerat.'
						)
							.tag(tags.hero.subtitle)
							.css({
								fontSize: '36px',
								color: theme.colors.gray2,
							})
							.cssTablet({
								fontSize: '24px',
							})
							.cssMobile({
								fontSize: '18px',
							}),
						btn('SHOP NOW')
							.tag(tags.hero.button)
							.css({
								fontWeight: '500',
								fontSize: '32px',
								color: theme.colors.white,
								backgroundColor: theme.colors.primary,
								padding: '20px 52px',
							})
							.cssTablet({
								fontSize: '24px',
							})
							.cssMobile({
								fontSize: '18px',
							}),
					]).css({
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						gap: '58px',
						textAlign: 'center',
					}),
					img()
						.tag(tags.hero.image)
						.css({
							height: '856px',
						})
						.cssTablet({
							height: '600px',
						})
						.cssMobile({
							height: '400px',
						}),
				])
				.css({
					justifyItems: 'center',
				})
				.cssTablet({
					gridTemplateColumns: gridCols(1),
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
			.tag(tags.collections.list)
			.css({
				gap: '50px',
				padding: '50px 0',
			})
			.cssTablet({
				gridTemplateColumns: gridCols(2),
			})
			.cssMobile({
				gridTemplateColumns: gridCols(1),
			}),
	])

const collection = ({ title, image, color }: { title: string; image: string; color: string }) =>
	box([
		txt(title)
			.tag(tags.collections.item.title)
			.css({
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
					img()
						.tag(tags.featuredProduct.image)
						.css({
							height: '410px',
							backgroundColor: theme.colors.gray,
							boxShadow: theme.shadows.normal,
							width: '100%',
						})
						.class('image'),
					box([
						txt('FLORAL JACKQUARD PULLOVER')
							.tag(tags.featuredProduct.title)
							.css({
								fontWeight: '700',
								fontSize: '30px',
								color: theme.colors.white,
							})
							.class('title'),
						txt('$50.00')
							.tag(tags.featuredProduct.price)
							.css({
								marginTop: '32px',
								fontWeight: '700',
								fontSize: '30px',
								color: theme.colors.white,
							})
							.class('price'),
						box([
							icn('basket-shopping').size('40px'),
							btn('ADD TO CART')
								.css({
									fontWeight: '500',
									fontSize: '32px',
								})
								.tag(tags.featuredProduct.button)
								.class('add-to-cart'),
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
				})
				.cssTablet({
					gridTemplateColumns: gridCols(1),
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
			])
				.css({
					gap: '40px',
					fontSize: '22px',
					fontWeight: '500',
				})
				.tag(tags.productList.tabs)
				.class('tabs'),
			grid(4)
				.populate([
					productItem({
						title: 'Product name',
						price: 'Price',
						image: '',
					}),
				])
				.class('list')
				.tag(tags.productList.list)
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
				btn('Show More')
					.css({
						marginTop: '88px',
						fontSize: '32px',
						fontWeight: '500',
						backgroundColor: theme.colors.gray2,
						color: theme.colors.white,
						padding: '20px 56px',
					})
					.class('show-more'),
			]).css({
				justifyContent: 'center',
			}),
		]),
	]).css({
		backgroundColor: theme.colors.gray3,
	})

const productItem = ({ title, price, image }: { title: string; price: string; image: string }) =>
	template(
		box([
			box([
				grid(2)
					.populate([
						btn('ADD TO CART')
							.css({
								backgroundColor: theme.colors.white,
								color: theme.colors.primary,
								fontWeight: '500',
								fontSize: '12px',
								padding: '10px 20px',
							})
							.class('add-to-cart'),
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
			])
				.css({
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
				})
				.class('image'),
			box([
				txt(title)
					.tag(tags.featuredProduct.title)
					.css({
						fontWeight: '300',
					})
					.class('name'),
				txt(price)
					.tag(tags.featuredProduct.price)
					.css({
						marginTop: '6px',
						fontWeight: '500',
					})
					.class('price'),
			]).css({
				border: `1px solid ${theme.colors.gray5}`,
				padding: '14px 10px',
				backgroundColor: theme.colors.white,
			}),
		]).css({
			boxShadow: theme.shadows.normal,
		})
	).class('item')

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
	collection,
	productItem,
	tags,
}
