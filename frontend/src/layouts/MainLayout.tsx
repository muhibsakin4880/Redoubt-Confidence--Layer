import { Outlet, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MainLayout() {
    const location = useLocation()
    const isLandingPage = location.pathname === '/'

    return (
        <div className="flex flex-col min-h-screen">
            {!isLandingPage && <Header />}
            <main className={`flex-1 ${isLandingPage ? '' : 'pt-[88px]'}`}>
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
