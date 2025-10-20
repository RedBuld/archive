import { createContext, useState } from 'react'

const emptyBg = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

export interface AppContextType{
    bgImg: string
    setBgImg: Function,
    resetBgImg: Function,
}

export const AppContext = createContext<AppContextType>({
    bgImg: emptyBg,
    setBgImg: (url: string) => { url },
    resetBgImg: () => {},
})

export function AppContextProvider(props: any)
{
    function setBgImg(url: string)
    {
        if( url != appContext.bgImg )
        {
            setState({ ...appContext, 'bgImg': url })
        }
    }
    
    function resetBgImg()
    {
        setState({ ...appContext, 'bgImg': 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' })
    }

    const [appContext, setState] = useState<AppContextType>({
        bgImg: emptyBg,
        setBgImg: setBgImg,
        resetBgImg: resetBgImg,
    })
  
    return (
        <AppContext.Provider value={appContext}>
            {props.children}
        </AppContext.Provider>
    )
}