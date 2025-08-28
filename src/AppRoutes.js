import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './Components/Sidebar'
import Dashboard from './Pages/Dashboard'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'; import './Css/Page.css'
import Services from './Pages/Services'
import SubService from './Pages/SubService';
import Product from './Pages/Product';
import Customer from './Pages/Customer';
import Suplier from './Pages/Suplier';
import Staff from './Pages/Staff';
import Freelancer from './Pages/Freelancer';
import Bookings from './Pages/Bookings';
import Plans from './Pages/Plans';
import Earnings from './Pages/Earnings';
import SpecialOffers from './Pages/SpecialOffers';
import Faq from './Pages/Faq';
import Complaint from './Pages/Complaint';
import Testimonials from './Pages/Testimonials';
import Subscribers from './Pages/Subscribers';
import Pages from './Pages/Pages';
import Myaccount from './Pages/Myaccount';
import Aboutme from './Pages/Aboutme';
import MyServices from './Pages/Supplier/MyServices';
import SupplierDash from './Pages/Supplier/SupplierDash';
import Payments from './Pages/Payments';
import ViewEarning from './Pages/Supplier/ViewEarning';
import ViewComplaint from './Pages/Supplier/ViewComplaint';
import ManageAvaibility from './Pages/Supplier/ManageAvaibility';
import Login from './Auth/Login';
import SendNotificaion from './Pages/SendNotificaion';
import SupplierSidebar from './Components/SupplierSidebar';
import TermsAndCondition from './Pages/TermsAndCondition';
import PrivacyAndPolicy from './Pages/PrivacyAndPolicy';
import Blog from './Pages/Blog';
// import NotifySender from './Pages/NotifySender';
// import Sub_service from './Pages/Sub_service'

function AppRoutes({ isLoggedIn, setIsLoggedIn, role, setRole }) {
    const navigate = useNavigate();

    const handleLogin = () => {
        setIsLoggedIn(true);
        const savedRole = localStorage.getItem('role') || '';
        setRole(savedRole);
        localStorage.setItem('isLoggedIn', 'true');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setRole('');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('role');
        navigate('/'); // ✅ Redirect to login page
    };

    return (
        <div className='page_container'>
            <div className='content'>
                {/* {isLoggedIn && <Sidebar onLogout={handleLogout} />}
          <SupplierSidebar /> */}
                {isLoggedIn && role === 'admin' && <Sidebar onLogout={handleLogout} />}
                {isLoggedIn && role === 'supplier' && <SupplierSidebar onLogout={handleLogout} />}
                <Routes>
                    <Route path="/" element={isLoggedIn ? <Navigate to={role === 'supplier' ? '/SupplierDash' : '/dashboard'} /> : <Login onLogin={handleLogin} />} />
                    <Route
                        path="/Bookings"
                        element={isLoggedIn ? <Bookings /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/Earnings"
                        element={isLoggedIn ? <Earnings /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/Staff"
                        element={isLoggedIn ? <Staff /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/Complaint"
                        element={isLoggedIn ? <Complaint /> : <Navigate to="/" />}
                    />
                    {role === 'admin' && (
                        <>

                            <Route
                                path="/dashboard"
                                element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/Services"
                                element={isLoggedIn ? <Services /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/SubService"
                                element={isLoggedIn ? <SubService /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/Customer"
                                element={isLoggedIn ? <Customer /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/Suplier"
                                element={isLoggedIn ? <Suplier /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/Freelancer"
                                element={isLoggedIn ? <Freelancer /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/Bookings"
                                element={isLoggedIn ? <Bookings /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/SpecialOffers"
                                element={isLoggedIn ? <SpecialOffers /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/SendNotificaion"
                                element={isLoggedIn ? <SendNotificaion /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/Faq"
                                element={isLoggedIn ? <Faq /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/Testimonials"
                                element={isLoggedIn ? <Testimonials /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/Subscribers"
                                element={isLoggedIn ? <Subscribers /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/PrivacyAndPolicy"
                                element={isLoggedIn ? <PrivacyAndPolicy /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/TermsAndCondition"
                                element={isLoggedIn ? <TermsAndCondition /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/Blog"
                                element={isLoggedIn ? <Blog /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/Pages"
                                element={isLoggedIn ? <Pages /> : <Navigate to="/" />}
                            />

                        </>
                    )}

                    {role === 'supplier' && (
                        <>
                            <Route
                                path="/Myaccount"
                                element={isLoggedIn ? <Myaccount /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/Aboutme"
                                element={isLoggedIn ? <Aboutme /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/SupplierDash"
                                element={isLoggedIn ? <SupplierDash /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/MyServices"
                                element={isLoggedIn ? <MyServices /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/Payments"
                                element={isLoggedIn ? <Payments /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/ViewEarning"
                                element={isLoggedIn ? <ViewEarning /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/ViewComplaint"
                                element={isLoggedIn ? <ViewComplaint /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/ManageAvaibility"
                                element={isLoggedIn ? <ManageAvaibility /> : <Navigate to="/" />}
                            />
                        </>
                    )}

                    <Route path='/Product' Component={Product} />
                    <Route path='/Plans' Component={Plans} />
                    {/* <Route path='/Sub_service' Component={Sub_service} /> */}
                </Routes>
            </div>
        </div>
    )
}

export default AppRoutes