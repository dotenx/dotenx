import _ from 'lodash'
import componentImage from '../../../assets/components/features/feature-1.png'
import { box, column, flex, icn, img, txt } from '../../elements/constructor'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'

// r9
export class Testimonials1 extends Component {
	name = 'Testimonials 1'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return <ComponentWrapper></ComponentWrapper>
}

const component = () =>
	cmn.ppr
		.el([
			cmn.heading.el('Customer testimonials'),
			cmn.desc.el('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
			list(),
		])
		.css({
			textAlign: 'center',
		})

const list = () =>
	column([
		flex([
			iconButton('chevron-left'),
			flex(_.times(5, item)).css({
				gap: '20px',
				overflowX: 'auto',
				scrollBehavior: 'smooth',
				borderRadius: '10px',
			}),
			iconButton('chevron-right'),
		]).css({
			alignItems: 'center',
		}),
		dots(),
	]).css({
		alignItems: 'center',
	})

const item = () =>
	column([
		img('https://files.dotenx.com/assets/Logo10-nmi1.png').css({
			width: '140px',
			height: '3.5rem',
		}),
		txt(
			'"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."'
		).css({
			fontSize: '1.25rem',
			lineHeight: '1.4',
			fontWeight: '700',
			margin: '2rem 0',
		}),
		img().css({
			marginBottom: '1rem',
			width: '3.5rem',
			height: '3.5rem',
			backgroundColor: '#eee',
			borderRadius: '999px',
		}),
		txt('Name Surname').css({
			fontWeight: '600',
		}),
		txt('Position, Company name'),
	])
		.css({
			alignItems: 'center',
			padding: '0 1.5rem',
			flexShrink: '0',
			flexBasis: 'calc(100% / 3 - 20px * 2 / 3)',
			marginBottom: '2.5rem',
		})
		.cssTablet({
			flexBasis: 'calc(100% / 2 - 20px * 1 / 2)',
			height: '400px',
		})
		.cssMobile({
			flexBasis: '100%',
			height: '350px',
		})

const iconButton = (icon: string) =>
	box([icn(icon).size('18px')]).css({
		border: '1px solid currentcolor',
		borderRadius: '999px',
		width: '3.5rem',
		height: '3.5rem',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		cursor: 'pointer',
		flexShrink: '0',
	})

const dots = () =>
	flex([
		dot().css({
			backgroundColor: '#222222',
		}),
		dot(),
		dot(),
		dot(),
		dot(),
		dot(),
	]).css({
		gap: '6px',
	})

const dot = () =>
	box([txt('')]).css({
		width: '8px',
		height: '8px',
		backgroundColor: '#22222266',
		borderRadius: '999px',
	})
