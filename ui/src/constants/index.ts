import versions from '../version.json'

export const IS_LOCAL = process.env.REACT_APP_IS_LOCAL === 'true'
export const ADMIN_API_URL = process.env.REACT_APP_ADMIN_API_URL
export const ADMIN_URL = 'https://admin.dotenx.com'
export const PUBLIC_VERSION = versions.public
export const PRIVATE_VERSION = versions.private
