import _ from 'lodash'
import imageUrl from '../../../assets/themes/ecommerce/cart.png'
import { Component, ElementOptions, OnCreateOptions } from '../../components/component'
import { ComponentWrapper } from '../../components/helpers/component-wrapper'
import { btn, flex, template, txt } from '../../elements/constructor'
import { Element } from '../../elements/element'
import { setElement } from '../../elements/elements-store'
import { ButtonElement } from '../../elements/extensions/button'
import { TextElement } from '../../elements/extensions/text'
import cartScript from '../../scripts/cart.js?raw'
import { ButtonStyler } from '../../simple/stylers/button-styler'
import { TextStyler } from '../../simple/stylers/text-styler'
import { shared } from '../shared'

export class Cart extends Component {
	name = 'Cart'
	image = imageUrl
	defaultData = component()
	renderOptions = ({ element: wrapper }: ElementOptions) => {
		const title = wrapper.find<TextElement>(tags.title)!
		const name = wrapper.find<TextElement>(tags.name)!
		const quantity = wrapper.find<TextElement>(tags.quantity)!
		const price = wrapper.find<TextElement>(tags.price)!
		const removeBtn = wrapper.find<ButtonElement>(tags.removeBtn)!

		return (
			<ComponentWrapper name={this.name}>
				<TextStyler label="Title" element={title} />
				<TextStyler label="Name" element={name} />
				<TextStyler label="Quantity" element={quantity} />
				<TextStyler label="Price" element={price} />
				<ButtonStyler label="Remove button" element={removeBtn} />
			</ComponentWrapper>
		)
	}
	tags = ['all', 'cart']

	onCreate(root: Element, options: OnCreateOptions) {
		const compiled = _.template(cartScript)
		const script = compiled({ id: root.id, projectTag: options.projectTag })
		setElement(root, (draft) => (draft.script = script))
	}
}

const tags = {
	title: 'title',
	name: 'name',
	quantity: 'quantity',
	price: 'price',
	removeBtn: 'remove-btn',
	checkout: 'checkout',
}

const component = () =>
	shared.paper().populate([
		shared.container().populate([
			shared.title().txt('Cart').tag(tags.title),
			flex([
				template(
					flex([
						flex([
							txt('Product').class('name').tag(tags.name),
							txt('Quantity').class('quantity').tag(tags.quantity),
							txt('Price').class('price').tag(tags.price),
						]).css({
							gap: '2rem',
						}),
						button('Remove').tag(tags.removeBtn).class('remove-btn'),
					]).css({
						gap: '1rem',
						alignItems: 'center',
						justifyContent: 'space-between',
					})
				).class('cart-item'),
			])
				.css({
					flexDirection: 'column',
					gap: '1rem',
					padding: '1rem 0',
				})
				.class('cart-items'),
			shared.input('Email').class('email').css({
				marginTop: '1rem',
				maxWidth: '400px',
			}),
			button('Checkout')
				.css({
					marginTop: '1rem',
				})
				.tag(tags.checkout)
				.class('checkout'),
		]),
	])

const button = (text: string) =>
	btn(text)
		.css({
			padding: '0.5rem 1rem',
			borderRadius: '0.5rem',
			backgroundColor: '#f5f5f5',
			color: '#000',
			border: 'none',
			cursor: 'pointer',
		})
		.cssHover({
			backgroundColor: '#e5e5e5',
		})
