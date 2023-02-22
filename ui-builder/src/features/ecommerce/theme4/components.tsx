import productListImg from '../../../assets/themes/theme3/product-list.png'
import { Component } from '../../components/component'
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
}

export const theme4Components = { BoughtItems, BoughtItemDetails }
