import componentImage from '../../../assets/components/faq/faq-1.png'
import { flex } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar1 extends Component {
	name = 'Navbar 1'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
}

function Options() {
	return <ComponentWrapper></ComponentWrapper>
}

const component = () =>
	cmn.container
		.el([
			cmn.logo.el(),
			flex([cmn.linkList.el(), cmn.buttons.el()]).css({
				gap: '1.5rem',
				alignItems: 'center',
			}),
		])
		.css({
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
		})
