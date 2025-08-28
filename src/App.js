// App.js
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import './Css/Page.css';
import './Css/form.css';
import './Css/Table.css';
import AppRoutes from './AppRoutes'; // create this component

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedRole = localStorage.getItem('role') || '';
    setIsLoggedIn(loggedIn);
    setRole(savedRole);
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <Router>
      <AppRoutes isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} role={role} setRole={setRole} />
    </Router>
  );
}

export default App;
