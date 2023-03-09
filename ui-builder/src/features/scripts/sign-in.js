/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'
	const redirect = '{{redirect}}'

	const url = `https://api.dotenx.com/user/management/project/${projectTag}/login`
	const method = 'POST'
	const root = document.getElementById(id)
	const emailInput = root.querySelector('.email > input')
	const passwordInput = root.querySelector('.password > input')
	const submitButton = root.querySelector('.submit')

	submitButton.addEventListener('click', async () => {
		const email = emailInput.value
		const password = passwordInput.value

		const body = {
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
		if (response.ok) {
			const token = data.accessToken
			document.cookie = `token=${token}`
			window.location.href = `${redirect}.html`
		} else {
			alert(data.message)
		}
	})
})()
