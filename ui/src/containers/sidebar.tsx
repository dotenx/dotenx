import styled from '@emotion/styled'
import { NavItem } from '../components/nav-item'

const Wrapper = styled.div(({ theme }) => ({
	borderRight: '1px solid',
	borderColor: theme.color.text,
	padding: '28px 20px',
	display: 'flex',
	flexDirection: 'column',
	gap: 16,
}))

interface SidebarProps {
	pathname: string
}

const items = [
	{ to: '/', label: 'Automations' },
	{ to: '/integrations', label: 'Integrations' },
	{ to: '/triggers', label: 'Triggers' },
]

export function Sidebar({ pathname }: SidebarProps) {
	return (
		<Wrapper>
			{items.map((item) => (
				<NavItem key={item.label} to={item.to} selected={pathname === item.to}>
					{item.label}
				</NavItem>
			))}
		</Wrapper>
	)
}
