/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled'
import { ReactNode } from 'react'
import logo from '../../assets/images/logo.png'
import { Sidebar } from './sidebar'

const Wrapper = styled.div(({ theme }) => ({
	height: '100vh',
	display: 'flex',
	flexDirection: 'column',
	color: theme.color.text,
}))

const HeaderWrapper = styled.header(({ theme }) => ({
	borderBottom: '1px solid',
	borderColor: theme.color.text,
	display: 'flex',
}))

const LogoWrapper = styled.div(({ theme }) => ({
	borderRight: '1px solid',
	borderColor: theme.color.text,
	display: 'flex',
	alignItems: 'center',
	padding: '16px 20px',
	fontWeight: 100,
}))

const Logo = styled.img({ height: '5vh', width: 'auto' })

const Grow = styled.div({ flexGrow: '1' })

const FlexAndGrow = styled.div({ display: 'flex', flexGrow: '1' })

interface LayoutProps {
	children: ReactNode
	header?: ReactNode
	pathname: string
}

export function Layout({ children, pathname, header = null }: LayoutProps) {
	return (
		<Wrapper className="font-body">
			<HeaderWrapper>
				<LogoWrapper>
					<Logo src={logo} alt="logo" />
				</LogoWrapper>
				<Grow>{header}</Grow>
			</HeaderWrapper>
			<FlexAndGrow>
				<Sidebar pathname={pathname} />
				<FlexAndGrow>{children}</FlexAndGrow>
			</FlexAndGrow>
		</Wrapper>
	)
}
