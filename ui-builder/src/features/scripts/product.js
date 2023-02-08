/* eslint-disable no-undef */

;(async () => {
	const searchParams = new URLSearchParams(window.location.search)
	const productId = searchParams.get('id')

	const id = '{{id}}'
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
		const response = await fetch(`https://dummyjson.com/products/${productId}`)
		const product = await response.json()
		return product
	}

	function renderProduct(product) {
		title.removeAttribute('x-html')
		price.removeAttribute('x-html')
		image.removeAttribute('x-bind:src')
		description.removeAttribute('x-html')

		title.textContent = product.title
		price.textContent = `$${product.price}`
		image.src = product.images[0]
		description.textContent = product.description
	}
})()
