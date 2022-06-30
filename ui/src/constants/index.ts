import packageJson from '../../package.json'

export const IS_LOCAL = process.env.REACT_APP_IS_LOCAL === 'true'
export const ADMIN_API_URL = process.env.REACT_APP_ADMIN_API_URL
export const ADMIN_URL = 'https://admin.dotenx.com'
export const VERSION = packageJson.version
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PRIVATE_VERSION = (packageJson as any)?.privateVersion
