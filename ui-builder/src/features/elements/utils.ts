import _ from 'lodash'
import { Expression } from '../states/expression'
import { LinkElement } from './extensions/link'
import { TextElement } from './extensions/text'

export function navLink() {
	const link = new LinkElement()
	const text = new TextElement()
	text.data.text = Expression.fromString('Nav Link')
	link.children = [text]
	_.set(link, 'style.desktop.default.minHeight', 'auto')
	_.set(link, 'style.desktop.default.marginRight', '30px')
	_.set(link, 'style.tablet.default.marginRight', '30px')
	return link
}
