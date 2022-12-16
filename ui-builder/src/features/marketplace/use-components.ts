import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { getComponents, QueryKey } from '../../api'
import { projectTagAtom } from '../page/top-bar'

export const useComponents = () => {
	const projectTag = useAtomValue(projectTagAtom)
	const query = useQuery([QueryKey.Components, projectTag], () => getComponents({ projectTag }), {
		enabled: !!projectTag,
	})
	const components = query.data?.data?.filter((c) => c.category === 'uiComponentItem') ?? []
	return { components }
}
