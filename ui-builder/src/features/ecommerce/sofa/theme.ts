import { box, btn, grid, img, txt } from '../../elements/constructor'

const theme = {
	fontFamily: 'Inter',
	colors: {
		text: '#000000',
		background: '#FFFFFF',
		light: '#EEEEEE',
		primary: '#F4A261',
		primaryLight: '#E9C46A',
		primaryDark: '#E76F51',
		secondary: '#2A9D8F',
		secondaryDark: '#264653',
	},
}

const page = () =>
	box()
		.populate([navbar(), hero(), logos(), featuresText(), features(), info(), info(), cta()])
		.css({
			fontFamily: theme.fontFamily,
		})

const navbar = () =>
	box()
		.populate([
			box(),
			box()
				.populate([
					txt('Category 1').unstyled(),
					txt('Category 2').unstyled(),
					txt('Case studies').unstyled(),
				])
				.css({
					display: 'flex',
					gap: '2.5rem',
				}),
			btn('Sign up').unstyled().css({
				border: '1px solid',
				borderRadius: '9999px',
				padding: '1rem 3.5rem',
				boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
			}),
		])
		.css({
			fontSize: '1.25rem',
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			padding: '1.75rem',
		})

const hero = () =>
	box().populate([
		infoTxt(),
		grid(2).populate([
			stat({ title: '200 Users', sub: 'Every week' }),
			stat({ title: '300 Subs', sub: 'Winning together' }),
			stat({ title: '700K+', sub: 'Daily views' }),
			stat({ title: '90+', sub: 'Sessions' }),
		]),
	])

const infoTxt = () =>
	box().populate([
		txt('BUILD YOUR COMMUNITY FASTER THAN EVER'),
		txt(
			'Elevate your online presence and expand your reach by connecting with like-minded individuals, engaging with your audience, and growing your community faster than ever before.'
		),
		btn('Join now!'),
	])

const stat = ({ title, sub }: { title: string; sub: string }) =>
	box().populate([box(), txt(title), txt(sub)])

const logos = () => grid(5).populate([img(), img(), img(), img(), img()])

const featuresText = () =>
	grid(2).populate([
		txt('Win The Game With These Tricks'),
		txt(
			'Elevate your online presence and expand your reach by connecting with like-minded individuals, engaging with your audience, and growing your community faster than ever before.'
		),
	])

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
	box().populate([img(), txt(title), txt(sub)])

const info = () => grid(2).populate([infoTxt(), img()])

const cta = () => box().populate([btn('Get the course now for $99 →')])

export { page as sofa }
