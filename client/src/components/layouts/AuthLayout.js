import React from 'react';
import Header from '../Header';
import Footer from "../Footer";

const AuthLayout = ({children}) => {
    //AuthLayout can possibly contain the middle ware? idk why we need a separate one.
    return (
        <>
            <Header />
            <div id="auth-layout-container">
                {children}
            </div>
            <Footer />
        </>
    )
}

export default AuthLayout;