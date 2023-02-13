import { Select } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { useState } from 'react'
import { api } from '../../../api'
import collectionsImg from '../../../assets/themes/theme3/collections.png'
import featuredProductImg from '../../../assets/themes/theme3/featured-product.png'
import heroImg from '../../../assets/themes/theme3/hero.png'
import navbarImg from '../../../assets/themes/theme3/navbar.png'
import productListImg from '../../../assets/themes/theme3/product-list.png'
import { Controller, ElementOptions, OnCreateOptions } from '../../controllers/controller'
import { ControllerWrapper } from '../../controllers/helpers/controller-wrapper'
import { DndTabs } from '../../controllers/helpers/dnd-tabs'
import { OptionsWrapper } from '../../controllers/helpers/options-wrapper'
import { txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ButtonElement } from '../../elements/extensions/button'
import { ImageElement } from '../../elements/extensions/image'
import { TextElement } from '../../elements/extensions/text'
import { useTags } from '../../misc/tags-query'
import { projectTagAtom } from '../../page/top-bar'
import featuredProductScript from '../../scripts/featured-product-3.js?raw'
import productsScript from '../../scripts/products-3.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
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
	data = { productId: '' }
	renderOptions = () => {
		return (
			<FeaturedProductOptions
				initialProductId={this.data.productId}
				changeProductId={(value) => (this.data.productId = value)}
			/>
		)
	}
	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(featuredProductScript)
		const script = compiled({
			id: root.id,
			projectTag: options.projectTag,
			productId: this.data.productId,
		})
		setElement(root, (draft) => (draft.script = script))
	}
}

function FeaturedProductOptions({
	initialProductId,
	changeProductId,
}: {
	initialProductId: string
	changeProductId: (productId: string) => void
}) {
	const wrapper = useSelectedElement<BoxElement>()!
	const title = wrapper.find<TextElement>(theme3.tags.featuredProduct.title)!
	const button = wrapper.find<ButtonElement>(theme3.tags.featuredProduct.button)!
	const image = wrapper.find<ImageElement>(theme3.tags.featuredProduct.image)!
	const price = wrapper.find<TextElement>(theme3.tags.featuredProduct.price)!

	const [productId, setProductId] = useState(initialProductId)
	const projectTag = useAtomValue(projectTagAtom)

	const productsQuery = useQuery(['products', projectTag], () =>
		api.post(`/public/database/query/select/project/${projectTag}/table/products`, {
			columns: [],
			filters: {
				filterSet: [
					{
						key: 'status',
						operator: '=',
						value: 'published',
					},
				],
				conjunction: 'and',
			},
		})
	)
	const products: {
		name: string
		id: string
		description: string
		price: string
		image_url: string
	}[] = productsQuery.data?.data.rows ?? []
	const productOptions = products.map((product) => ({
		label: product.name,
		value: product.id,
	}))

	return (
		<ControllerWrapper name="Theme 3 Featured Product">
			<Select
				size="xs"
				label="Product"
				data={productOptions}
				value={productId}
				onChange={(value) => {
					if (!value) return
					const compiled = _.template(featuredProductScript)
					const script = compiled({
						id: wrapper.id,
						projectTag,
						productId: value,
					})
					setElement(wrapper, (draft) => (draft.script = script))
					changeProductId(value)
					setProductId(value)
					const selected = products.find((product) => product.id === value)
					if (!selected) return
					setElement(title, (draft) => draft.txt(selected.name))
					setElement(price, (draft) => draft.txt(selected.price))
					setElement(image, (draft) => draft.src(selected.image_url))
				}}
			/>
			<TextStyler element={title} label="Title" />
			<ButtonStyler element={button} label="Button" />
			<ImageStyler element={image} />
			<TextStyler element={price} label="Price" />
		</ControllerWrapper>
	)
}

class ProductList extends Controller {
	name = 'Theme 3 Product List'
	image = productListImg
	defaultData = theme3.productList()
	data: { productTags: string[] } = { productTags: [] }
	renderOptions = () => (
		<ProductListOptions
			changeControllerTags={(value) => (this.data.productTags = value)}
			initialProductTags={this.data.productTags}
		/>
	)
	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(productsScript)
		const script = compiled({
			id: root.id,
			projectTag: options.projectTag,
			productTags: JSON.stringify(this.data.productTags),
		})
		setElement(root, (draft) => (draft.script = script))
	}
}

function ProductListOptions({
	initialProductTags,
	changeControllerTags,
}: {
	initialProductTags: string[]
	changeControllerTags: (productTag: string[]) => void
}) {
	const wrapper = useSelectedElement<BoxElement>()!
	const tabs = wrapper.find<BoxElement>(theme3.tags.productList.tabs)!
	const [productTags, setProductTags] = useState(initialProductTags)
	const projectTag = useAtomValue(projectTagAtom)
	const tags = useTags()

	return (
		<ControllerWrapper name="Theme 3 Product List">
			<DndTabs
				containerElement={tabs}
				insertElement={() => txt('Tab').css({ padding: '10px 0' })}
				renderItemOptions={(item, index) => {
					return (
						<OptionsWrapper>
							<TextStyler element={item as TextElement} label="Name" />
							<Select
								data={tags}
								size="xs"
								label="Tag"
								value={productTags[index]}
								onChange={(value) => {
									if (!value) return
									const newTags = [...productTags]
									newTags[index] = value
									const compiled = _.template(productsScript)
									const script = compiled({
										id: wrapper.id,
										projectTag,
										productTags: JSON.stringify(newTags),
									})
									setElement(wrapper, (draft) => (draft.script = script))
									changeControllerTags(newTags)
									setProductTags(newTags)
								}}
							/>
						</OptionsWrapper>
					)
				}}
			/>
		</ControllerWrapper>
	)
}

export const theme3Controllers = { Navbar, Hero, Collections, FeaturedProduct, ProductList }
