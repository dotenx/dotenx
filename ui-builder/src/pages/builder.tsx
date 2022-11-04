import { Loader } from '@mantine/core'
import { Advanced } from '../features/advanced/advanced'
import { useFetchPage } from '../features/page/top-bar'
import { Simple } from '../features/simple/simple'

export function BuilderPage() {
	const pageQuery = useFetchPage()
	const mode = pageQuery.data?.data.content.mode

	if (mode == 'simple') return <Simple />
	if (mode === 'advanced') return <Advanced />
	return <Loader size="xs" my="xl" mx="auto" />
}
