import componentImage from '../../../assets/components/navbar/navbar-3.png'
import { box } from '../../elements/constructor'
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
	return (
		<ComponentWrapper>
			<cmn.logo.Options />
			<cmn.fillBtn.Options />
			<cmn.linkList.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	cmn.container.el([
		box([
			cmn.menuBtn.el(),
			menu(),
			cmn.logo.el().css({
				justifySelf: 'center',
			}),
			cmn.fillBtn.el().css({
				justifySelf: 'end',
			}),
		]).css({
			display: 'grid',
			gridTemplateColumns: '1fr max-content 1fr',
			alignItems: 'center',
			width: '100%',
		}),
	])

const menu = () => cmn.menu.el([cmn.linkList.el()])
