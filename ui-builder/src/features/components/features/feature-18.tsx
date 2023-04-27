// relume feature 121
import componentImage from '../../../assets/components/features/feature-18.png'
import { box, column, grid, icn, txt } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common'

export class Feature18 extends Component {
	name = 'Feature 18'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return <ComponentWrapper></ComponentWrapper>
}

const component = () =>
	cmn.ppr.el([
		cmn.halfGrid.el([box([cmn.tagline.el(), cmn.heading.el(), cmn.btnLinks.el()]), steps()]),
	])

const steps = () =>
	box([
		column([
			step('Subheading one'),
			step('Subheading two'),
			step('Subheading three'),
			step('Subheading four'),
		]).css({
			gap: '1rem',
			marginTop: '1rem',
		}),
	]).customCss('> div:last-child > div:last-child > div:nth-child(1) > div:nth-child(2)', {
		// to hide the last line
		display: 'none',
	})

const step = (title: string) =>
	grid(2)
		.populate([
			column([
				box([icn('cube').size('40px')]).css({
					flexShrink: '0',
				}),
				box([txt('')]).css({
					width: '1.5px',
					backgroundColor: 'currentcolor',
					flexGrow: '1',
				}),
			]).css({
				alignItems: 'center',
				gap: '1rem',
			}),
			cmn.smlSubheading.el(title).css({
				paddingBottom: '4rem',
			}),
		])
		.css({
			gridTemplateColumns: '1fr 7fr',
			columnGap: '2.5rem',
		})
