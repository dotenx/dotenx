import { Controller, ElementOptions } from '../../controllers/controller'
import { ControllerWrapper } from '../../controllers/helpers/controller-wrapper'
import { theme3 } from './theme'

class Navbar extends Controller {
	name = 'Theme 3 Navbar'
	image = ''
	defaultData = theme3.navbar()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		return <ControllerWrapper name={this.name}></ControllerWrapper>
	}
}

class Hero extends Controller {
	name = 'Theme 3 Hero'
	image = ''
	defaultData = theme3.hero()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		return <ControllerWrapper name={this.name}></ControllerWrapper>
	}
}

class Collections extends Controller {
	name = 'Theme 3 Collections'
	image = ''
	defaultData = theme3.collections()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		return <ControllerWrapper name={this.name}></ControllerWrapper>
	}
}

class FeaturedProduct extends Controller {
	name = 'Theme 3 Featured Product'
	image = ''
	defaultData = theme3.featuredProduct()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		return <ControllerWrapper name={this.name}></ControllerWrapper>
	}
}

class ProductList extends Controller {
	name = 'Theme 3 Product List'
	image = ''
	defaultData = theme3.productList()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		return <ControllerWrapper name={this.name}></ControllerWrapper>
	}
}

export const theme3Controllers = [Navbar, Hero, Collections, FeaturedProduct, ProductList]
