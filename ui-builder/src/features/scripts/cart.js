/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const root = document.getElementById(id)
	const cartItems = root.querySelector('.cart-items')
	const cartItem = document.querySelector('.cart-item')

	const cart = JSON.parse(localStorage.getItem('cart')) ?? {}
	const items = Object.entries(cart)

	items.forEach(([id, count]) => {
		const clone = cartItem.content.cloneNode(true)
		const name = clone.querySelector('.name')
		const quantity = clone.querySelector('.quantity')
		const price = clone.querySelector('.price')
		const removeBtn = clone.querySelector('.remove-btn')

		name.removeAttribute('x-html')
		name.textContent = id

		quantity.removeAttribute('x-html')
		quantity.textContent = count

		price.removeAttribute('x-html')
		price.textContent = `$${count * 100}`

		removeBtn.addEventListener('click', () => {
			delete cart[id]
			localStorage.setItem('cart', JSON.stringify(cart))
			location.reload()
		})

		cartItems.appendChild(clone)
	})
})()
