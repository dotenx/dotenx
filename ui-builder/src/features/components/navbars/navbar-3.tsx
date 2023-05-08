import componentImage from '../../../assets/components/faq/faq-1.png'
import { flex } from '../../elements/constructor'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar3 extends Component {
	name = 'Navbar 3'
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
			flex([
				cmn.linkItem.el('Link One'),
				cmn.linkItem.el('Link Two'),
				cmn.linkMenu.el('Link Three', [
					cmn.linkSubmenu.el(
						['Link Four', 'Link Five', 'Link Six'].map(cmn.submenuLink.el)
					),
				]),
			]),
			cmn.logo.el().css({
				justifySelf: 'center',
			}),
			cmn.fillBtn.el().css({
				justifySelf: 'end',
			}),
		])
		.css({
			display: 'grid',
			gridTemplateColumns: '1fr max-content 1fr',
			alignItems: 'center',
		})
