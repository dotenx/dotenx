import componentImage from '../../../assets/components/faq/faq-1.png'
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
	cmn.container
		.el([
			cmn.logo.el(),
			cmn.linkList.el().css({
				justifySelf: 'center',
			}),
			cmn.fillBtn.el().css({
				justifySelf: 'end',
			}),
		])
		.css({
			display: 'grid',
			gridTemplateColumns: '1fr 3fr 1fr',
			alignItems: 'center',
		})
