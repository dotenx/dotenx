import _ from 'lodash'
import componentImage from '../../../assets/components/navbar/navbar-3.png'
import { box } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import componentScript from '../../scripts/navbars.js?raw'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'
import { cmn } from './common/navbar'

export class Navbar3 extends Component {
	name = 'Navbar 3'
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
