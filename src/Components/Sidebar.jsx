import React, { useState } from 'react'
import '../Css/sidebar.css'
import { ArrowRight, Feedback, Logout, NotificationAddRounded, Pages, Subscriptions } from '@mui/icons-material'
import { GrPlan, GrTest } from 'react-icons/gr'
import { BiSolidDashboard, BiUserPlus, BiUserVoice } from 'react-icons/bi'
import { TbBrandBooking } from 'react-icons/tb'
import { PiFlagBanner } from 'react-icons/pi'
import { FaQ } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import Logo from '../assets/logo/horizantal logo icon-01.png'

function Sidebar({onLogout}) {
  const [submenu1, setsubmenu1] = useState(false);
  const [submenu2, setsubmenu2] = useState(false);
  const [submenu3, setsubmenu3] = useState(false);

  function submenu1_action() {
    if (submenu1 === true) {
      setsubmenu1(false)
    } else {
      setsubmenu1(true)
    }
  }

  function submenu2_action() {
    if (submenu2 === true) {
      setsubmenu2(false)
    } else {
      setsubmenu2(true)
    }
  }

  function submenu3_action() {
    if (submenu3 === true) {
      setsubmenu3(false)
    } else {
      setsubmenu3(true)
    }
  }

  return (
    <div className='sidebar'>
      <div className='logo-sidebar'>
        <img src={Logo} alt='' />
      </div>
      <div className='sidebar-menu'>
        <ul>
          <Link to={'Dashboard'} className='sidebar-link'>
            <li><BiSolidDashboard className='icon-sidebar' /> Dashboard</li>
          </Link>
          <li onClick={submenu1_action}><BiUserVoice className='icon-sidebar' /> Service Management <ArrowRight /></li>
          {submenu1 && <div className='sidebar-submenu'>
            <ul>
              <Link to={'Services'} className='sidebar-link'>
                <li> Services</li>
              </Link>
              <Link to={'SubService'} className='sidebar-link'>
                <li> Sub Service</li>
              </Link>
              {/* <Link to={'Product'} className='sidebar-link'>
                <li> Product</li>
              </Link> */}
              {/* <Link to={'Units'} className='sidebar-link'>
                <li> Units</li>
              </Link> */}
            </ul>
          </div>}
          <li onClick={submenu2_action}><BiUserPlus className='icon-sidebar' /> Users Management <ArrowRight /></li>
          {submenu2 && <div className='sidebar-submenu'>
            <ul>
              <Link to={'Customer'} className='sidebar-link'>
                <li> Customers</li>
              </Link>
              {/* <Link to={'Suplier'} className='sidebar-link'>
                <li> Supliers</li>
              </Link> */}
              <Link to={'Staff'} className='sidebar-link'>
                <li> Staff Member</li>
              </Link>
              {/* <Link to={'Freelancer'} className='sidebar-link'>
                <li> Freelancer</li>
              </Link> */}
            </ul>
          </div>}
          {/* <Link to={'Service_requests'} className='sidebar-link'><li><RiCustomerServiceFill className='icon-sidebar' /> Service Request</li></Link> */}
          <Link to={'Bookings'} className='sidebar-link'><li><TbBrandBooking className='icon-sidebar' /> Bookings</li></Link>
          {/* <Link to={'Plans'} className='sidebar-link'><li><GrPlan className='icon-sidebar' /> Plans</li></Link> */}
          <Link to={'Earnings'} className='sidebar-link'><li><GrPlan className='icon-sidebar' /> Earnings</li></Link>
          <Link to={'SpecialOffers'} className='sidebar-link'><li><PiFlagBanner className='icon-sidebar' /> Special Offers</li></Link>
          <Link to={'SendNotificaion'} className='sidebar-link'><li><NotificationAddRounded className='icon-sidebar' /> Send notifiction</li></Link>
          <Link to={'Faq'} className='sidebar-link'><li><FaQ className='icon-sidebar' /> Faq</li></Link>
          <Link to={'Complaint'} className='sidebar-link'><li><Feedback className='icon-sidebar' /> Complaint</li></Link>
          <Link to={'Testimonials'} className='sidebar-link'><li><GrTest className='icon-sidebar' /> Testmonials</li></Link>
          <Link to={'Subscribers'} className='sidebar-link'><li><Subscriptions className='icon-sidebar' /> Subscribers</li></Link>
          <li onClick={submenu3_action}><Pages className='icon-sidebar' /> Pages <ArrowRight /></li>
          {submenu3 && <div className='sidebar-submenu'>
            <ul>
              <Link to={'TermsAndCondition'} className='sidebar-link'>
                <li> Terms & Condition</li>
              </Link>
              <Link to={'PrivacyAndPolicy'} className='sidebar-link'>
                <li> Privacy Policy</li>
              </Link>
              <Link to={'Blog'} className='sidebar-link'>
                <li> Blog</li>
              </Link>
            </ul>
          </div>}
          <li onClick={onLogout}><Logout className='icon-sidebar' /> Logout</li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar