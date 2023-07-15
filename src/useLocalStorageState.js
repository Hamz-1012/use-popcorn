import { useEffect, useState } from 'react';

export function useLocalStorageState ( initialState, key )
{
    const [ value, setValue ] = useState( function ()
    {
        const localData = localStorage.getItem( key );
        return localData ? JSON.parse( localData ) : initialState;
    } );

    useEffect(
        function ()
        {
            localStorage.setItem( key, JSON.stringify( value ) );
        },
        [ value, key ]
    );

    return [ value, setValue ];
}


