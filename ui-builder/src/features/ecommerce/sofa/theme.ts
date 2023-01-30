import { box, btn, grid, img, txt } from '../../elements/constructor'

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
	container: {
		padding: '8.5rem',
	},
}

const page = () =>
	box([navbar(), hero(), logos(), featuresText(), features(), info(), info(), cta()]).css({
		fontFamily: theme.fontFamily,
		color: theme.colors.text,
	})

const navbar = () =>
	box([
		box(),
		box([txt('Category 1'), txt('Category 2'), txt('Case studies')]).css({
			display: 'flex',
			gap: '2.5rem',
		}),
		btn('Sign up').css({
			border: '1px solid',
			borderRadius: '9999px',
			padding: '1rem 3.5rem',
			boxShadow: theme.shadows.normal,
		}),
	]).css({
		fontSize: '1.25rem',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: `1.75rem ${theme.container.padding}`,
	})

const hero = () =>
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
						width: '50%',
					}),
			]),
			img(),
		])
		.css({
			gridTemplateColumns: '3fr 2fr',
			paddingLeft: theme.container.padding,
			paddingBottom: '10rem',
		})

const infoTxt = () =>
	box([
		title('BUILD YOUR COMMUNITY FASTER THAN EVER'),
		desc(
			'Elevate your online presence and expand your reach by connecting with like-minded individuals, engaging with your audience, and growing your community faster than ever before.'
		),
		btn('Join now!').css({
			backgroundColor: theme.colors.text,
			boxShadow: theme.shadows.normal,
			borderRadius: '9999px',
			fontSize: '1.25rem',
			color: theme.colors.background,
			marginTop: '4.625rem',
			padding: '1rem 2.8rem',
		}),
	])

const stat = ({ title, sub }: { title: string; sub: string }) =>
	box([
		box().css({
			width: '1.3rem',
			height: '0.3rem',
			backgroundColor: theme.colors.primaryDark,
		}),
		txt(title).css({
			fontWeight: '700',
			fontSize: '1.5rem',
			marginTop: '0.6rem',
		}),
		txt(sub).css({
			color: theme.colors.textLight,
			marginTop: '0.6rem',
		}),
	])

const logos = () =>
	grid(5)
		.populate([img(), img(), img(), img(), img()])
		.css({
			padding: `6.25rem ${theme.container.padding}`,
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
		})

const featuresText = () =>
	grid(2)
		.populate([
			title('Win The Game With These Tricks'),
			desc(
				'Elevate your online presence and expand your reach by connecting with like-minded individuals, engaging with your audience, and growing your community faster than ever before.'
			),
		])
		.css({
			padding: `4rem ${theme.container.padding}`,
			gap: '8rem',
		})

const features = () =>
	grid(4).populate([
		feature({
			title: 'Grow Faster',
			sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
		}),
		feature({
			title: 'Build Audience',
			sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
		}),
		feature({
			title: 'Get Feedback',
			sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
		}),
		feature({
			title: 'Battle Tested',
			sub: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
		}),
	])

const feature = ({ title, sub }: { title: string; sub: string }) =>
	box([img(), txt(title), txt(sub)])

const info = () => grid(2).populate([infoTxt(), img()])

const cta = () => box([btn('Get the course now for $99 →')])

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

export { page as sofa }
