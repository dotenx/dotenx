import heroImg from '../../../assets/themes/sofa/hero.png'
import infoImg from '../../../assets/themes/sofa/info-1.png'
import logoImg1 from '../../../assets/themes/sofa/logo-1.png'
import logoImg2 from '../../../assets/themes/sofa/logo-2.png'
import logoImg3 from '../../../assets/themes/sofa/logo-3.png'
import logoImg4 from '../../../assets/themes/sofa/logo-4.png'
import logoImg5 from '../../../assets/themes/sofa/logo-5.png'
import { gridCols } from '../../../utils/style-utils'
import { box, btn, grid, icn, img, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'

const tags = {
	navbar: {
		links: 'links',
		button: 'button',
	},
	hero: {
		title: 'title',
		desc: 'desc',
		button: 'button',
		stats: 'stats',
		img: 'img',
		stat: {
			line: 'line',
			title: 'title',
			desc: 'desc',
		},
	},
	logos: 'logos',
	featuresText: {
		title: 'title',
		desc: 'desc',
	},
	features: {
		grid: 'grid',
		icon: 'icon',
		title: 'title',
		desc: 'desc',
	},
	info: {
		img: 'img',
		title: 'title',
		desc: 'desc',
		button: 'button',
	},
	cta: {
		button: 'button',
	},
}

const theme = {
	fontFamily: 'Inter',
	colors: {
		text: '#000000',
		textLight: '#6F6F6F',
		background: '#FFFFFF',
		light: '#EEEEEE',
		primary: '#F4A261',
		primaryLight: '#E9C46A',
		primaryDark: '#E76F51',
		secondary: '#2A9D8F',
		secondaryDark: '#264653',
	},
	shadows: {
		normal: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
	},
}

const navbar = () =>
	container([
		box([txt('Category 1'), txt('Category 2'), txt('Case studies')])
			.tag(tags.navbar.links)
			.css({
				display: 'flex',
				gap: '2.5rem',
				flexWrap: 'wrap',
			}),
		outlineBtn('Sign up').tag(tags.navbar.button),
	]).css({
		fontSize: '1.25rem',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: '2rem',
		paddingBottom: '2rem',
	})

const hero = () =>
	container([
		grid(2)
			.populate([
				box([
					box([
						box([title('BUILD YOUR COMMUNITY FASTER THAN EVER').tag(tags.hero.title)]),
						desc(
							'Elevate your online presence and expand your reach by connecting with like-minded individuals, engaging with your audience, and growing your community faster than ever before.'
						).tag(tags.hero.desc),
						primaryBtn('Join now!').tag(tags.hero.button),
					]),
					grid(2)
						.tag(tags.hero.stats)
						.populate([
							stat({ title: '200 Users', desc: 'Every week' }),
							stat({ title: '300 Subs', desc: 'Winning together' }),
							stat({ title: '700K+', desc: 'Daily views' }),
							stat({ title: '90+', desc: 'Sessions' }),
						])
						.css({
							marginTop: '4.125rem',
							gap: '5rem',
							maxWidth: '450px',
						}),
				]),
				img(heroImg).tag(tags.hero.img).cssTablet({
					width: '400px',
					height: '500px',
				}),
			])
			.css({
				gridTemplateColumns: '3fr 2fr',
				justifyItems: 'center',
			})
			.cssTablet({
				gridTemplateColumns: gridCols(1),
			}),
	]).css({
		paddingTop: '6rem',
		paddingBottom: '6rem',
	})

const stat = ({ title, desc }: { title: string; desc: string }) =>
	box([
		box()
			.css({
				width: '1.3rem',
				height: '0.3rem',
				backgroundColor: theme.colors.primaryDark,
			})
			.tag(tags.hero.stat.line),
		bold(title).tag(tags.hero.stat.title),
		txt(desc).tag(tags.hero.stat.desc).css({
			color: theme.colors.textLight,
			marginTop: '0.6rem',
		}),
	])

const logos = () =>
	container([
		grid(5)
			.populate([img(logoImg1), img(logoImg2), img(logoImg3), img(logoImg4), img(logoImg5)])
			.tag(tags.logos)
			.css({
				gap: '1.5rem',
			})
			.cssTablet({
				gridTemplateColumns: gridCols(3),
			})
			.cssMobile({
				gridTemplateColumns: gridCols(2),
			}),
	]).css({
		paddingTop: '6rem',
		paddingBottom: '6rem',
	})

const featuresText = () =>
	container([
		grid(2)
			.populate([
				title('Win The Game With These Tricks').tag(tags.featuresText.title),
				desc(
					'Elevate your online presence and expand your reach by connecting with like-minded individuals, engaging with your audience, and growing your community faster than ever before.'
				).tag(tags.featuresText.desc),
			])
			.css({
				gap: '8rem',
			})
			.cssTablet({
				gridTemplateColumns: gridCols(1),
				gap: '2rem',
			}),
	]).css({
		paddingTop: '5rem',
		paddingBottom: '5rem',
	})

const features = () =>
	container([
		grid(4)
			.tag(tags.features.grid)
			.populate([
				feature({
					title: 'Grow Faster',
					sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
					icon: 'line-chart',
				})
					.css({
						marginBottom: '9rem',
					})
					.cssMobile({
						marginBottom: '0',
					}),
				feature({
					title: 'Build Audience',
					sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
					icon: 'users',
				})
					.css({
						marginTop: '9rem',
					})
					.cssMobile({
						marginTop: '0',
					}),
				feature({
					title: 'Get Feedback',
					sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
					icon: 'comments',
				})
					.css({
						marginBottom: '9rem',
					})
					.cssMobile({
						marginBottom: '0',
					}),
				feature({
					title: 'Battle Tested',
					sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
					icon: 'shield',
				})
					.css({
						marginTop: '9rem',
					})
					.cssMobile({
						marginTop: '0',
					}),
			])
			.css({
				gap: '4.8rem',
			})
			.cssTablet({
				gap: '3rem',
				gridTemplateColumns: gridCols(2),
			})
			.cssMobile({
				gap: '2rem',
				gridTemplateColumns: gridCols(1),
			}),
	]).css({
		paddingTop: '4rem',
		paddingBottom: '4rem',
	})

const feature = ({ title, sub, icon }: { title: string; sub: string; icon: string }) =>
	box([
		icn(icon)
			.size('2rem')
			.css({
				color: theme.colors.primaryDark,
			})
			.tag(tags.features.icon),
		bold(title).tag(tags.features.title),
		txt(sub).tag(tags.features.desc).css({
			fontWeight: '700',
			color: theme.colors.textLight,
		}),
	]).css({
		border: '1px solid',
		borderRadius: '9999px',
		padding: '7.5rem 1.75rem',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '1rem',
		textAlign: 'center',
	})

const info = () =>
	container([
		grid(2)
			.populate([
				box([
					box([title('BUILD YOUR COMMUNITY FASTER THAN EVER').tag(tags.info.title)]),
					desc(
						'Elevate your online presence and expand your reach by connecting with like-minded individuals, engaging with your audience, and growing your community faster than ever before.'
					).tag(tags.info.desc),
					primaryBtn('Join now!').tag(tags.info.button),
				])
					.css({
						paddingTop: '9rem',
					})
					.cssTablet({
						paddingTop: '1rem',
					}),
				img(infoImg).tag(tags.info.img).cssTablet({
					width: '400px',
					height: '500px',
				}),
			])
			.css({
				gap: '1.25rem',
				paddingTop: '2rem',
				paddingBottom: '2rem',
				justifyItems: 'center',
			})
			.cssTablet({
				gridTemplateColumns: gridCols(1),
			}),
	])

const cta = () =>
	container([
		box([
			btn('Get the course now for $99 →')
				.tag(tags.cta.button)
				.css({
					padding: '6.5rem 10.75rem',
					backgroundColor: theme.colors.primary,
					fontWeight: '700',
					fontSize: '4rem',
					borderRadius: '3rem',
					width: '100%',
				})
				.cssTablet({
					padding: '6rem 5rem',
					fontSize: '3rem',
				})
				.cssMobile({
					padding: '4rem 3rem',
					fontSize: '2rem',
				}),
		]).css({
			border: `0.5rem solid ${theme.colors.primaryDark}`,
			borderRadius: '3rem',
			padding: '0.5rem 1.625rem',
		}),
	]).css({
		paddingTop: '4rem',
		paddingBottom: '4rem',
	})

const container = (children: Element[]) =>
	box(children).css({
		maxWidth: '1440px',
		margin: '0 auto',
		padding: '0 2rem',
	})

const title = (text: string) =>
	txt(text)
		.css({
			fontWeight: '700',
			fontSize: '4rem',
			lineHeight: '125%',
		})
		.cssTablet({
			fontSize: '3.5rem',
		})
		.cssMobile({
			fontSize: '3rem',
		})

const desc = (text: string) =>
	txt(text).css({
		color: theme.colors.textLight,
		marginTop: '1.25rem',
	})

const bold = (text: string) =>
	txt(text).css({
		fontWeight: '700',
		fontSize: '1.5rem',
		marginTop: '0.6rem',
	})

const primaryBtn = (text: string) =>
	btn(text).css({
		backgroundColor: theme.colors.text,
		boxShadow: theme.shadows.normal,
		borderRadius: '9999px',
		fontSize: '1.25rem',
		color: theme.colors.background,
		marginTop: '4rem',
		padding: '1rem 2.8rem',
	})

const outlineBtn = (text: string) =>
	btn(text).css({
		border: '1px solid',
		borderRadius: '9999px',
		padding: '1rem 3.5rem',
		boxShadow: theme.shadows.normal,
		whiteSpace: 'nowrap',
	})

export const sofa = {
	navbar,
	hero,
	logos,
	featuresText,
	features,
	info,
	cta,
	tags,
	stat,
}
