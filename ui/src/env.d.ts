/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string
	readonly VITE_URL: string
	readonly VITE_UI_BUILDER_ADDRESS: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
