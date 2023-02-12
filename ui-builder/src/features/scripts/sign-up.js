/* eslint-disable no-undef */

;(async () => {
	const projectTag = '{{projectTag}}'
	const url = `https://api.dotenx.com/user/management/project/${projectTag}/register`
	const method = 'POST'
	const nameInput = document.querySelector('.name > input')
	const emailInput = document.querySelector('.email > input')
	const passwordInput = document.querySelector('.password > input')
	const submitButton = document.querySelector('.submit')

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

		if (data.error) {
			alert(data.error)
		}
	})
})()
