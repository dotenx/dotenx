/* eslint-disable no-undef */

const id = '{{id}}'
const root = document.getElementById(id)
const title = root.querySelector('.title')
const price = root.querySelector('.price')
const image = root.querySelector('.image')
const description = root.querySelector('.description')

getProduct().then(renderProduct)

async function getProduct() {
	const searchParams = new URLSearchParams(window.location.search)
	const id = searchParams.get('id')
	const response = await fetch(`https://dummyjson.com/products/${id}`)
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
