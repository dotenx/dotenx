import { Loader } from '@mantine/core'
import { Advanced } from '../features/advanced/advanced'
import { useImportComponentHotKey } from '../features/hotkey/import-component'
import { useFetchGlobalStates, useFetchPage, useFetchProject } from '../features/page/top-bar'
import { Simple } from '../features/simple/simple'

export function BuilderPage() {
	const projectQuery = useFetchProject()
	useFetchGlobalStates()
	const pageQuery = useFetchPage()
	const mode = pageQuery.data?.data.content.mode
	useImportComponentHotKey()

	if (projectQuery.isLoading) return <Loader mx="auto" size="xs" mt="xl" />

	if (mode === 'simple') return <Simple />
	if (mode === 'advanced') return <Advanced />
	return <Simple />
}
