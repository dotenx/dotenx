import { Components } from '../controllers'
import { ProductItem } from './components/product-item'
import { ProductList } from './components/product-list'

export const ECOMMERCE_COMPONENTS: Components = [
	{
		title: 'E-commerce',
		items: [ProductList, ProductItem],
	},
]
