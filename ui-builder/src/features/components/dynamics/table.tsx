import _ from 'lodash'
import componentImage from '../../../assets/components/faq/faq-1.png'
import { box, grid, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import componentScript from '../../scripts/dynamic/table.js?raw'
import { cmn } from '../common'
import { Component } from '../component'
import { ComponentWrapper } from '../helpers/component-wrapper'

export class DynamicTable extends Component {
	name = 'Dynamic Table'
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
	return <ComponentWrapper></ComponentWrapper>
}

const component = () => cmn.ppr.el([box([head(), row(), row(), row()]).class('table')])

const head = () =>
	grid(3)
		.populate([
			txt('Name').css({
				fontWeight: 'bold',
			}),
			txt('Username').css({
				fontWeight: 'bold',
			}),
			txt('Email').css({
				fontWeight: 'bold',
			}),
		])
		.css({
			gap: '1rem',
			marginBottom: '1rem',
		})

const row = () =>
	grid(3)
		.populate([
			txt('John Doe').class('name'),
			txt('john_doe').class('username'),
			txt('john.doe@email.com').class('email'),
		])
		.css({
			gap: '1rem',
			marginBottom: '1rem',
		})
		.class('row')
