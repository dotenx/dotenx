/* eslint-disable no-undef */

const id = '{{id}}'
const root = document.getElementById(id)
const list = root.querySelector('.list')
const item = list.querySelector('.item')
const showMore = root.querySelector('.show-more')

const limit = 9
let skip = 0

getProducts().then(renderProducts)

showMore.addEventListener('click', async () => {
	skip += limit
	const products = await getProducts(skip)
	renderProducts(products)
})

async function getProducts(skip = 0) {
	const url = `https://dummyjson.com/products?skip=${skip}&limit=${limit}`

	const response = await fetch(url)
	const data = await response.json()
	const products = data.products
	return products
}

function renderProducts(products) {
	products.forEach((product) => {
		const clone = item.content.cloneNode(true)

		const image = clone.querySelector('.image')
		image.removeAttribute('x-bind:src')
		image.setAttribute('src', product.images[0])

		const name = clone.querySelector('.name')
		name.removeAttribute('x-html')
		name.textContent = product.title

		const itemLink = clone.querySelector('.item-link')
		itemLink.removeAttribute('href')
		itemLink.setAttribute('href', `/product?id=${product.id}`)

		const price = clone.querySelector('.price')
		price.removeAttribute('x-html')
		price.textContent = `$${product.price}`

		list.appendChild(clone)
	})
}
