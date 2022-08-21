import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { createPage, getPageDetails, getPages, QueryKey } from '../api/api'
import { Component, useCanvasStore } from '../features/canvas-store'
import { DataSource, useDataSourceStore } from '../features/data-source-store'

export const usePages = (projectTag: string) => {
	const [pagesList, setPagesList] = useState<string[]>([])
	const { isLoading: pagesListLoading } = useQuery(
		[QueryKey.Pages, projectTag],
		() => getPages({ projectTag }),
		{
			onSuccess: (data) => {
				setPagesList(data?.data ?? [])
			},
			enabled: !!projectTag,
		}
	)
	const [pageName, setPageName] = useState('')
	const setComponents = useCanvasStore((store) => store.setComponents)
	const setDataSources = useDataSourceStore((store) => store.set)

	const pageDetailsQuery = useQuery(
		[QueryKey.PageDetails, pageName],
		() => getPageDetails({ projectTag, name: pageName }),
		{
			enabled: !!pageName,
			onSuccess: (data) => {
				const content = data.data.content
				setComponents(content.components)
				setDataSources(content.dataSources)
			},
		}
	)

	const { mutate: addPageMutate, isLoading: addPageLoading } = useMutation(
		(payload: { name: string; components: Component[]; dataSources: DataSource[] }) =>
			createPage({
				projectTag,
				name: payload.name,
				content: { components: payload.components, dataSources: payload.dataSources },
			})
	)

	return {
		pageName,
		pagesList,
		pagesListLoading,
		setPageName,
		addPageMutate,
		pageDetailsQuery,
		addPageLoading,
	}
}
