import { gridCols } from '../../../utils/style-utils'
import { box, btn, grid, img, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'

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

const page = () =>
	box([
		navbar(),
		hero(),
		logos(),
		featuresText(),
		features(),
		infoLeftTxt(),
		infoRightTxt(),
		cta(),
	]).css({
		fontFamily: theme.fontFamily,
		color: theme.colors.text,
	})

const navbar = () =>
	container([
		box(),
		box([txt('Category 1'), txt('Category 2'), txt('Case studies')]).css({
			display: 'flex',
			gap: '2.5rem',
			flexWrap: 'wrap',
		}),
		outlineBtn('Sign up'),
	]).css({
		fontSize: '1.25rem',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: '1.8rem',
	})

const hero = () =>
	container([
		grid(2)
			.populate([
				box([
					infoTxt().css({
						paddingTop: '6rem',
					}),
					grid(2)
						.populate([
							stat({ title: '200 Users', sub: 'Every week' }),
							stat({ title: '300 Subs', sub: 'Winning together' }),
							stat({ title: '700K+', sub: 'Daily views' }),
							stat({ title: '90+', sub: 'Sessions' }),
						])
						.css({
							marginTop: '4.125rem',
							gap: '5rem',
							maxWidth: '450px',
						}),
				]),
				img(),
			])
			.css({
				gridTemplateColumns: '3fr 2fr',
				paddingBottom: '10rem',
			})
			.cssTablet({
				gridTemplateColumns: gridCols(1),
			}),
	])

const infoTxt = () =>
	box([
		box([title('BUILD YOUR COMMUNITY'), title('FASTER THAN EVER')]),
		desc(
			'Elevate your online presence and expand your reach by connecting with like-minded individuals, engaging with your audience, and growing your community faster than ever before.'
		),
		primaryBtn('Join now!'),
	])

const stat = ({ title, sub }: { title: string; sub: string }) =>
	box([
		box().css({
			width: '1.3rem',
			height: '0.3rem',
			backgroundColor: theme.colors.primaryDark,
		}),
		bold(title),
		txt(sub).css({
			color: theme.colors.textLight,
			marginTop: '0.6rem',
		}),
	])

const logos = () =>
	container([
		grid(5)
			.populate([img(), img(), img(), img(), img()])
			.cssTablet({
				gridTemplateColumns: gridCols(3),
			}),
	]).css({
		paddingBottom: '10rem',
	})

const featuresText = () =>
	container([
		grid(2)
			.populate([
				title('Win The Game With These Tricks'),
				desc(
					'Elevate your online presence and expand your reach by connecting with like-minded individuals, engaging with your audience, and growing your community faster than ever before.'
				),
			])
			.css({
				gap: '8rem',
			})
			.cssTablet({
				gridTemplateColumns: gridCols(1),
			}),
	]).css({
		paddingBottom: '10rem',
	})

const features = () =>
	container([
		grid(4)
			.populate([
				feature({
					title: 'Grow Faster',
					sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
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
				gridTemplateColumns: gridCols(2),
			})
			.cssMobile({
				gridTemplateColumns: gridCols(1),
			}),
	]).css({
		paddingBottom: '10rem',
	})

const feature = ({ title, sub }: { title: string; sub: string }) =>
	box([
		img(),
		bold(title),
		txt(sub).css({
			fontWeight: '700',
			color: theme.colors.textLight,
		}),
	]).css({
		border: '1px solid',
		borderRadius: '50% 50% 50% 50% / 30% 30% 30% 30%',
		padding: '7.5rem 1.75rem',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '1rem',
		textAlign: 'center',
	})

const infoLeftTxt = () =>
	container([
		grid(2)
			.populate([infoTxt(), img()])
			.css({
				gap: '1.25rem',
				paddingBottom: '10rem',
			})
			.cssTablet({
				gridTemplateColumns: gridCols(1),
			}),
	])

const infoRightTxt = () =>
	container([
		grid(2)
			.populate([
				img(),
				infoTxt().cssTablet({
					gridRow: '1',
				}),
			])
			.css({
				gap: '1.25rem',
				paddingBottom: '10rem',
			})
			.cssTablet({
				gridTemplateColumns: gridCols(1),
			}),
	])

const cta = () =>
	container([
		box([
			btn('Get the course now for $99 →')
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
		paddingBottom: '10rem',
	})

const container = (children: Element[]) =>
	box(children).css({
		maxWidth: '1440px',
		margin: '0 auto',
		padding: '0 1.5rem',
	})

const title = (text: string) =>
	txt(text).css({
		fontWeight: '700',
		fontSize: '4rem',
		lineHeight: '125%',
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
		marginTop: '4.625rem',
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

export { page as sofa }
