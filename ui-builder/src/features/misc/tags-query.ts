import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { EcommerceQueryKey, getTags } from '../../api/ecommerce'
import { projectTagAtom } from '../page/top-bar'

export const useTags = () => {
	const projectTag = useAtomValue(projectTagAtom)
	const tagsQuery = useQuery([EcommerceQueryKey.GetProducts, projectTag], () =>
		getTags({ projectTag })
	)
	const tags = tagsQuery.data?.data.rows.map((row) => row.tag) ?? []
	return tags
}
