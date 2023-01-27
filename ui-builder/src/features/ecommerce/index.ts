import { Components } from '../controllers'
import { Header } from './components/header'
import { ProductItem } from './components/product-item'
import { ProductList } from './components/product-list'

export const ECOMMERCE_COMPONENTS: Components = [
	{
		title: 'E-commerce',
		items: [Header, ProductList, ProductItem],
	},
]
