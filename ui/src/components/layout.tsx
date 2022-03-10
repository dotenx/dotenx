import { Theme, ThemeProvider } from '@emotion/react'
import { Link } from 'gatsby'
import { ReactNode, useEffect } from 'react'
import { ReactFlowProvider } from 'react-flow-renderer'
import { BsArrowRightShort } from 'react-icons/bs'
import ReactModal from 'react-modal'
import { QueryClient, QueryClientProvider } from 'react-query'
import '../styles/global.css'

const theme: Theme = {
	color: {
		primary: '#e85d04',
		positive: '#90be6d',
		negative: '#ef233c',
		text: '#222222',
		background: '#FFFFFC',
	},
}

const queryClient = new QueryClient({
	defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
})

interface LayoutProps {
	children: ReactNode
	header?: ReactNode
	pathname: string
}

export function Layout({ children, pathname, header = null }: LayoutProps) {
	return (
		<Providers>
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
					<h1
						css={{
							borderRight: '1px solid',
							borderColor: theme.color.text,
							display: 'flex',
							alignItems: 'center',
							padding: '16px 20px',
							fontWeight: 100,
						}}
					>
						Automated Ops
					</h1>
					<div css={{ flexGrow: '1' }}>{header}</div>
				</div>
				<div css={{ flexGrow: '1', display: 'flex' }}>
					<Sidebar pathname={pathname} />
					<div css={{ flexGrow: '1', display: 'flex' }}>{children}</div>
				</div>
			</div>
		</Providers>
	)
}

interface ProvidersProps {
	children: ReactNode
}

function Providers({ children }: ProvidersProps) {
	useEffect(() => {
		ReactModal.setAppElement('#root')
	}, [])

	return (
		<div id="root">
			<ThemeProvider theme={theme}>
				<QueryClientProvider client={queryClient}>
					<ReactFlowProvider>{children}</ReactFlowProvider>
				</QueryClientProvider>
			</ThemeProvider>
		</div>
	)
}

interface SidebarProps {
	pathname: string
}

function Sidebar({ pathname }: SidebarProps) {
	const items = [
		{ to: '/', label: 'Pipelines' },
		{ to: '/integrations', label: 'Integrations' },
		{ to: '/triggers', label: 'Triggers' },
	]

	return (
		<div
			css={{
				borderRight: '1px solid',
				borderColor: theme.color.text,
				padding: '28px 20px',
				display: 'flex',
				flexDirection: 'column',
				gap: 16,
			}}
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
