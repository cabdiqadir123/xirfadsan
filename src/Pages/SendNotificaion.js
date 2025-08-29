import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';
import Select from 'react-select';
import Header from '../Components/Header';

function SendNotificaion() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(true);

    const [usertoken, setusertoken] = useState("");

    const [data, setdata] = useState([]);

    const [user_id, setuser_id] = useState("0");
    const [recipient_role, setrecipient_role] = useState("");
    const [title, settitle] = useState("");
    const [message, setmessage] = useState("");
    const [hasButton, sethasButton] = useState("");
    const [hasBook_id] = useState(0);
    const [from_type] = useState("Admin");
    const [from_id, setfrom_id] = useState();
    const [hasBook_started] = useState("notPending");

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

    const [isCheckedYes, setisCheckedYes] = useState(false);
    const [isCheckedNo, setIsCheckedNo] = useState(false);

    const handleYesClick = (e) => {
        e.preventDefault();
        setisCheckedYes(true);
        setIsCheckedNo(false);
        sethasButton("Yes");
    };

    const handleNoClick = (e) => {
        e.preventDefault();
        setisCheckedYes(false);
        setIsCheckedNo(true);
        sethasButton("No");
    };


    const [userdata, setuserdata] = useState([]);
    const fetch_userdata_data = async (id) => {
        const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/user/userrole/all/" + id);
        const resltdata = rptdata.data;
        setuserdata(resltdata);
    };

    const fetchdata = async () => {
        fetch('https://back-end-for-xirfadsan.onrender.com/api/notification/all')
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
        const storeduserID = localStorage.getItem('userID');
        setfrom_id(storeduserID || '');
        fetchdata();
    }, []);

    const [searchItem, setSearchItem] = useState('');

    const filteredData = data.filter(item =>
        item.recipient_role.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.notification_id.toString().includes(searchItem)
    );
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const handleuseridChange = (e) => {
        fetch_userdata_data(e.target.value);
        setrecipient_role(e.target.value);
    };

    const options = userdata.map((user) => ({
        value: user.token,
        label: user.name,
        name: user.id,
    }));

    const handleChange = (selectedOption) => {
        setusertoken(selectedOption.value);
        setuser_id(selectedOption.name);
    };

    const Send_notificaion_function = async (e) => {
        if (usertoken !== "") {
            try {
                const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/send/send-data', { // change to your actual backend URL
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: title,
                        body: message,
                        token: usertoken,
                    }),
                });
                const data = await response.json();
                console.log('Notification Response:', data);
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        } else {
            try {
                const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/send/send-data-to-all', { // change to your actual backend URL
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: title,
                        body: message,
                        role: recipient_role,
                    }),
                });
                const data = await response.json();
                console.log('Notification Response:', data);
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        }
    }

    const handler = async (e) => {
        Send_notificaion_function();
        try {
            await axios.post("https://back-end-for-xirfadsan.onrender.com/api/notification/add", {
                from_type,
                from_id,
                recipient_role,
                user_id,
                title,
                message,
                hasButton,
                hasBook_id,
                hasBook_started
            });
        } catch (errr) {
            console.log("error jiro");
        }
    };

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
                    <h1>Send Notificaion</h1>
                    <button onClick={hideform_action}>New</button>
                </div>
                {hideform && <form className='form' onSubmit={handler}>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-4'>
                                <label>Select User Typer*</label>
                                <select onChange={handleuseridChange}>
                                    <option>Select User Typer</option>
                                    <option>Customer</option>
                                    <option>Supplier</option>
                                    <option>Staff</option>
                                    <option>freelancer</option>
                                </select>
                            </div>
                            <div className='col-2'>
                                <label>Has Button*</label>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}>
                                    <div style={{
                                        display: "flex",
                                    }}>
                                        <button onClick={handleYesClick} style={{ marginRight: "10px" }}>Yes</button>
                                        <input type="checkbox" checked={isCheckedYes} />
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        gap: "10px"
                                    }}>
                                        <button onClick={handleNoClick}>No</button>
                                        <input type="checkbox" checked={isCheckedNo} />
                                    </div>
                                </div>
                            </div>
                            <div className='col-6'>
                                <label>Select user*</label>
                                <Select
                                    options={options}
                                    onChange={handleChange}
                                    placeholder="Search and select user..."
                                    isSearchable
                                />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-4'>
                                <label>Title*</label>
                                <input type='text' placeholder='Enter Title' onChange={(e) => settitle(e.target.value)} />
                            </div>
                            <div className='col-8'>
                                <label>Massage*</label>
                                <input type='text' placeholder='Enter Massage' onChange={(e) => setmessage(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-4'>
                                <div className='form-btns'>
                                    <button className='btn bg-success text-light'>Submit</button>
                                    <button className='btn bg-danger text-light'>Cancel</button>
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
                        <input type='text' placeholder='Enter Name' onChange={(e) => setSearchItem(e.target.value)} required />
                    </div>
                </div>

                {filteredData.length === 0 || data.length === 0 ? <p>No data</p> :
                    <div className='table-section'>
                        <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Title</th>
                                    <th>Massage</th>
                                    {/* <th>Actions</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item) => (
                                    <tr key={item.notification_id}>
                                        <td>{item.notification_id}</td>
                                        <td>{item.recipient_role}</td>
                                        <td>{item.title}</td>
                                        <td>{item.message}</td>
                                        {/* <td>
                                            <div className='table-action-btns'>
                                                <button id='btn-table-edit' className='btn text-success'><BiEdit /></button>
                                                <button onClick={async (e) => {
                                                    const notification_id = item.notification_id;
                                                    await axios.post("https://back-end-for-xirfadsan.onrender.com/api/notification/delete", {
                                                        notification_id
                                                    });
                                                    fetchdata();
                                                }} id='btn-table-delete' className='btn text-danger'><BiTrash /></button>
                                            </div>
                                        </td> */}
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

export default SendNotificaion