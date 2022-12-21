import { TbPuzzle } from 'react-icons/tb'
import { Plugin } from '../../plugins/api'
import { Element } from '../element'

export class PluginElement extends Element {
	name = 'Plugin'
	icon = (<TbPuzzle />)
	data: { plugin?: Plugin } = {}

	static create(plugin: Plugin) {
		const element = new PluginElement()
		element.data.plugin = plugin
		return element
	}

	render() {
		if (!this.data.plugin) return null
		return <div dangerouslySetInnerHTML={{ __html: this.data.plugin.html }} />
	}

	renderOptions() {
		return <div></div>
	}
}
