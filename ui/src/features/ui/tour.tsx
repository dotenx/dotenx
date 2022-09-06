import { useAtom } from 'jotai'
import { useReducer, useEffect, useState } from 'react'
import JoyRide, { ACTIONS, EVENTS, STATUS } from 'react-joyride'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { tourElementsLoading } from '../atoms'

const useTour = () => {
	const Main_STEPS = [
		{
			target: '.user_management',
			content: (
				<div>
					<h1 className="font-medium text-rose-600 text-lg mb-2  ">User management</h1>
					<p>You can add manage the users of your application and control their access</p>
				</div>
			),
			disableBeacon: true,
		},
		{
			target: '.tables',
			content: (
				<div>
					<h1 className="font-medium text-rose-600 text-lg mb-2  ">Tables</h1>
					<p>Use tables to store the data of your application</p>,
				</div>
			),
		},
		{
			target: '.interactions',
			content: (
				<div>
					<h1 className="font-medium text-rose-600 text-lg mb-2  ">Interactions</h1>
					<p>Use Interactions to add custom logic to your applications</p>,
				</div>
			),
		},
		{
			target: '.automation_Templates',
			content: (
				<div>
					<h1 className="font-medium text-rose-600 text-lg mb-2  ">
						Automation templates
					</h1>
					<p>
						An automation template allows you to build automated workflows for your
						users
					</p>
				</div>
			),
		},
		{
			target: '.providers',
			content: (
				<div>
					<h1 className="font-medium text-rose-600 text-lg mb-2  ">Providers</h1>
					<p>
						In order to integrate your application with third party services, you need
						to add a provider
					</p>
				</div>
			),
		},
		{
			target: '.files',
			content: (
				<div>
					<h1 className="font-medium text-rose-600 text-lg mb-2  ">Files</h1>
					<p>You can upload files to your project or allow your users to upload files</p>
				</div>
			),
		},
		{
			target: '.domains',
			content: (
				<div>
					<h1 className="font-medium text-rose-600 text-lg mb-2  ">Domains</h1>
					<p>
						Set a custom domain for your application instead of using the default domain
					</p>
				</div>
			),
		},
		{
			target: '.ui_builder',
			content: (
				<div>
					<h1 className="font-medium text-rose-600 text-lg mb-2  ">UI builder</h1>
					<p>
						build and edit UI for your project without code and directly conected to
						your project back end in UI builder
					</p>
				</div>
			),
		},
	]
	const UserManagement_STEPS = [
		{
			target: '.usergroups',
			content: 'usergroups',
			disableBeacon: true,
		},
		{
			target: '.endpoints',
			content: 'endpoints',
		},
		{
			target: '.access_token',
			content: 'interactions 😉.',
		},
	]
	const [tourSteps, setTourSteps] = useState<any>(Main_STEPS)
	const INITIAL_STATE = {
		key: new Date(),
		run: true,
		continuous: true,
		loading: false,
		stepIndex: 0,
	}
	const reducer = (state = INITIAL_STATE, action: any) => {
		switch (action.type) {
			case 'START':
				return { ...state, run: true }
			case 'RESET':
				return { ...state, stepIndex: 0 }
			case 'STOP':
				return { ...state, run: false }
			case 'NEXT_OR_PREV':
				return { ...state, ...action.payload }
			case 'RESTART':
				return {
					...state,
					stepIndex: 0,
					run: true,
					loading: false,
					key: new Date(),
				}
			default:
				return state
		}
	}
	return { Main_STEPS, UserManagement_STEPS, tourSteps, setTourSteps, INITIAL_STATE, reducer }
}

export const Tour = () => {
	const [istourElementsLoading, setIsTourElementsLoading] = useAtom(tourElementsLoading)
	const { Main_STEPS, UserManagement_STEPS, tourSteps, setTourSteps, INITIAL_STATE, reducer } =
		useTour()
	const [tourState, dispatch] = useReducer(reducer, INITIAL_STATE)
	const [endTourMessage, setEndTourMessage] = useState('')
	const { pathname } = useLocation()
	const mainRoute = pathname.split('/')[4]
	const { projectName } = useParams()

	const navigate = useNavigate()

	useEffect(() => {
		if (localStorage.getItem('tour')) {
			dispatch({ type: 'STOP' })
		}
		if (tourSteps === Main_STEPS) {
			setEndTourMessage('done')
		}
	}, [tourSteps])

	const callback = (data: any) => {
		const { action, index, type, status, step } = data

		if (
			action === ACTIONS.CLOSE ||
			(status === STATUS.SKIPPED && tourState.run) ||
			status === STATUS.FINISHED
		) {
			dispatch({ type: 'STOP' })
		} else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
			dispatch({
				type: 'NEXT_OR_PREV',
				payload: { stepIndex: index + (action === ACTIONS.PREV ? -1 : 1) },
			})
		}
		if (step?.target === '.ui_builder' && status === STATUS.FINISHED) {
			localStorage.setItem('tour', 'finished')
			// setTourSteps(UserManagement_STEPS)
			// navigate(`/builder/projects/${projectName}/user-management`)
			// dispatch({ type: 'RESTART' })
		}
	}

	// const startTour = () => {
	// 	dispatch({ type: 'RESTART' })
	// }

	return (
		<>
			{/* <button className="btn btn-primary" onClick={startTour}>
				Start Tour
			</button> */}

			<JoyRide
				showProgress
				run
				steps={tourSteps}
				// debug
				{...tourState}
				callback={callback}
				showSkipButton={true}
				styles={{
					tooltipContainer: {
						textAlign: 'left',
					},

					buttonBack: {
						marginRight: 10,
					},
				}}
				locale={{ last: endTourMessage }}
			/>
		</>
	)
}
