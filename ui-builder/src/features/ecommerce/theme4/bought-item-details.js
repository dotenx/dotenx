/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'

	const searchParams = new URLSearchParams(window.location.search)
	const boughtProductId = searchParams.get('id')

	const root = document.getElementById(id)
	const template = root.querySelector('template')

	const method = 'GET'
	const url = `https://api.dotenx.com/ecommerce/project/${projectTag}/product/${boughtProductId}`

	const response = await fetch(url, { method })
	const data = await response.json()

	const clone = template.content.cloneNode(true)

	const name = clone.querySelector('.name')
	const price = clone.querySelector('.price')
	const content = clone.querySelector('.content')
	const image = clone.querySelector('.image')

	name.removeAttribute('x-html')
	price.removeAttribute('x-html')
	content.removeAttribute('x-html')
	image.removeAttribute('x-bind:src')

	name.innerText = data.name
	price.innerText = `${data.price} ${data.currency}`
	content.innerHTML = data.description
	image.src = data.image_url

	root.appendChild(clone)
})()
