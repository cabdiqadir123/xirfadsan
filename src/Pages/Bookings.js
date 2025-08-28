import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import Select from 'react-select';
import Header from '../Components/Header';

function Bookings() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(true);

    const [bookingStatus, setBookingStatus] = useState('');

    const [data, setdata] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setitemsPerPage] = useState(5);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const totalPages = Math.ceil(data.length / itemsPerPage);

    function hideform_action() {
        if (hideform === true) {
            sethideform(false)
        } else {
            sethideform(true)
        }
    }

    const [cusomerdata, setcusomerdata] = useState([]);
    const fetch_customer_data = async () => {
        const rptdata = await axios.get("/api/user/customer/all");
        const resltdata = rptdata.data;
        setcusomerdata(resltdata);
    };

    const [staffdata, setstaffdata] = useState([]);
    const fetch_staff_data = async () => {
        const rptdata = await axios.get("/api/staff/all");
        const resltdata = rptdata.data;
        setstaffdata(resltdata);
    };

    const fetchdata = async () => {
        fetch('/api/booking/all')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setdata(data); // Set the data to state
                setLoading(false); // Set loading to false after data is fetched
            })
            .catch(err => {
                setError(err.message); // Handle any errors
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchdata();
        fetch_customer_data();
        fetch_staff_data();
    }, []);

    const [user_id, setuser_id] = useState('');
    const [staff_id, setstaff_id] = useState('');

    const customer_options = cusomerdata.map((user) => ({
        value: user.id,
        label: user.name,
    }));

    const handlecustomerChange = (selectedOption) => {
        setuser_id(selectedOption.value);
    };

    const staff_options = staffdata.map((user) => ({
        value: user.staff_id,
        label: user.name,
    }));

    const handlestaffChange = (selectedOption) => {
        setstaff_id(selectedOption.value);
    };

    const [searchItem, setSearchItem] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredData = data.filter(item => {
        const matchesSearch =
            item.customer_name.toLowerCase().includes(searchItem.toLowerCase()) ||
            item.id.toString().includes(searchItem);

        const itemDate = new Date(item.created_at);
        const isWithinDateRange =
            (!startDate || new Date(startDate) <= itemDate) &&
            (!endDate || itemDate <= new Date(endDate));

        const matchesStatus =
            !bookingStatus || item.booking_status === bookingStatus;

        const matchesUser =
            !user_id || item.customer_id === user_id;

        const matchesStaff =
            !staff_id || item.staff_id === staff_id;

        return matchesSearch && isWithinDateRange && matchesStatus && matchesUser && matchesStaff;

    });

    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);


    const headers = ['Full Name', 'email', 'Mobile No'];

    const downloadCSV = () => {
        const csvRows = [];
        csvRows.push(headers.join(','));
        currentData.forEach(row => {
            csvRows.push([row.name, row.email, row.phone].join(','));
        });
        const csvData = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(csvData);
        link.download = 'Customer_data.csv';
        link.click();
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='page'>
            <Header/>
            <div className='body'>
                <div className='add-btn'>
                    <h1>Bookings</h1>
                    <button onClick={hideform_action}>New</button>
                </div>
                {hideform && <form className='form'>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-4'>
                                <label>Select Staff*</label>
                                <Select
                                    options={staff_options}
                                    onChange={handlestaffChange}
                                    value={staff_options.find(option => option.value === staff_id) || null}
                                    placeholder="Search and select user..."
                                    isSearchable
                                />
                            </div>
                            <div className='col-4'>
                                <label>Select Customer*</label>
                                <Select
                                    options={customer_options}
                                    onChange={handlecustomerChange}
                                    value={customer_options.find(option => option.value === user_id) || null}
                                    placeholder="Search and select user..."
                                    isSearchable
                                />
                            </div>
                            <div className='col-4'>
                                <label>Select Booking Status*</label>
                                <select value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)}>
                                    <option value="">Select Booking Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>From Date*</label>
                                <input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className='col-6'>
                                <label>To Date*</label>
                                <input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-4'>
                                <div className='form-btns'>
                                    <button onClick={() => {
                                        setSearchItem('');
                                        setStartDate('');
                                        setEndDate('');
                                        setBookingStatus('');
                                        setuser_id(NaN);
                                        setstaff_id(null)
                                    }} className='btn bg-danger text-light'>Reset</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>}
                <div className='search-section'>
                    <div className='page-num-change'>
                        <label>Show</label>
                        <select onChange={(e) => setitemsPerPage(e.target.value)}>
                            <option>5</option>
                            <option>10</option>
                            <option>15</option>
                        </select>
                        <label>Entries</label>
                    </div>
                    <div className='search'>
                        <label>Search</label>
                        <input type='text' onChange={(e) => setSearchItem(e.target.value)} placeholder='Enter Name' />
                    </div>
                </div>

                {filteredData.length === 0 || data.length === 0 ? <p>No data</p> :
                    <div className='table-section'>
                        <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>service_id</th>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                    <th>Staff</th>
                                    <th>EndTime</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.created_at}</td>
                                        <td>{item.service_id}</td>
                                        <td>{item.customer_name}</td>
                                        <td>{item.email}</td>
                                        <td>{item.phone}</td>
                                        <td>{item.booking_status}</td>
                                        <td>{item.amount}</td>
                                        <td>{item.staff_name}</td>
                                        <td>{item.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className='table-bottom'>
                            <p>Showing 1 to of {itemsPerPage} of {totalPages}</p>
                            <div className='table-print-section'>
                                <button onClick={downloadCSV}>CSV</button>
                                <button>Excel</button>
                                <button>PDF</button>
                                <button>Print</button>
                            </div>
                            <div className='table-pagenition'>
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className='btn-arrow-back'
                                >
                                    <ArrowBack />
                                </button>
                                <p>{currentPage}</p>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className='btn-arrow-forward'
                                ><ArrowForward />
                                </button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default Bookings