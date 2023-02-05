import { Loader } from '@mantine/core'
import { Advanced } from '../features/advanced/advanced'
import { useImportComponentHotKey } from '../features/hotkey/import-component'
import { useFetchGlobalStates, useFetchPage, useFetchProjectTag } from '../features/page/top-bar'
import { Simple } from '../features/simple/simple'

export function BuilderPage() {
	useFetchProjectTag()
	useFetchGlobalStates()
	const pageQuery = useFetchPage()
	const mode = pageQuery.data?.data.content.mode
	useImportComponentHotKey()

	if (mode == 'simple') return <Simple />
	if (mode === 'advanced') return <Advanced />
	return <Loader size="xs" my="xl" mx="auto" />
}
