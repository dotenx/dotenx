/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'
	const pageName = '{{pageName}}'
	const formName = '{{formName}}'

	const root = document.getElementById(id)
	const inputs = root.querySelectorAll('input')
	const submit = root.querySelector('button[type="submit"]')

	const submitForm = async () => {
		const prevHTML = submit.innerHTML
		submit.innerHTML = `<span class="loader"></span>`
		const payload = {}
		inputs.forEach((input) => {
			payload[input.name] = input.value
		})

		const formId = id
		const method = 'POST'
		const headers = { 'Content-Type': 'application/json' }
		const body = JSON.stringify({ response: payload, form_name: formName })
		const url = `https://api.dotenx.com/public/uibuilder/project/${projectTag}/page/${pageName}/form/${formId}`

		const response = await fetch(url, { method, headers, body })

		if (response.ok) alert('Form submitted successfully!')
		else alert('Form submission failed!')

		submit.innerHTML = prevHTML
	}

	submit.addEventListener('click', submitForm)
})()
