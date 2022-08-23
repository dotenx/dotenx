import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import { createPage, getPageDetails, getPages, QueryKey } from '../api/api'
import { Component, useCanvasStore } from '../features/canvas-store'
import { DataSource, useDataSourceStore } from '../features/data-source-store'
import { usePageStates } from '../features/page-states'
import { AnyJson } from '../utils'

export const usePages = (projectTag: string) => {
	const [pagesList, setPagesList] = useState<string[]>([])
	const { isLoading: pagesListLoading } = useQuery(
		[QueryKey.Pages, projectTag],
		() => getPages({ projectTag }),
		{
			onSuccess: (data) => {
				const pages = data.data ?? []
				setPagesList(pages)
				setPageName(pages[0] ?? 'index')
			},
			enabled: !!projectTag,
		}
	)
	const [pageName, setPageName] = useState('')
	const setComponents = useCanvasStore((store) => store.setComponents)
	const setDataSources = useDataSourceStore((store) => store.set)
	const setPageState = usePageStates((store) => store.setState)

	const pageDetailsQuery = useQuery(
		[QueryKey.PageDetails, pageName],
		() => getPageDetails({ projectTag, name: pageName }),
		{
			enabled: !!pageName,
			onSuccess: (data) => {
				const content = data.data.content
				setComponents(content.layout)
				setDataSources(content.dataSources)
				content.dataSources.map((source) =>
					axios
						.get<AnyJson>(source.url)
						.then((data) => setPageState(source.stateName, data.data))
				)
			},
		}
	)

	const { mutate: addPageMutate, isLoading: addPageLoading } = useMutation(
		(payload: { name: string; components: Component[]; dataSources: DataSource[] }) =>
			createPage({
				projectTag,
				name: payload.name,
				content: { layout: payload.components, dataSources: payload.dataSources },
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
