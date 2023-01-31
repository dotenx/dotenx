import { Components } from '../controllers'
import { Header } from './components/header'
import { ProductItem } from './components/product-item'
import { ProductList } from './components/product-list'
import { sofaControllers } from './sofa/controller'

export const ECOMMERCE_COMPONENTS: Components = [
	{
		items: sofaControllers,
		title: 'Sofa',
	},
	{
		title: 'E-commerce',
		items: [Header, ProductList, ProductItem],
	},
]
