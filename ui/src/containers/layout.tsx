/** @jsxImportSource @emotion/react */
import { ReactNode } from 'react'
import { BsArrowRightShort } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import Logo from '../assets/images/logo.png'

interface LayoutProps {
	children: ReactNode
	header?: ReactNode
	pathname: string
}

export function Layout({ children, pathname, header = null }: LayoutProps) {
	return (
		<div
			css={(theme) => ({
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				color: theme.color.text,
			})}
		>
			<div
				css={(theme) => ({
					borderBottom: '1px solid',
					borderColor: theme.color.text,
					display: 'flex',
				})}
			>
				<div
					css={(theme) => ({
						borderRight: '1px solid',
						borderColor: theme.color.text,
						display: 'flex',
						alignItems: 'center',
						padding: '16px 20px',
						fontWeight: 100,
					})}
				>
					<img
						src={Logo}
						alt="logo"
						css={{
							height: '5vh',
							width: 'auto',
						}}
					/>
				</div>
				<div css={{ flexGrow: '1' }}>{header}</div>
			</div>
			<div css={{ flexGrow: '1', display: 'flex' }}>
				<Sidebar pathname={pathname} />
				<div css={{ flexGrow: '1', display: 'flex' }}>{children}</div>
			</div>
		</div>
	)
}

interface SidebarProps {
	pathname: string
}

function Sidebar({ pathname }: SidebarProps) {
	const items = [
		{ to: '/', label: 'Automations' },
		{ to: '/integrations', label: 'Integrations' },
		{ to: '/triggers', label: 'Triggers' },
	]

	return (
		<div
			css={(theme) => ({
				borderRight: '1px solid',
				borderColor: theme.color.text,
				padding: '28px 20px',
				display: 'flex',
				flexDirection: 'column',
				gap: 16,
			})}
		>
			{items.map((item) => (
				<NavItem key={item.label} to={item.to} selected={pathname === item.to}>
					{item.label}
				</NavItem>
			))}
		</div>
	)
}

interface NavItemProps {
	children: ReactNode
	to: string
	selected: boolean
}

function NavItem({ to, children, selected }: NavItemProps) {
	return (
		<Link
			to={to}
			css={(theme) => ({
				color: selected ? theme.color.background : theme.color.text,
				backgroundColor: selected ? theme.color.text : theme.color.background,
				padding: '4px 20px',
				borderRadius: 4,
				textDecoration: 'none',
				display: 'flex',
				alignItems: 'center',
				gap: 6,
				justifyContent: 'space-between',
				':hover': {
					backgroundColor: theme.color.text,
					color: theme.color.background,
				},
			})}
		>
			{children}
			<BsArrowRightShort />
		</Link>
	)
}
