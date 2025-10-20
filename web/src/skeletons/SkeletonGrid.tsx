import { useState, useEffect } from 'react'
import { calculateColumnCount } from '../tools/general'
import SkeletonCard from './SkeletonCard'

function SkeletonGrid()
{
    const [columnsCount, setColumnsCount] = useState( calculateColumnCount() )
    
    useEffect(
        () => {
            window.addEventListener('resize', () => setColumnsCount( calculateColumnCount() ))
            return () => {
                window.removeEventListener('resize', () => setColumnsCount( calculateColumnCount() ))
            }
        },
        []
    )

    return (
        <div className={`grid w-full max-w-screen-2xl grid-cols-${columnsCount} gap-6 animate-pulse`} >
            { [...Array(columnsCount)].map( (_,index) => { return (
                <SkeletonCard key={index}/>
            ) } ) }
        </div>
    )
}

export default SkeletonGrid