import { useContext, useEffect, useState } from 'react'
import { Outlet, NavLink } from 'react-router'
import { AppContext } from '../contexts/AppContext'
import GlobalSearch from '../components/ui/GlobalSearch'
import { Menu, Info } from '../icons'
// import Notifications from './Notifications'

// export const metadata = {
//   title: "Архив",
// };
// const gridPrefiller = ["grid-cols-1","grid-cols-2","grid-cols-3","grid-cols-4","grid-cols-5","grid-cols-6","grid-cols-7","grid-cols-8","grid-cols-9","grid-cols-10","grid-cols-11","grid-cols-12"]

export default function AppLayout()
{
    const mobile_base_link_style = "inline-flex px-4 py-3 text-sm font-medium text-white"
    const mobile_active_link_style = "bg-sky-600/50"
    // 
    const base_link_style = "inline-flex items-center justify-center basis-24 px-4 py-4 text-sm font-medium text-white"
    const active_link_style = "bg-sky-600/70 shadow-inner shadow-sky-900"
    const inactive_link_style = "hover:bg-sky-600/40 text-white/80 hover:shadow-inner hover:shadow-sky-900/70"
    const disabled_link_style = "text-white/50"

    const [scrolled, setScrolled] = useState<boolean>(false)
    const [sidebar, setSidebar] = useState<boolean>(false)
    const appContext = useContext(AppContext)

    function detectScrolled()
    {
        setScrolled( window.scrollY > 10 )
    }

    function toggleSidebar()
    {
        setSidebar( !sidebar )
    }
    
    useEffect(
        () => {
            window.addEventListener('scroll', detectScrolled);
            return () => {
                window.removeEventListener('scroll', detectScrolled);
            }
        },
        []
    )

    return (
        <>
            <div className={`fixed z-[15] flex flex-col min-w-[50%] max-w-[75%] h-screen overflow-hidden bg-zinc-900/90 group transition-all backdrop-blur-md duration-300 ${sidebar ? '-translate-x-0 shadow-lg-r' : '-translate-x-full'}`}>
                <div className="flex flex-col space-y-3">
                    <NavLink onClick={ () => setSidebar(false) } to="/anime" className={ ({isActive}) => `${mobile_base_link_style} ${isActive ? mobile_active_link_style : inactive_link_style}`}>Аниме</NavLink>
                    <NavLink onClick={ () => setSidebar(false) } to="/manga" className={ ({isActive}) => `${mobile_base_link_style} ${isActive ? mobile_active_link_style : inactive_link_style}`}>Манга</NavLink>
                    <NavLink onClick={ () => setSidebar(false) } to="/ranobe" className={ ({isActive}) => `${mobile_base_link_style} ${isActive ? mobile_active_link_style : inactive_link_style}`}>Ранобэ</NavLink>
                    <span className={`${mobile_base_link_style} ${disabled_link_style}`}>Книги</span>
                </div>
            </div>
            <div
                onClick={toggleSidebar}
                className={`fixed z-[14] top-0 left-0 w-screen h-screen bg-zinc-900/50 backdrop-blur-xs duration-300 transition-opacity ${sidebar ? 'opacity-100': 'opacity-0 pointer-events-none'}`}
            ></div>
            <div className={`flex flex-col w-full ${scrolled?'bg-black/50':'bg-black/10'} backdrop-blur fixed z-10 top-0 right-0 transition-colors`}>
                <div className="flex flex-row mx-auto w-full max-w-screen-2xl gap-3">
                    <button
                        onClick={toggleSidebar}
                        className={`inline-flex sm:hidden p-2`}
                    >
                        <span className="inline-flex w-8 h-8 text-white">
                            <Menu />
                        </span>
                    </button>
                    <div className="hidden sm:flex flex-row space-x-3 sm:max-w-1/2 mr-auto">
                        <NavLink to="/anime" className={ ({isActive}) => `${base_link_style} ${isActive ? active_link_style : inactive_link_style}`}>Аниме</NavLink>
                        <NavLink to="/manga" className={ ({isActive}) => `${base_link_style} ${isActive ? active_link_style : inactive_link_style}`}>Манга</NavLink>
                        <NavLink to="/ranobe" className={ ({isActive}) => `${base_link_style} ${isActive ? active_link_style : inactive_link_style}`}>Ранобэ</NavLink>
                        <span className={`${base_link_style} ${disabled_link_style}`}>Книги</span>
                    </div>
                    <div className="flex flex-grow"></div>
                    <GlobalSearch />
                    <NavLink to="/info" className={ ({isActive}) => `inline-flex p-2 sm:p-3 ${isActive ? `${active_link_style} text-white` : 'text-white/70 hover:text-white'}`} >
                        <span className="inline-flex w-8 sm:w-6 h-8 sm:h-6">
                            <Info />
                        </span>
                    </NavLink>
                </div>
            </div>
            <div className="h-[var(--navbar-height)] mb-[var(--navbar-margin)]"></div>
            {/* banner */}
            <div className="block absolute z-[-1] top-0 left-0 w-full h-[var(--overlay-height)]">
                <div className="banner-bg absolute top-0 left-0 w-full h-full bg-cover bg-sky-500 bg-[center_40%]" style={{'backgroundImage': `url("${appContext.bgImg}")`}}></div>
                <div className="hidden sm:block absolute top-0 left-0 w-full h-[var(--banner-blur-height)] backdrop-blur-sm bg-gradient-to-br from-zinc-900/80 from-30% to-zinc-900/30"></div>
                <div className="hidden sm:block absolute top-[var(--banner-blur-height)] left-0 w-full h-[var(--banner-backdrop-height)] backdrop-blur-lg bg-[center_top] banner-backdrop"></div>
                <div className="block sm:hidden absolute top-0 left-0 w-full h-[var(--overlay-height)] backdrop-blur-sm bg-gradient-to-b from-zinc-900/80 to-zinc-900 to-60%"></div>
            </div>
            <Outlet />
        </>
    );
}