import _ from 'lodash'
import componentImage from '../../../assets/components/navbar/navbar-1.png'
import { flex } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import componentScript from '../../scripts/navbars.js?raw'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar1 extends Component {
	name = 'Navbar 1'
	image = componentImage
	defaultData = component()
	renderOptions = () => <Options />
	onCreate(root: Element) {
		const compiled = _.template(componentScript)
		const script = compiled({ id: root.id })
		setElement(root, (draft) => (draft.script = script))
	}
}

function Options() {
	return (
		<ComponentWrapper>
			<cmn.logo.Options />
			<cmn.buttons.Options />
			<cmn.linkList.Options />
		</ComponentWrapper>
	)
}

const component = () =>
	cmn.container.el([
		flex([cmn.logo.el(), menu(), cmn.menuBtn.el()]).css({
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%',
		}),
	])

const menu = () => cmn.menu.el([cmn.linkList.el(), cmn.buttons.el()])
