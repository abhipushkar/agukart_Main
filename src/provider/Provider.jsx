import Header from 'components/header/header'
import { Navbar } from 'components/navbar'
import RTL from 'components/rtl/RTL'
import Sticky from 'components/sticky/Sticky'
import Topbar from 'components/topbar/top-bar'
import AuthContextProvider from 'contexts/AuthContext'
import { MainProvider } from 'contexts/Main.Context'
import React, { useCallback, useState } from 'react'
import ProgressBar from "components/progress";
import { ToastContainer } from 'react-toastify'
import ThemeProvider from 'theme/theme-provider'
import CartProvider from 'contexts/CartContext'
import SettingsProvider from 'contexts/SettingContext'
import { MobileNavigationBar } from 'components/mobile-navigation'
import { Footer1 } from 'components/footer'
import { GoogleAnalytics } from '@next/third-parties/google'
import { SearchInputWithCategory } from 'components/search-box'
import CurrencyProvider from 'contexts/CurrencyContext'


function Provider({ children }) {
    const [isFixed, setIsFixed] = useState(false);
    const toggleIsFixed = useCallback(fixed => setIsFixed(fixed), []);
    return (
        <>
            <CurrencyProvider>
                <CartProvider>
                    <SettingsProvider>
                        <ThemeProvider>
                            <RTL>
                                <ProgressBar />
                                <Topbar>
                                    <Sticky fixedOn={0} onSticky={toggleIsFixed} scrollDistance={300}>
                                        <Header isFixed={isFixed} midSlot={<SearchInputWithCategory />} />
                                    </Sticky>
                                    <Navbar elevation={0} border={1} />
                                    <AuthContextProvider>
                                        <MainProvider>
                                            {children}
                                        </MainProvider>
                                        <ToastContainer />
                                    </AuthContextProvider>
                                </Topbar>
                            </RTL>
                        </ThemeProvider>
                    </SettingsProvider>
                </CartProvider>
            </CurrencyProvider>

            <Footer1 />
            <GoogleAnalytics gaId="G-XKPD36JXY0" />
        </>

    )
}

export default Provider