/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'
	const productTags = JSON.parse('{{productTags}}')

	let productTag = productTags[0]

	const root = document.getElementById(id)
	const list = root.querySelector('.list')
	const item = list.querySelector('.item')
	const showMore = root.querySelector('.show-more')
	const tabs = root.querySelector('.tabs')

	;[...tabs.children].forEach((tab, index) => {
		tab.addEventListener('click', () => {
			// remove border style from all tabs
			;[...tabs.children].forEach((tab) => {
				tab.style.borderBottom = 'none'
			})
			// add border style to current tab
			tab.style.borderBottom = '4px solid #00A3FF'
			// get product tag from current tab
			productTag = productTags[index]
			// remove all products from list
			list.innerHTML = ''
			// reset page and product count
			page = 1
			productCount = 0
			// get products and render them
			getProducts(productTag).then(renderProducts)
		})
	})

	const size = 9
	let page = 1
	let productCount = 0
	getProducts(productTag).then(renderProducts)

	showMore.addEventListener('click', async () => {
		page += 1
		const products = await getProducts(productTag)
		renderProducts(products)
	})

	async function getProducts(productTag) {
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
		return { products, totalRows: data.totalRows }
	}

	function renderProducts({ products, totalRows }) {
		productCount += products.length
		if (productCount >= totalRows) showMore.style.display = 'none'
		products?.forEach((product) => {
			const clone = item.content.cloneNode(true)

			const image = clone.querySelector('.image')
			image.removeAttribute('x-style')
			image.style.backgroundImage = `url(${product.image_url})`

			const name = clone.querySelector('.name')
			name.removeAttribute('x-html')
			name.textContent = product.name

			const price = clone.querySelector('.price')
			price.removeAttribute('x-html')
			price.textContent = `$${product.price}`

			const addToCart = clone.querySelector('.add-to-cart')
			addToCart.addEventListener('click', () => {
				const cart = JSON.parse(localStorage.getItem('cart')) ?? {}
				cart[product.id] = cart[product.id] ? cart[product.id] + 1 : 1
				localStorage.setItem('cart', JSON.stringify(cart))
			})

			list.appendChild(clone)
		})
	}
})()
