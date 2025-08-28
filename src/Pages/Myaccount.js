import React from 'react'
import Img1 from '../assets/images/1.jpg'
import Header from '../Components/Header';

function Myaccount() {
    return (
        <div className='page'>
            <Header/>
            <div className='body'>
                <h1>My Account</h1>
                <div className='form'>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-12'>
                                <label>Name*</label>
                                <input type='text' placeholder='Enter Name' />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-12'>
                                <label>Email*</label>
                                <input type='text' placeholder='Enter Name' />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-12'>
                                <label>Mobile no*</label>
                                <input type='text' placeholder='Enter Name' />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-12'>
                                <label>Sex*</label>
                                <select>
                                    <option>Select Suplier</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>
                        </div>
                        <div id='form-rows' className='col-16'>
                            <label>Profile Image*</label>
                            <div className='filepicker'>
                                <input type='text' placeholder='Enter Name' />
                                <button>Browse</button>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-12'>
                                <img src={Img1} width={120} height={120} alt='' />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-4'>
                                <div className='form-btns'>
                                    <button className='btn bg-success text-light'>Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Myaccount