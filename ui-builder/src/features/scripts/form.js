/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)
	const inputs = root.querySelectorAll('input')
	const submit = root.querySelector('button[type="submit"]')

	const submitForm = async () => {
		const payload = {}
		inputs.forEach((input) => {
			payload[input.name] = input.value
		})
		const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		})
		const data = await response.json()
		alert(JSON.stringify(data))
	}

	submit.addEventListener('click', submitForm)
})()
