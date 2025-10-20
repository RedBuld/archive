import './app.css'
import { Route, Navigate, RouterProvider, createBrowserRouter, createRoutesFromElements, Outlet } from 'react-router'
import { QueueContextProvider } from "./contexts/QueueContext"
import { AppContextProvider } from "./contexts/AppContext"
import { AnimeIndexPageLink, MangaIndexPageLink, RanobeIndexPageLink } from './tools/navigation'
import { InfoDisksLink, InfoNotificationsLink, InfoPageLink } from './tools/navigation'

import AppLayout from './layouts/AppLayout'
// 
import AnimeIndexPage from './pages/anime/AnimeIndexPage'
import AnimeSinglePage from './pages/anime/AnimeSinglePage'
import AnimeSeasonPage from './pages/anime/AnimeSeasonPage'
// 
import MangaIndexPage from './pages/manga/MangaIndexPage'
import MangaSinglePage from './pages/manga/MangaSinglePage'
import MangaReaderPage from './pages/manga/MangaReaderPage'
// 
import RanobeIndexPage from './pages/ranobe/RanobeIndexPage'
import RanobeSinglePage from './pages/ranobe/RanobeSinglePage'
import RanobeReaderPage from './pages/ranobe/RanobeReaderPage'
// 
import InfoIndexPage from './pages/info/InfoIndexPage'
import InfoDisksPage from './pages/info/InfoDisksPage'
import InfoNotificationsPage from './pages/info/InfoNotificationsPage'
import { ReaderContextProvider, ReaderNavigationContextProvider } from './contexts/ReaderContext'


const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/">
			<Route
				path="/"
				element={<QueueContextProvider><AppContextProvider><AppLayout /></AppContextProvider></QueueContextProvider>}
			>
				<Route index path="/" element={<Navigate to="/anime" />} />
				{/* ANIME */}
				<Route path={`${AnimeIndexPageLink}`} element={<AnimeIndexPage />} />
				<Route path={`${AnimeIndexPageLink}/:anime_slug`} element={<AnimeSinglePage />} />
				<Route path={`${AnimeIndexPageLink}/:anime_slug/:season_slug`} element={<AnimeSeasonPage />} />
				{/* MANGA */}
				<Route path={`${MangaIndexPageLink}`} element={<MangaIndexPage />} />
				<Route path={`${MangaIndexPageLink}/:manga_slug`} element={<MangaSinglePage />} />
				{/* RANOBE */}
				<Route path={`${RanobeIndexPageLink}`} element={<RanobeIndexPage />} />
				<Route path={`${RanobeIndexPageLink}/:ranobe_slug`} element={<RanobeSinglePage />} />
				{/* INFO */}
				<Route path={`${InfoPageLink}`} element={<InfoIndexPage />} />
				<Route path={`${InfoDisksLink}`} element={<InfoDisksPage />} />
				<Route path={`${InfoNotificationsLink}`} element={<InfoNotificationsPage />} />
			</Route>
			<Route
				path={`${MangaIndexPageLink}/:manga_slug/read`}
				element={<ReaderContextProvider><ReaderNavigationContextProvider><Outlet /></ReaderNavigationContextProvider></ReaderContextProvider>}
			>
				<Route
					path={`${MangaIndexPageLink}/:manga_slug/read`}
					element={<MangaReaderPage />}
				></Route>
				<Route
					path={`${MangaIndexPageLink}/:manga_slug/read/v/:volume_number/c/:chapter_number`}
					element={<MangaReaderPage />}
				></Route>
			</Route>
			<Route
				path={`${RanobeIndexPageLink}/:ranobe_slug/read`}
				element={<ReaderContextProvider><ReaderNavigationContextProvider><Outlet /></ReaderNavigationContextProvider></ReaderContextProvider>}
			>
				<Route
					path={`${RanobeIndexPageLink}/:ranobe_slug/read`}
					element={<RanobeReaderPage />}
				></Route>
				<Route
					path={`${RanobeIndexPageLink}/:ranobe_slug/read/v/:volume_number/c/:chapter_number`}
					element={<RanobeReaderPage />}
				></Route>
			</Route>
			{/* <Route path="/ranobe" element={<UnderDevelopmentPage />}></Route> */}
			{/* <Route path="/books" element={<UnderDevelopmentPage />}></Route> */}
			<Route path="*" element={<Navigate to={`${AnimeIndexPageLink}`} />} />
		</Route>
	)
);

export default function App()
{
    return (
		<RouterProvider router={router} />
	)
}
