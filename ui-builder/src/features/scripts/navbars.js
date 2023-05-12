/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)
	const navbarMenu = root.querySelector('.menu')
	const openNavbarBtn = root.querySelector('.menu-btn-bars')
	const closeNavbarBtn = root.querySelector('.menu-btn-times')

	navbarMenu.classList.remove('menu')
	openNavbarBtn.classList.remove('menu-btn-bars')
	closeNavbarBtn.classList.remove('menu-btn-times')

	openNavbarBtn.addEventListener('click', () => {
		navbarMenu.style.visibility = 'visible'
		navbarMenu.style.maxHeight = '100vh'
		openNavbarBtn.style.display = 'none'
		closeNavbarBtn.style.display = 'block'
	})

	closeNavbarBtn.addEventListener('click', () => {
		navbarMenu.style.visibility = 'hidden'
		navbarMenu.style.maxHeight = '0'
		openNavbarBtn.style.display = 'block'
		closeNavbarBtn.style.display = 'none'
	})
})()
