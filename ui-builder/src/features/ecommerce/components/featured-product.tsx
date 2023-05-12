import { Select } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { useState } from 'react'
import { api } from '../../../api'
import imageUrl from '../../../assets/themes/ecommerce/product-item.png'
import { Component, OnCreateOptions } from '../../components/component'
import { ComponentWrapper } from '../../components/helpers/component-wrapper'
import { btn, flex, img, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ButtonElement } from '../../elements/extensions/button'
import { ImageElement } from '../../elements/extensions/image'
import { TextElement } from '../../elements/extensions/text'
import { projectTagAtom } from '../../page/top-bar'
import featuredProductScript from '../../scripts/featured-product.js?raw'
import { useSelectedElement } from '../../selection/use-selected-component'
import { BoxStyler } from '../../simple/stylers/box-styler'
import { ButtonStyler } from '../../simple/stylers/button-styler'
import { ImageStyler } from '../../simple/stylers/image-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { shared } from '../shared'

export class FeaturedProduct extends Component {
	name = 'Featured product'
	image = imageUrl
	defaultData = component()
	renderOptions = () => (
		<FeaturedProductOptions
			initialProductId={this.data.productId}
			changeComponentId={(newId) => (this.data.productId = newId)}
		/>
	)
	data = { productId: '' }

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
	changeComponentId,
}: {
	initialProductId: string
	changeComponentId: (newId: string) => void
}) {
	const root = useSelectedElement<BoxElement>()!
	const title = root.find<TextElement>(tags.title)!
	const description = root.find<TextElement>(tags.description)!
	const price = root.find<TextElement>(tags.price)!
	const image = root.find<ImageElement>(tags.image)!
	const addToCart = root.find<ButtonElement>(tags.addToCart)!

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
	const productOptions = products.map((product) => ({ label: product.name, value: product.id }))

	return (
		<ComponentWrapper name="Featured product">
			<Select
				size="xs"
				label="Product"
				data={productOptions}
				value={productId}
				onChange={(value) => {
					if (!value) return
					const compiled = _.template(featuredProductScript)
					const script = compiled({
						id: root.id,
						projectTag,
						productId: value,
					})
					setElement(root, (draft) => (draft.script = script))
					changeComponentId(value)
					setProductId(value)
					const selected = products.find((product) => product.id === value)
					if (!selected) return
					setElement(title, (draft) => draft.txt(selected.name))
					setElement(description, (draft) => draft.txt(selected.description))
					setElement(price, (draft) => draft.txt(selected.price))
					setElement(image, (draft) => draft.src(selected.image_url))
				}}
			/>
			<TextStyler label="Title" element={title} />
			<BoxStyler label="Wrapper" element={root} />
			<TextStyler label="Description" element={description} />
			<TextStyler label="Price" element={price} />
			<ImageStyler element={image} />
			<ButtonStyler label="Add to cart" element={addToCart} />
		</ComponentWrapper>
	)
}

const tags = {
	title: 'title',
	price: 'price',
	description: 'description',
	image: 'image',
	addToCart: 'addToCart',
}

const component = () => {
	const description = txt('Description')
		.css({ fontSize: '0.875rem', marginTop: '0.5rem' })
		.class('description')
		.tag(tags.description)
	const image = img()
		.css({
			height: '500px',
			width: '100%',
			backgroundColor: '#f5f5f5',
			marginTop: '30px',
			borderRadius: '0.5rem',
		})
		.class('image')
		.tag(tags.image)
	const title = shared
		.title()
		.txt('Product')
		.tag(tags.title)
		.css({ marginBottom: '0px' })
		.class('title')
	const price = txt('$0.0').css({ fontSize: '1.25rem' }).class('price').tag(tags.price)
	const addToCart = btn('Add to cart')
		.tag(tags.addToCart)
		.css({
			backgroundColor: '#f5f5f5',
			border: 'none',
			borderRadius: '0.5rem',
			padding: '0.5rem 1rem',
			marginLeft: '1rem',
		})
		.cssHover({ backgroundColor: '#e5e5e5' })
		.class('add-to-cart')
	const group = shared
		.group()
		.populate([title, flex([price, addToCart]).css({ alignItems: 'center' })])
	const container = shared.container().populate([group, image, description])
	const root = shared.paper().populate([container])
	return root
}
