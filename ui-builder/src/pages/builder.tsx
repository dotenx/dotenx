import { Loader } from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import { openModal } from '@mantine/modals'
import { Advanced } from '../features/advanced/advanced'
import { ImportComponent } from '../features/marketplace/import-component'
import { useFetchGlobalStates, useFetchPage, useFetchProjectTag } from '../features/page/top-bar'
import { Simple } from '../features/simple/simple'

export function BuilderPage() {
	useFetchProjectTag()
	useFetchGlobalStates()
	const pageQuery = useFetchPage()
	const mode = pageQuery.data?.data.content.mode

	useHotkeys([
		[
			'mod+shift+p',
			() =>
				openModal({
					title: 'Import component from json',
					children: <ImportComponent />,
					size: 'xl',
				}),
		],
	])

	if (mode == 'simple') return <Simple />
	if (mode === 'advanced') return <Advanced />
	return <Loader size="xs" my="xl" mx="auto" />
}
