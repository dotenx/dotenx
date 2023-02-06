import { gridCols } from '../../../utils/style-utils'
import { box, btn, grid, icn, img, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'

const tags = {
	navbar: {
		logo: 'logo',
		navLinks: 'navLinks',
		signUp: 'signUp',
		signIn: 'signIn',
	},
	hero: {
		title: 'title',
		button: 'button',
		subtitle: 'subtitle',
		image: 'image',
	},
	featureText: {
		image: 'image',
		text: 'text',
	},
	features: {
		list: 'list',
	},
	testimonial: {
		image: 'image',
		title: 'title',
		subtitle: 'subtitle',
		author: 'author',
		icons: 'icons',
	},
	cta: {
		button: 'button',
	},
}

const theme = {
	colors: {
		text: '#000000',
		background: '#F4F5FD',
		primary: '#F25608',
		secondary: '#BF6FE3',
	},
}

const navbar = () =>
	box([
		container([logo(), navLinks(), authButtons()]).css({
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			flexWrap: 'wrap',
			gap: '50px',
		}),
	]).css({
		backgroundColor: theme.colors.background,
		fontSize: '20px',
	})

const logo = () => img().tag(tags.navbar.logo)

const navLinks = () =>
	box([txt('Category 1'), txt('Category 2'), txt('Case studies')])
		.tag(tags.navbar.navLinks)
		.css({
			display: 'flex',
			gap: '50px',
			flexWrap: 'wrap',
		})

const authButtons = () =>
	box([
		btn('Sign up').tag(tags.navbar.signUp).css({
			color: 'white',
			backgroundColor: theme.colors.primary,
			padding: '18px 38px',
		}),
		btn('Sign in').tag(tags.navbar.signIn).css({
			backgroundColor: 'white',
			padding: '18px 20px',
		}),
	]).css({
		display: 'flex',
		gap: '10px',
	})

const hero = () =>
	box([
		container([
			title('Discover the Power of AI: Stay Ahead of the Curve').tag(tags.hero.title).css({
				maxWidth: '900px',
				textAlign: 'center',
			}),
			btn('Join Now').tag(tags.hero.button).css({
				backgroundColor: 'black',
				color: 'white',
				fontWeight: '700',
				fontSize: '24px',
				padding: '16px 76px',
				marginTop: '56px',
			}),
			grid(2)
				.populate([
					box([
						box().css({
							height: '4px',
							width: '120px',
							backgroundColor: 'black',
						}),
						desc(
							'Get access to the latest AI insights and trends with our paid newsletter. Stay ahead of the game and gain a competitive edge with cutting-edge AI knowledge.'
						).tag(tags.hero.subtitle),
					]).css({
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: '30px',
					}),
					img()
						.tag(tags.hero.image)
						.css({
							height: '645px',
						})
						.cssTablet({
							height: '400px',
						})
						.cssMobile({
							height: '300px',
						}),
				])
				.css({
					alignItems: 'center',
					marginTop: '20px',
				})
				.cssTablet({
					gridTemplateColumns: gridCols(1),
				}),
		]).css({
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
		}),
	]).css({
		backgroundColor: theme.colors.background,
	})

const featureText = () =>
	container([
		img().tag(tags.featureText.image),
		subtitle('Sign up now and get 20% discount').tag(tags.featureText.text),
	]).css({
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '10px',
	})

const features = () =>
	box([
		container([
			grid(2)
				.populate([
					box([
						feature({
							color: theme.colors.primary,
							title: 'Stay Up-to-Date on the Latest AI Developments',
						}),
						feature({
							color: theme.colors.secondary,
							title: 'Actionable Content: Put AI Knowledge into Practice',
						}),
						feature({
							color: 'black',
							title: 'Join a Community of AI Enthusiasts: Network and Collaborate',
						}),
					]).tag(tags.features.list),
					box([
						subtitle('Stay Up-to-Date on the Latest AI Developments'),
						img()
							.css({
								marginTop: '98px',
								height: '370px',
							})
							.cssTablet({
								marginTop: '60px',
								height: '300px',
							})
							.cssMobile({
								marginTop: '40px',
								height: '200px',
							}),
						desc(
							'Stay informed on the latest research and practical applications of AI with our newsletter. Stay informed on the latest research and practical applications of AI with our newsletter.'
						).css({
							marginTop: '120px',
						}),
					]).css({
						marginTop: '42px',
					}),
				])
				.css({
					gap: '110px',
				})
				.cssTablet({
					gridTemplateColumns: gridCols(1),
				}),
		]),
	]).css({
		backgroundColor: theme.colors.background,
		paddingTop: '78px',
	})

const feature = ({ title, color }: { title: string; color: string }) =>
	box([
		subtitle(title),
		box([
			desc('Learn more'),
			btn('')
				.css({
					borderRadius: '9999px',
					width: '130px',
					height: '130px',
					backgroundColor: color,
				})
				.cssTablet({
					width: '100px',
					height: '100px',
				})
				.cssMobile({
					width: '80px',
					height: '80px',
				}),
		]).css({
			display: 'flex',
			gap: '40px',
			alignItems: 'center',
			justifyContent: 'end',
		}),
	]).css({
		padding: '78px 0',
		borderTop: '3px solid black',
		display: 'flex',
		flexDirection: 'column',
		gap: '78px',
	})

const testimonial = () =>
	box([
		container([
			grid(3)
				.populate([
					img().tag(tags.testimonial.image),
					box([
						subtitle('The best newsletter ever!').tag(tags.testimonial.title),
						desc(
							'Stay informed on the latest research and practical applications of AI with our newsletter. Stay informed on the latest research and practical applications of AI with our newsletter.'
						)
							.tag(tags.testimonial.subtitle)
							.css({
								marginTop: '60px',
							}),
						box([
							txt('- John Miller').tag(tags.testimonial.author).css({
								color: theme.colors.primary,
								fontWeight: '700',
							}),
							box([
								icn('star').size('20px'),
								icn('star').size('20px'),
								icn('star').size('20px'),
							])
								.tag(tags.testimonial.icons)
								.css({
									display: 'flex',
									gap: '10px',
								}),
						]).css({
							marginTop: '38px',
							display: 'flex',
							alignItems: 'center',
							gap: '30px',
						}),
					]),
				])
				.css({
					gridTemplateColumns: '1fr 2fr',
					gap: '168px',
				})
				.cssTablet({
					gridTemplateColumns: gridCols(1),
				}),
		]),
	]).css({
		backgroundColor: theme.colors.background,
	})

const cta = () =>
	box([
		container([
			box([
				btn('Join the newsletter now for $99 →')
					.tag(tags.cta.button)
					.css({
						padding: '106px 0',
						backgroundColor: theme.colors.secondary,
						color: 'white',
						fontWeight: '700',
						fontSize: '50px',
						borderRadius: '48px',
						width: '100%',
					})
					.cssTablet({
						padding: '80px 0',
						fontSize: '40px',
					})
					.cssMobile({
						padding: '60px 0',
						fontSize: '30px',
					}),
			]).css({
				border: `8px solid ${theme.colors.secondary}`,
				borderRadius: '48px',
				padding: '8px 26px',
			}),
		]),
	]).css({
		backgroundColor: theme.colors.background,
	})

const container = (children: Element[]) =>
	box(children).css({
		maxWidth: '1440px',
		margin: '0 auto',
		padding: '40px',
	})

const title = (text: string) =>
	txt(text)
		.css({
			fontWeight: '700',
			fontSize: '64px',
			lineHeight: '125%',
		})
		.cssTablet({
			fontSize: '48px',
		})
		.cssMobile({
			fontSize: '32px',
		})

const subtitle = (text: string) =>
	txt(text)
		.css({
			fontWeight: '700',
			fontSize: '40px',
			lineHeight: '125%',
		})
		.cssTablet({
			fontSize: '32px',
		})
		.cssMobile({
			fontSize: '24px',
		})

const desc = (text: string) =>
	txt(text)
		.css({
			fontWeight: '700',
			fontSize: '24px',
			color: '#6F6F6F',
		})
		.cssTablet({
			fontSize: '20px',
		})
		.cssMobile({
			fontSize: '16px',
		})

export const theme2 = {
	tags,
	navbar,
	hero,
	featureText,
	features,
	feature,
	testimonial,
	cta,
}
