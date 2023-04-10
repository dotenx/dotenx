/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)
	const navbarMenu = root.querySelector('.navbar-menu')
	const openNavbarBtn = root.querySelector('.open-navbar-btn')
	const closeNavbarBtn = root.querySelector('.close-navbar-btn')

	openNavbarBtn.addEventListener('click', () => {
		navbarMenu.style.display = 'flex'
		openNavbarBtn.style.display = 'none'
		closeNavbarBtn.style.display = 'flex'
	})

	closeNavbarBtn.addEventListener('click', () => {
		navbarMenu.style.display = 'none'
		openNavbarBtn.style.display = 'flex'
		closeNavbarBtn.style.display = 'none'
	})
})()
