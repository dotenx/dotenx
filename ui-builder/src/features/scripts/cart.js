/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'

	const root = document.getElementById(id)
	const cartItems = root.querySelector('.cart-items')
	const cartItem = document.querySelector('.cart-item')

	const cart = JSON.parse(localStorage.getItem('cart')) ?? {}
	const items = Object.entries(cart)

	items.forEach(async ([id, count]) => {
		const product = await getProduct(id)

		const clone = cartItem.content.cloneNode(true)
		const name = clone.querySelector('.name')
		const quantity = clone.querySelector('.quantity')
		const price = clone.querySelector('.price')
		const removeBtn = clone.querySelector('.remove-btn')

		name.removeAttribute('x-html')
		name.textContent = product.name

		quantity.removeAttribute('x-html')
		quantity.textContent = `${count}x`

		price.removeAttribute('x-html')
		price.textContent = `$${count * product.price}`

		removeBtn.addEventListener('click', () => {
			delete cart[id]
			localStorage.setItem('cart', JSON.stringify(cart))
			location.reload()
		})

		cartItems.appendChild(clone)
	})

	async function getProduct(productId) {
		const response = await fetch(
			`https://api.dotenx.com/public/database/query/select/project/${projectTag}/table/products`,
			{
				method: 'POST',
				body: JSON.stringify({
					columns: [],
					filters: {
						filterSet: [
							{
								key: 'status',
								operator: '=',
								value: 'published',
							},
							{
								key: 'id',
								operator: '=',
								value: productId,
							},
						],
						conjunction: 'and',
					},
				}),
			}
		)
		const products = await response.json()
		return products.rows[0]
	}
})()
