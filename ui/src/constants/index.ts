import versions from '../version.json'

export const IS_LOCAL = process.env.REACT_APP_IS_LOCAL === 'true'
export const ADMIN_API_URL = process.env.REACT_APP_ADMIN_API_URL
export const ADMIN_URL = 'https://admin.dotenx.com'
export const PUBLIC_VERSION = versions.public
export const PRIVATE_VERSION = versions.private

export const columnTypeOptions = [
	{ label: 'Yes/No', value: 'yes_no' },
	{ label: 'Image address', value: 'image_address' },
	{ label: 'File address', value: 'file_address' },
	{ label: 'Rating', value: 'rating' },
	{ label: 'URL', value: 'url' },
	{ label: 'Email', value: 'email' },
	{ label: 'Time', value: 'just_time' },
	{ label: 'Date', value: 'just_date' },
	{ label: 'Date time', value: 'date_time' },
	{ label: 'Number', value: 'num' },
	{ label: 'Short text', value: 'short_text' },
	{ label: 'Long text', value: 'long_text' },
	{ label: 'Link to table', value: 'link_field' },
]

export const chainedConditionOptions = [
	{ label: 'and', value: 'and' },
	{ label: 'or', value: 'or' },
]

export const operatorOptions = {
	number: [
		{ label: '=', value: '=' },
		{ label: '≠', value: '!=' },
		{ label: '>', value: '>' },
		{ label: '<', value: '<' },
		{ label: '≥', value: '>=' },
		{ label: '≤', value: '<=' },
	],
	string: [
		{ label: 'is', value: '=' },
		{ label: 'is not', value: '!=' },
		{ label: 'contains', value: 'contains' },
		{ label: 'does not contain', value: 'doesNotContain' },
	],
	boolean: [],
	none: [],
}

export const columnTypeKinds = [
	{
		kind: 'string' as const,
		types: ['image_address', 'file_address', 'url', 'email', 'short_text', 'long_text'],
	},
	{
		kind: 'number' as const,
		types: ['rating', 'num', 'link_field'],
	},
	{
		kind: 'boolean' as const,
		types: ['yes_no'],
	},
]
