import { useHotkeys } from '@mantine/hooks'
import { openModal } from '@mantine/modals'
import { ImportComponent } from '../marketplace/import-component'

export const useImportComponentHotKey = () => {
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
}
