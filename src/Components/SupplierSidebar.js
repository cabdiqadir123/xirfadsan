import React from 'react'
import '../Css/sidebar.css'
import { GrAchievement, GrCompliance, GrPlan, GrServices, GrUserWorker } from 'react-icons/gr'
import {BiSolidDashboard } from 'react-icons/bi'
import { TbBrandBooking } from 'react-icons/tb'
import { Link } from 'react-router-dom'
import { Logout } from '@mui/icons-material'

function SupplierSidebar({onLogout}) {

  return (
    <div className='sidebar'>
      <div className='logo-sidebar'>
        Logo place
      </div>
      <div className='sidebar-menu'>
        <ul>
          <Link to={'SupplierDash'} className='sidebar-link'>
            <li><BiSolidDashboard className='icon-sidebar' /> Dashboard</li>
          </Link>
          <Link to={'Staff'} className='sidebar-link'><li><GrUserWorker className='icon-sidebar' /> Staff Member</li></Link>
          <Link to={'MyServices'} className='sidebar-link'><li><GrServices className='icon-sidebar' /> My services</li></Link>
          <Link to={'ManageAvaibility'} className='sidebar-link'><li><GrAchievement className='icon-sidebar' /> Manage Avaibility</li></Link>
          <Link to={'Bookings'} className='sidebar-link'><li><TbBrandBooking className='icon-sidebar' /> Bookings</li></Link>
          <Link to={'ViewEarning'} className='sidebar-link'><li><GrPlan className='icon-sidebar' /> Earnings</li></Link>
          {/* <Link to={'Payments'} className='sidebar-link'><li><GrTest className='icon-sidebar' /> Payments</li></Link> */}
          <Link to={'Complaint'} className='sidebar-link'><li><GrCompliance className='icon-sidebar' /> Complaint</li></Link>
          <li onClick={onLogout}><Logout className='icon-sidebar' /> Logout</li>
        </ul>
      </div>
    </div>
  )
}

export default SupplierSidebar