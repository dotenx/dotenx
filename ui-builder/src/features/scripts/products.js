/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'
	const productTag = '{{productTag}}'

	const root = document.getElementById(id)
	const list = root.querySelector('.list')
	const item = list.querySelector('.item')
	const showMore = root.querySelector('.show-more')

	const loader = document.createElement('span')
	loader.classList.add('loader')

	const size = 9
	let page = 1
	let productCount = 0
	getProducts().then(renderProducts)

	showMore.addEventListener('click', async () => {
		page += 1
		const products = await getProducts()
		renderProducts(products)
	})

	async function getProducts() {
		list.appendChild(loader)
		const filterSet = productTag
			? [
					{
						key: 'status',
						operator: '=',
						value: 'published',
					},
					{
						key: 'tags',
						operator: 'has',
						value: productTag,
					},
			  ]
			: [
					{
						key: 'status',
						operator: '=',
						value: 'published',
					},
			  ]

		const response = await fetch(
			`https://api.dotenx.com/public/database/query/select/project/${projectTag}/table/products`,
			{
				method: 'POST',
				body: JSON.stringify({
					columns: [],
					filters: {
						filterSet,
						conjunction: 'and',
					},
				}),
				headers: {
					'Content-Type': 'application/json',
					size,
					page,
				},
			}
		)
		const data = await response.json()
		const products = data.rows ?? []
		list.removeChild(loader)
		return { products, totalRows: data.totalRows }
	}

	function renderProducts({ products, totalRows }) {
		productCount += products.length
		if (productCount >= totalRows) showMore.style.display = 'none'
		products?.forEach((product) => {
			const clone = item.content.cloneNode(true)

			const image = clone.querySelector('.image')
			image.removeAttribute('x-bind:src')
			image.setAttribute('src', product.image_url)

			const name = clone.querySelector('.name')
			name.removeAttribute('x-html')
			name.textContent = product.name

			const itemLink = clone.querySelector('.item-link')
			itemLink.removeAttribute('href')
			itemLink.setAttribute('href', `/product.html?id=${product.id}`)

			const price = clone.querySelector('.price')
			price.removeAttribute('x-html')
			price.textContent = `$${product.price}`

			list.appendChild(clone)
		})
	}
})()
