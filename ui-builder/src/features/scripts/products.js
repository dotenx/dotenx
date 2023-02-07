/* eslint-disable no-undef */

document.addEventListener('DOMContentLoaded', async () => {
	const id = '{{id}}'
	const list = document.getElementById(id)
	const item = list.querySelector('.item')

	const response = await fetch('https://dummyjson.com/products')
	const data = await response.json()
	const products = data.products

	products.forEach((product) => {
		const clone = item.content.cloneNode(true)

		const image = clone.querySelector('.image')
		image.removeAttribute('x-bind:src')
		image.setAttribute('src', product.images[0])

		const name = clone.querySelector('.name')
		name.removeAttribute('x-html')
		name.textContent = product.title

		const price = clone.querySelector('.price')
		price.removeAttribute('x-html')
		price.textContent = product.price

		list.appendChild(clone)
	})
})
