import { ActionIcon, Button, CloseButton, Divider } from '@mantine/core'
import { openModal } from '@mantine/modals'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { TbPlus, TbTableExport, TbTableImport } from 'react-icons/tb'
import { useParams } from 'react-router-dom'
import { deleteDesignSystem, DesignSystem, getDesignSystems, QueryKey } from '../../api'
import { projectTagAtom } from '../page/top-bar'
import { DesignSystemMarketplaceForm } from './add-to-marketplace'
import { ComponentDraggable } from './component-draggable'
import { DesignSystemForm } from './design-system-form'
import { Marketplace } from './marketplace'

export function DesignSystems() {
	const projectTag = useAtomValue(projectTagAtom)
	const query = useQuery(
		[QueryKey.DesignSystems, projectTag],
		() => getDesignSystems({ projectTag }),
		{ enabled: !!projectTag }
	)
	const designSystems =
		query.data?.data?.filter(
			(designSystem) => designSystem.category === 'uiDesignSystemItem'
		) ?? []
	const openDesignSystemForm = () => {
		openModal({ title: 'Create Design System', children: <DesignSystemForm /> })
	}
	const openMarketplace = () => {
		openModal({
			title: 'Marketplace',
			children: <Marketplace />,
			size: 'xl',
		})
	}

	return (
		<div>
			{designSystems.map((designSystem) => (
				<DesignSystemItem key={designSystem.name} designSystem={designSystem} />
			))}
			<div className="flex gap-3 mt-6">
				<Button leftIcon={<TbPlus />} size="xs" onClick={openDesignSystemForm} fullWidth>
					Design System
				</Button>
				<Button leftIcon={<TbTableImport />} size="xs" onClick={openMarketplace} fullWidth>
					Marketplace
				</Button>
			</div>
		</div>
	)
}

function DesignSystemItem({ designSystem }: { designSystem: DesignSystem }) {
	const projectTag = useAtomValue(projectTagAtom)
	const { projectName = '' } = useParams()
	const queryClient = useQueryClient()
	const deleteMutation = useMutation(deleteDesignSystem, {
		onSuccess: () => queryClient.invalidateQueries([QueryKey.DesignSystems]),
	})
	const openDesignSystemMarketplaceForm = () => {
		openModal({
			title: '',
			children: (
				<DesignSystemMarketplaceForm
					projectName={projectName}
					designSystem={designSystem}
				/>
			),
		})
	}
	const handleDelete = () => {
		deleteMutation.mutate({
			name: designSystem.name,
			projectTag,
		})
	}

	return (
		<div>
			<Divider
				mt="xl"
				mb="xs"
				label={
					<div className="flex items-center gap-1">
						<ActionIcon
							title="Add to marketplace"
							size="xs"
							onClick={openDesignSystemMarketplaceForm}
						>
							<TbTableExport className="text-xs" />
						</ActionIcon>
						<div>{designSystem.name}</div>
						<CloseButton
							size="xs"
							onClick={handleDelete}
							loading={deleteMutation.isLoading}
							title="Delete design system"
						/>
					</div>
				}
				labelPosition="center"
			/>
			<ComponentDraggable components={designSystem.content} />
		</div>
	)
}
