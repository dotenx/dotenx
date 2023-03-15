/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'

	const root = document.getElementById(id)
	const list = root.querySelector('.list')
	const item = root.querySelector('.item')

	getProducts().then(renderProducts)

	async function getProducts() {
		const token = document.cookie
			.split('; ')
			.find((row) => row.startsWith('token='))
			?.split('=')[1]
		const response = await fetch(
			`https://api.dotenx.com/ecommerce/project/${projectTag}/product`,
			{ headers: { Authorization: `Bearer ${token}` } }
		)
		const data = await response.json()
		const products = data.rows ?? []
		return { products }
	}

	function renderProducts({ products }) {
		products?.forEach((product) => {
			const clone = item.content.cloneNode(true)

			const image = clone.querySelector('.image')
			image.removeAttribute('x-bind:src')
			image.setAttribute('src', product.image_url)

			const link = clone.querySelector('.link')
			link.removeAttribute('x-bind:href')
			link.href = `/bought-product.html?id=${product.id}`

			const name = clone.querySelector('.name')
			name.removeAttribute('x-html')
			name.textContent = product.name

			list.appendChild(clone)
		})
	}
})()
