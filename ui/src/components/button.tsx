import { css, Interpolation, keyframes, Theme } from '@emotion/react'
import React from 'react'

const pulse = keyframes`
 	0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
`

const base = css({
	border: 'none',
	backgroundColor: 'unset',
	cursor: 'pointer',
	padding: 4,
	margin: 0,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	':disabled': {
		cursor: 'not-allowed',
	},
})

type ButtonVariant = 'icon' | 'primary'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	isLoading?: boolean
}

export function Button({ variant = 'primary', isLoading, ...rest }: ButtonProps) {
	return (
		<button
			css={[
				base,
				(theme) => getVariantCss(theme, variant),
				isLoading && {
					animation: `${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
					':disabled': {
						cursor: 'wait',
					},
				},
			]}
			disabled={isLoading || rest.disabled}
			{...rest}
		/>
	)
}

function getVariantCss(theme: Theme, variant: ButtonVariant): Interpolation<Theme> {
	switch (variant) {
		case 'icon':
			return {
				borderRadius: 999,
				':hover': {
					backgroundColor: theme.color.text,
					color: theme.color.background,
				},
			}
		case 'primary':
			return {
				backgroundColor: theme.color.text,
				color: theme.color.background,
				borderRadius: 4,
				border: '1px solid',
				borderColor: theme.color.text,
				padding: '10px 40px',
				':not([disabled]):hover': {
					background: theme.color.background,
					color: theme.color.text,
				},
				':disabled': {
					opacity: 0.5,
				},
			}
	}
}
