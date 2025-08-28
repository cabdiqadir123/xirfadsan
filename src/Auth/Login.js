import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import '../Css/Login.css'
import 'bootstrap/dist/css/bootstrap.css';
import Carousel from 'react-bootstrap/Carousel';
import Img1 from '../assets/images/img1.jpg';
import Img2 from '../assets/images/img3.jpg';
import Img3 from '../assets/images/img4.jpg';
// import { PiLock } from 'react-icons/pi'

function Login({ onLogin }) {
    const [phone, setphone] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const [isloading,setisloading]=useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setisloading(true);
            const response = await fetch('/api/user/login', { // change to your actual backend URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: phone,
                    password: password,
                }),
            });
            if (response.status === 200) {
                // onLogin();
                const data = await response.json();
                if (data.role === "Supplier") {
                    localStorage.setItem("role", "supplier");
                    localStorage.setItem('username', data.name);
                    localStorage.setItem('userID', data.id);
                    setisloading(false);
                    onLogin();
                    navigate("/SupplierDash");
                } else if (data.role === "Admin") {
                    localStorage.setItem("role", "admin");
                    localStorage.setItem('username', data.name);
                    localStorage.setItem('userID', data.id);
                    onLogin();
                    navigate("/dashboard");
                    setisloading(false);
                }
            } else if (response.status === 201) {
                const data = await response.json();
                alert(data.message);
                setisloading(false);
            }
            else {
                const data = await response.json();
                alert(data.message);
                setisloading(false);
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            alert(error);
        }
    };

    return (
        <div className='login'>
            <div className='login-carousel'>
                <Carousel controls={false} indicators={false}>
                    <Carousel.Item interval={1300}>
                        <img
                            src={Img1}
                            alt=''
                        />
                    </Carousel.Item>
                    <Carousel.Item interval={1300}>
                        <img
                            src={Img2}
                            alt=''
                        />
                    </Carousel.Item>
                    <Carousel.Item interval={1300}>
                        <img
                            src={Img3}
                            alt=''
                        />
                    </Carousel.Item>
                </Carousel>
            </div>
            <div className='login-info'>
                <div className='login-logo'>

                </div>
                <h2>Technicion provider</h2>
                <form className='login-form'>
                    <label>Enter your email</label>
                    <input type='text' placeholder='Example@gmail.com' onChange={(e) => setphone(e.target.value)} />
                    <label>Enter your password</label>
                    <input type='password' placeholder='Example@gmail.com' onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={handleLogin}> {isloading? "logining" : "login"}</button>
                </form>
            </div>
        </div>
    )
}

export default Login