/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string
	readonly VITE_ADMIN_PANEL_URL: string
	readonly VITE_ADMIN_IS_LOCAL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
