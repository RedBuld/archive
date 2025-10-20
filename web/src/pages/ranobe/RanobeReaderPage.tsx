import { lazy } from "react"

const RanobeReader = lazy( () => import('@/components/ranobe/reader/RanobeReader') )

export default function RanobeReaderPage()
{
    return ( <RanobeReader /> )
}