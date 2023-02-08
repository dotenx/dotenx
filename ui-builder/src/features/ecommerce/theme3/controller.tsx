import collectionsImg from '../../../assets/themes/theme3/collections.png'
import featuredProductImg from '../../../assets/themes/theme3/featured-product.png'
import heroImg from '../../../assets/themes/theme3/hero.png'
import navbarImg from '../../../assets/themes/theme3/navbar.png'
import productListImg from '../../../assets/themes/theme3/product-list.png'
import { Controller, ElementOptions } from '../../controllers/controller'
import { ControllerWrapper } from '../../controllers/helpers/controller-wrapper'
import { theme3 } from './theme'

class Navbar extends Controller {
	name = 'Theme 3 Navbar'
	image = navbarImg
	defaultData = theme3.navbar()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		return <ControllerWrapper name={this.name}></ControllerWrapper>
	}
}

class Hero extends Controller {
	name = 'Theme 3 Hero'
	image = heroImg
	defaultData = theme3.hero()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		return <ControllerWrapper name={this.name}></ControllerWrapper>
	}
}

class Collections extends Controller {
	name = 'Theme 3 Collections'
	image = collectionsImg
	defaultData = theme3.collections()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		return <ControllerWrapper name={this.name}></ControllerWrapper>
	}
}

class FeaturedProduct extends Controller {
	name = 'Theme 3 Featured Product'
	image = featuredProductImg
	defaultData = theme3.featuredProduct()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		return <ControllerWrapper name={this.name}></ControllerWrapper>
	}
}

class ProductList extends Controller {
	name = 'Theme 3 Product List'
	image = productListImg
	defaultData = theme3.productList()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		return <ControllerWrapper name={this.name}></ControllerWrapper>
	}
}

export const theme3Controllers = [Navbar, Hero, Collections, FeaturedProduct, ProductList]
