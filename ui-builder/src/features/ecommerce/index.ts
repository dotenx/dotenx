import { Components } from '../controllers'
import { Header } from './components/header'
import { ProductItem } from './components/product-item'
import { ProductList } from './components/product-list'
import { Sofa } from './sofa/controller'

export const ECOMMERCE_COMPONENTS: Components = [
	{
		title: 'Sofa',
		items: [Sofa],
	},
	{
		title: 'E-commerce',
		items: [Header, ProductList, ProductItem],
	},
]
