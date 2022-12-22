import { TbPuzzle } from 'react-icons/tb'
import { Extension } from '../../extensions/api'
import { Element } from '../element'

export class ExtensionElement extends Element {
	name = 'Extension'
	icon = (<TbPuzzle />)
	data: { extension?: Extension } = {}

	static create(extension: Extension) {
		const element = new ExtensionElement()
		element.data.extension = extension
		return element
	}

	render() {
		if (!this.data.extension) return null
		return <div dangerouslySetInnerHTML={{ __html: this.data.extension.html }} />
	}

	renderOptions() {
		return <div></div>
	}
}
