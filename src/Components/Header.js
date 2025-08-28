import React, { useEffect, useState } from 'react';
import { GrLogout, GrMenu, GrNotification, GrUserSettings } from 'react-icons/gr';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const [role, setRole] = useState('');
  const [username, setUsername] = useState('');
  const [userID, setuserID] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('username');
    const storeduserID = localStorage.getItem('userID');
    setRole(storedRole || '');
    setUsername(storedUsername || '');
    setuserID(storeduserID || '');
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className='top-header'>
      <h1><GrMenu /> {role === 'supplier' ? 'Supplier' : 'Admin'}</h1>
      <ul>
        <Link to='/Home'>
          <li className='text-primary' style={{ fontSize: "20px", fontWeight: "bolder" }}>
            <GrNotification />
          </li>
        </Link>
        <li>
          <div className='userinfo_section'>
            <span style={{ fontWeight: "normal" }}>Hello</span>
            <span>, {username}</span>
          </div>
        </li>
        <li>
          <div className='profile-image'>
            <img
              src={`http://localhost:5000/api/user/image/${userID}`}
              width={70} alt=''
            />
          </div>
          <ul>
            <Link className='sidebar-link' to='/Aboutme'>
              <li><GrUserSettings /> About me</li>
            </Link>
            <li onClick={handleLogout} className='sidebar-link' style={{ cursor: 'pointer' }}>
              <GrLogout /> Logout
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
}

export default Header;
