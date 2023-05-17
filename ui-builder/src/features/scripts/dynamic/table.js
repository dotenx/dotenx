/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)
	const table = root.querySelector('.table')
	const rows = table.querySelectorAll('.row')
	const row = table.querySelector('.row')

	rows.forEach((row) => row.remove())

	const data = await fetch('https://jsonplaceholder.typicode.com/users').then((res) => res.json())
	data.forEach((user) => {
		const clone = row.cloneNode(true)
		const name = clone.querySelector('.name')
		const username = clone.querySelector('.username')
		const email = clone.querySelector('.email')
		name.removeAttribute('x-html')
		username.removeAttribute('x-html')
		email.removeAttribute('x-html')
		name.textContent = user.name
		username.textContent = user.username
		email.textContent = user.email
		table.appendChild(clone)
	})
})()
