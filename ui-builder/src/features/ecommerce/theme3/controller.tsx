import collectionsImg from '../../../assets/themes/theme3/collections.png'
import featuredProductImg from '../../../assets/themes/theme3/featured-product.png'
import heroImg from '../../../assets/themes/theme3/hero.png'
import navbarImg from '../../../assets/themes/theme3/navbar.png'
import productListImg from '../../../assets/themes/theme3/product-list.png'
import { Controller, ElementOptions } from '../../controllers/controller'
import { ControllerWrapper } from '../../controllers/helpers/controller-wrapper'
import { DndTabs } from '../../controllers/helpers/dnd-tabs'
import { OptionsWrapper } from '../../controllers/helpers/options-wrapper'
import { txt } from '../../elements/constructor'
import { BoxElement } from '../../elements/extensions/box'
import { ButtonElement } from '../../elements/extensions/button'
import { ImageElement } from '../../elements/extensions/image'
import { TextElement } from '../../elements/extensions/text'
import { ButtonStyler } from '../../simple/stylers/button-styler'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { theme3 } from './theme'

class Navbar extends Controller {
	name = 'Theme 3 Navbar'
	image = navbarImg
	defaultData = theme3.navbar()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const text = wrapper.find<TextElement>(theme3.tags.navbar.text)!
		const signIn = wrapper.find<ButtonElement>(theme3.tags.navbar.signIn)!
		const signUp = wrapper.find<ButtonElement>(theme3.tags.navbar.signUp)!
		const links = wrapper.find<BoxElement>(theme3.tags.navbar.links)!

		return (
			<ControllerWrapper name={this.name}>
				<TextStyler element={text} label="Text" />
				<ButtonStyler element={signIn} label="Sign in" />
				<ButtonStyler element={signUp} label="Sign up" />
				<DndTabs
					containerElement={links}
					insertElement={() => txt('Link')}
					renderItemOptions={(item) => (
						<TextStyler element={item as TextElement} label="Text" />
					)}
				/>
			</ControllerWrapper>
		)
	}
}

class Hero extends Controller {
	name = 'Theme 3 Hero'
	image = heroImg
	defaultData = theme3.hero()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const title = wrapper.find<TextElement>(theme3.tags.hero.title)!
		const subtitle = wrapper.find<TextElement>(theme3.tags.hero.subtitle)!
		const button = wrapper.find<ButtonElement>(theme3.tags.hero.button)!
		const image = wrapper.find<ImageElement>(theme3.tags.hero.image)!

		return (
			<ControllerWrapper name={this.name}>
				<TextStyler element={title} label="Title" />
				<TextStyler element={subtitle} label="Subtitle" />
				<ButtonStyler element={button} label="Button" />
				<ImageStyler element={image} />
			</ControllerWrapper>
		)
	}
}

class Collections extends Controller {
	name = 'Theme 3 Collections'
	image = collectionsImg
	defaultData = theme3.collections()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const list = wrapper.find<BoxElement>(theme3.tags.collections.list)!

		return (
			<ControllerWrapper name={this.name}>
				<DndTabs
					containerElement={list}
					insertElement={() =>
						theme3.collection({ title: 'Collection', image: '', color: '#000' })
					}
					renderItemOptions={(item) => {
						const title = item.find<TextElement>(theme3.tags.collections.item.title)!
						return <TextStyler element={title} label="Title" />
					}}
				/>
			</ControllerWrapper>
		)
	}
}

class FeaturedProduct extends Controller {
	name = 'Theme 3 Featured Product'
	image = featuredProductImg
	defaultData = theme3.featuredProduct()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const title = wrapper.find<TextElement>(theme3.tags.featuredProduct.title)!
		const button = wrapper.find<ButtonElement>(theme3.tags.featuredProduct.button)!
		const image = wrapper.find<ImageElement>(theme3.tags.featuredProduct.image)!
		const price = wrapper.find<TextElement>(theme3.tags.featuredProduct.price)!

		return (
			<ControllerWrapper name={this.name}>
				<TextStyler element={title} label="Title" />
				<ButtonStyler element={button} label="Button" />
				<ImageStyler element={image} />
				<TextStyler element={price} label="Price" />
			</ControllerWrapper>
		)
	}
}

class ProductList extends Controller {
	name = 'Theme 3 Product List'
	image = productListImg
	defaultData = theme3.productList()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const list = wrapper.find<BoxElement>(theme3.tags.productList.list)!

		return (
			<ControllerWrapper name={this.name}>
				<DndTabs
					containerElement={list}
					insertElement={() =>
						theme3.productItem({ title: 'Product', image: '', price: '$0.00' })
					}
					renderItemOptions={(item) => {
						const title = item.find<TextElement>(theme3.tags.productList.item.title)!
						const price = item.find<TextElement>(theme3.tags.productList.item.price)!

						return (
							<OptionsWrapper>
								<TextStyler element={title} label="Title" />
								<TextStyler element={price} label="Price" />
							</OptionsWrapper>
						)
					}}
				/>
			</ControllerWrapper>
		)
	}
}

export const theme3Controllers = [Navbar, Hero, Collections, FeaturedProduct, ProductList]
