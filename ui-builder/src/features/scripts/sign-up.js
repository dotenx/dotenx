/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'
	const redirect = '{{redirect}}'

	const root = document.getElementById(id)
	const nameInput = root.querySelector('.name > input')
	const emailInput = root.querySelector('.email > input')
	const passwordInput = root.querySelector('.password > input')
	const submitButton = root.querySelector('.submit')

	const url = `https://api.dotenx.com/user/management/project/${projectTag}/register`
	const method = 'POST'

	submitButton.addEventListener('click', async () => {
		const name = nameInput.value
		const email = emailInput.value
		const password = passwordInput.value

		const body = {
			fullname: name,
			email,
			password,
		}

		const response = await fetch(url, {
			method,
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
		const data = await response.json()
		if (response.ok) window.location.href = redirect
		alert(data.message)
	})
})()
