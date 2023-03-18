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

	const loader = document.createElement('div')
	loader.innerHTML = '<span class="loader"></span>'
	loader.style.display = 'flex'
	loader.style.justifyContent = 'center'
	loader.style.alignItems = 'center'
	loader.style.padding = '1rem'

	getProduct().then(renderProduct)

	async function getProduct() {
		root.style.display = 'none'
		root.parentElement.appendChild(loader)

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
		root.style.display = 'block'
		root.parentElement.removeChild(loader)
		return products.rows?.[0]
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

		addToCart.addEventListener('click', () => {
			const cart = JSON.parse(localStorage.getItem('cart')) ?? {}
			cart[productId] = cart[productId]
				? { priceId: product.stripe_price_id, count: cart[productId].count + 1 }
				: { priceId: product.stripe_price_id, count: 1 }
			localStorage.setItem('cart', JSON.stringify(cart))
		})
	}
})()
