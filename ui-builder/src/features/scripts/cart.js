/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'

	const root = document.getElementById(id)
	const cartItems = root.querySelector('.cart-items')
	const cartItem = document.querySelector('.cart-item')
	const checkoutBtn = root.querySelector('.checkout')
	const emailInput = root.querySelector('.email > input')

	const loader = document.createElement('div')
	loader.innerHTML = '<span class="loader"></span>'
	loader.style.display = 'flex'
	loader.style.justifyContent = 'center'
	loader.style.alignItems = 'center'
	loader.style.padding = '1rem'

	const cart = JSON.parse(localStorage.getItem('cart')) ?? {}
	const items = Object.entries(cart)

	checkoutBtn.addEventListener('click', async () => {
		const bag = items.reduce(
			(bag, [, { count, priceId }]) => ({ ...bag, [priceId]: count }),
			{}
		)
		const pipelineEndpoint = await getPaymentEndpoint({ projectTag })
		const result = await startPayment({
			pipelineEndpoint,
			payload: {
				interactionRunTime: {
					'stripe-payment-flow': {
						inputs: {
							email: emailInput.value,
							success_url: `https://${window.location.hostname}/success.html`,
							cancel_url: `https://${window.location.hostname}/cancel.html`,
							bag,
						},
					},
				},
			},
		})
		window.location.href = result.return_value.result.payment_url
	})

	items.forEach(async ([id, { count }]) => {
		root.style.display = 'none'
		root.parentNode.appendChild(loader)
		const product = await getProduct(id)
		root.style.display = 'block'
		root.parentNode.removeChild(loader)

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
		return products.rows?.[0]
	}

	async function getPaymentEndpoint({ projectTag }) {
		const resp = await fetch(
			`https://api.dotenx.com/public/ecommerce/project/${projectTag}/payment/link/stripe`
		)
		const body = await resp.json()
		return body.endpoint
	}

	async function startPayment({ pipelineEndpoint, payload }) {
		const resp = await fetch(
			`https://api.dotenx.com/public/execution/ep/${pipelineEndpoint}/start`,
			{
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					'Content-Type': 'application/json',
				},
			}
		)
		const body = await resp.json()
		return body
	}
})()
