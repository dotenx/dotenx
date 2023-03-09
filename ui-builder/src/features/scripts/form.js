/* eslint-disable no-undef */

;(async () => {
	const id = '{{id}}'
	const projectTag = '{{projectTag}}'
	const pageName = '{{pageName}}'

	const root = document.getElementById(id)
	const inputs = root.querySelectorAll('input')
	const submit = root.querySelector('button[type="submit"]')

	const submitForm = async () => {
		const payload = {}
		inputs.forEach((input) => {
			payload[input.name] = input.value
		})

		const formId = id
		const method = 'POST'
		const headers = { 'Content-Type': 'application/json' }
		const body = JSON.stringify({ response: payload })
		const url = `https://api.dotenx.com/public/uibuilder/project/${projectTag}/page/${pageName}/form/${formId}`

		const response = await fetch(url, { method, headers, body })

		alert('Form submitted successfully!')
	}

	submit.addEventListener('click', submitForm)
})()

// POST https://api.dotenx.com/public/uibuilder/project/{project_tag}/page/{page_name}/form/{from_id}
// Body:
// {
//     "response": {
//         "q1": "yes",
//         "q2": [
//             "aaa",
//             "bbb"
//         ],
//         "q3": {
//             "name": "Jack",
//             "age": 39
//         }
//     }
// }
