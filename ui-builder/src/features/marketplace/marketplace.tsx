import { Center, Loader, Tabs } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { TbComponents, TbTable } from 'react-icons/tb'
import { getMarketplaceItems, QueryKey } from '../../api'
import { MarketplaceComponent } from './marketplace-item'

export function Marketplace() {
	const marketplaceQuery = useQuery([QueryKey.MarketplaceItems], getMarketplaceItems)
	const components =
		marketplaceQuery.data?.data.filter((item) => item.category === 'uiComponentItem') ?? []
	const designSystems =
		marketplaceQuery.data?.data.filter((item) => item.category === 'uiDesignSystemItem') ?? []

	if (marketplaceQuery.isLoading) {
		return (
			<Center>
				<Loader />
			</Center>
		)
	}

	return (
		<Tabs defaultValue="components">
			<Tabs.List>
				<Tabs.Tab value="components" icon={<TbComponents size={14} />}>
					Components
				</Tabs.Tab>
				<Tabs.Tab value="design-systems" icon={<TbTable size={14} />}>
					Design Systems
				</Tabs.Tab>
			</Tabs.List>

			<Tabs.Panel value="components" pt="xs">
				<div className="grid grid-cols-3 gap-2 h-[500px]  scrollbar overflow-y-auto bg-gray-50 -mt-2.5 pt-2">
					{components.map((c) => (
						<MarketplaceComponent
							imageUrl={c.imageUrl}
							key={c.id}
							id={c.id}
							title={c.title}
							category={c.category}
						/>
					))}
				</div>
			</Tabs.Panel>
			<Tabs.Panel value="design-systems" pt="xs">
				<div className="grid grid-cols-3 gap-2  h-[500px]   scrollbar overflow-y-auto bg-gray-50 -mt-2.5 pt-2">
					{designSystems.map((c) => (
						<MarketplaceComponent
							imageUrl={c.imageUrl}
							key={c.id}
							id={c.id}
							title={c.title}
							category={c.category}
						/>
					))}
				</div>
			</Tabs.Panel>
		</Tabs>
	)
}
