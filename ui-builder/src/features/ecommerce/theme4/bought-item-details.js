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
})()
