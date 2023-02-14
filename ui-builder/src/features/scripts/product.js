/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'

	const searchParams = new URLSearchParams(window.location.search)
	const productId = searchParams.get('id')

	const root = document.getElementById(id)
	const title = root.querySelector('.title')
	const price = root.querySelector('.price')
	const image = root.querySelector('.image')
	const description = root.querySelector('.description')
	const addToCart = root.querySelector('.add-to-cart')

	addToCart.addEventListener('click', () => {
		const cart = JSON.parse(localStorage.getItem('cart')) ?? {}
		cart[productId] = cart[productId] ? cart[productId] + 1 : 1
		localStorage.setItem('cart', JSON.stringify(cart))
	})

	getProduct().then(renderProduct)

	async function getProduct() {
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

	function renderProduct(product) {
		title.removeAttribute('x-html')
		price.removeAttribute('x-html')
		image.removeAttribute('x-bind:src')
		description.removeAttribute('x-html')

		title.textContent = product.name
		price.textContent = `$${product.price}`
		image.src = product.image_url
		description.textContent = product.description
	}
})()
