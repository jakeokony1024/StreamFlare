import React from 'react';
import Header from '../'

const AuthLayout = ({children}) => {
    //AuthLayout can possibly contain the middle ware? idk why we need a separate one.
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    )
}

export default AuthLayout;