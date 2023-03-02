/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'

	const searchParams = new URLSearchParams(window.location.search)
	const boughtProductId = searchParams.get('id')

	const root = document.getElementById(id)
	const template = root.querySelector('.template')
	const attachmentTemplate = template.content.querySelector('.attachment')

	const method = 'GET'
	const url = `https://api.dotenx.com/ecommerce/project/${projectTag}/product/${boughtProductId}`
	const token = document.cookie
		.split('; ')
		.find((row) => row.startsWith('token='))
		?.split('=')[1]

	const response = await fetch(url, {
		method,
		headers: { Authorization: `Bearer ${token}` },
	})
	const data = await response.json()

	const clone = template.content.cloneNode(true)

	const name = clone.querySelector('.name')
	const price = clone.querySelector('.price')
	const content = clone.querySelector('.content')
	const image = clone.querySelector('.image')
	const attachments = clone.querySelector('.attachments')
	const starList = clone.querySelector('.stars')
	const submit = clone.querySelector('.submit')
	const feedback = clone.querySelector('.feedback')

	let rating = 0
	const stars = [...starList.children]
	stars.forEach((star, index) => {
		star.addEventListener('mouseover', () => {
			rating = index + 1
			stars.forEach((star, i) => {
				if (i <= index) star.style.color = '#FBBF24'
				else star.style.color = '#D1D5DB'
			})
		})
	})

	submit.addEventListener('click', async () => {
		const method = 'POST'
		const url = `https://api.dotenx.com/database/query/insert/project/${projectTag}/table/reviews`
		const response = await fetch(url, {
			method,
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify({
				__products: boughtProductId,
				message: feedback.value,
				rate: rating,
				confirmed: true,
			}),
		})
		const data = await response.json()
		console.log(data)
	})

	name.removeAttribute('x-html')
	price.removeAttribute('x-html')
	content.removeAttribute('x-html')
	image.removeAttribute('x-bind:src')

	name.innerText = data.name
	price.innerText = `${data.price} ${data.currency}`
	content.innerHTML = data.description
	image.src = data.image_url

	data.files.forEach((file) => {
		const attachmentClone = attachmentTemplate.content.cloneNode(true)
		const fileName = attachmentClone.querySelector('.file-name')
		const fileDownload = attachmentClone.querySelector('.file-download')
		fileName.innerText = file.name
		fileDownload.href = file.url
		attachments.appendChild(attachmentClone)
	})

	root.appendChild(clone)

	function handleRating() {
		const stars = root.querySelectorAll('.star')
		// style the stars before the hovered one
		stars.forEach((star, index) => {
			star.addEventListener('mouseover', () => {
				stars.forEach((star, i) => {
					if (i <= index) {
						star.classList.add('text-yellow-400')
						star.classList.remove('text-gray-300')
					} else {
						star.classList.add('text-gray-300')
						star.classList.remove('text-yellow-400')
					}
				})
			})
		})
	}
})()
