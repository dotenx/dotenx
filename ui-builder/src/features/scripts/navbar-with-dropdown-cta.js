/* eslint-disable no-undef */

; (async () => {
	const id = '{{id}}'

	const root = document.getElementById(id)

	const toggle = root.querySelector('.toggle')
	const menu = root.querySelector('.menu')
	const itemsWithSubmenu = root.querySelectorAll('.item.has-submenu')
	const submenuHeaders = document.querySelectorAll('.item.has-submenu > a')


	/* Toggle burger menu */
	function toggleMenu(e) {
		// Do not allow the click to bubble up
		e.stopPropagation()
		if (menu.classList.contains('active')) {
			menu.classList.remove('active')
			toggle.querySelector('a').innerHTML = "<i class='fas fa-bars'></i>"
		} else {
			menu.classList.add('active')
			toggle.querySelector('a').innerHTML = "<i class='fas fa-times'></i>"
		}
	}

	function closeSubmenus() {
		menu.querySelector('.submenu-active')?.classList.remove('submenu-active')
	}

	/* Activate Submenu */
	function toggleItemWithHover(e) {
		// if not in desktop mode, do nothing
		if (window.innerWidth <= 900) return
		closeSubmenus()
		if (this.classList.contains('submenu-active')) {
			this.classList.remove('submenu-active')
		} else {
			this.classList.add('submenu-active')
		}
	}
	function closeSubmenuWithMouseLeave(e) {
		// if not in desktop mode, do nothing
		if (window.innerWidth <= 900) return
		closeSubmenus()
		if (this.classList.contains('submenu-active')) {
			this.classList.remove('submenu-active')
		}
	}

	function toggleItemWithClick(e) {
		e.preventDefault()
		const parent = this.parentNode
		if (parent.classList.contains('submenu-active')) {
			parent.classList.remove('submenu-active')
		} else {
			closeSubmenus()
			parent.classList.add('submenu-active')
		}
	}


	/* Close Submenu From Anywhere */
	function closeSubmenu(e) {
		let isClickInside = menu.contains(e.target)
		if (!isClickInside && menu.classList.contains('active')) {
			menu.classList.remove('active')
			toggle.querySelector('a').innerHTML = "<i class='fas fa-bars'></i>"
			closeSubmenus()
		}
	}

	/* Event Listeners */
	toggle.addEventListener('click', toggleMenu, false)

	for (let header of submenuHeaders) {
		header.addEventListener('click', toggleItemWithClick, false)
	}

	for (let item of itemsWithSubmenu) {
		item.addEventListener('mouseover', toggleItemWithHover, false)
		item.addEventListener('mouseleave', closeSubmenuWithMouseLeave, false)
	}

	document.addEventListener('click', closeSubmenu, false)

})()
