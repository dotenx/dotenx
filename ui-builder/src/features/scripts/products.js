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
		clone.querySelector('.image').src = product.images[0]
		clone.querySelector('.name').textContent = product.title
		clone.querySelector('.price').textContent = product.price
		list.appendChild(clone)
	})
})
