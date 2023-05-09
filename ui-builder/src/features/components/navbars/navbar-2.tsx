import componentImage from '../../../assets/components/navbar/navbar-2.png'
import { box, flex } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar2 extends Component {
	name = 'Navbar 2'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return <ComponentWrapper></ComponentWrapper>
}

const component = () =>
	cmn.container.el([
		box([
			cmn.logo.el(),
			menu(),
			cmn.fillBtn
				.el()
				.css({
					justifySelf: 'end',
				})
				.cssTablet({
					display: 'none',
				}),
			flex([cmn.fillBtn.el(), cmn.menuBtn.el()])
				.css({
					gap: '1.5rem',
					display: 'none',
				})
				.cssTablet({
					display: 'flex',
				}),
		])
			.css({
				display: 'grid',
				gridTemplateColumns: '1fr 3fr 1fr',
				alignItems: 'center',
				width: '100%',
			})
			.cssTablet({
				display: 'flex',
				justifyContent: 'space-between',
			}),
	])

const menu = () =>
	cmn.menu.el([cmn.linkList.el()]).css({
		justifySelf: 'center',
	})
