import _ from 'lodash'
import productListImg from '../../../assets/themes/theme3/product-list.png'
import { Component, OnCreateOptions } from '../../components/component'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import boughtItemDetails from './bought-item-details.js?raw'
import { theme4 } from './theme'

class BoughtItems extends Component {
	name = 'Theme 4 Bought Items'
	image = productListImg
	defaultData = theme4.boughItems()
	renderOptions = () => null
}

class BoughtItemDetails extends Component {
	name = 'Theme 4 Bought Item Details'
	image = productListImg
	defaultData = theme4.boughtItemDetails()
	renderOptions = () => null
	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(boughtItemDetails)
		const script = compiled({
			id: root.id,
			projectTag: options.projectTag,
		})
		setElement(root, (draft) => (draft.script = script))
	}
}

export const theme4Components = { BoughtItems, BoughtItemDetails }
