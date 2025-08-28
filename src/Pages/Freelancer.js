import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';
import Header from '../Components/Header';

function Freelancer() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(true);

    const [data, setdata] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setitemsPerPage] = useState(5);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = data.slice(indexOfFirstItem, indexOfLastItem);
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [password] = useState('123');
    const [phone, setphone] = useState("");
    const [role] = useState("Freelancer");
    const [sex, setsex] = useState("");
    const [image, setimage] = useState("");
    const [status] = useState("Active");
    const [sub_service_id, setsub_service_id] = useState("");
    const [supplier_id, setsupplier_id] = useState("");
    const [user_id, setuser_id] = useState("");


    function hideform_action() {
        if (hideform === true) {
            sethideform(false)
        } else {
            sethideform(true)
        }
    }

    const [sub_servicedata, setsub_servicedata] = useState([]);
    const fetch_subservice_data = async () => {
        const rptdata = await axios.get("/api/subservices/all");
        const resltdata = rptdata.data;
        setsub_servicedata(resltdata);
    };

    const [supplierdata, setsupplierdata] = useState([]);
    const fetch_supplier_data = async () => {
        const rptdata = await axios.get("/api/supplier/all");
        const resltdata = rptdata.data;
        setsupplierdata(resltdata);
    };

    const fetchdata = async () => {
        fetch('/api/freelancer/all')
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
        fetch_subservice_data();
        fetch_supplier_data();
        console.log(user_id);
    }, []);

    const handleFileChange = (e) => {
        setimage(e.target.files[0]);
    };

    const insertuser = async () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phone', phone);
        formData.append('sex', sex);
        formData.append('role', role);
        formData.append('status', status);
        formData.append('image', image);
        try {
            const num = /^[0-9\b]+$/;
            if (!num.test(phone)) {
                alert("Tell text-flied only allawed for number ")
            } else {
                const response = await axios.post('/api/user/add', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log(response);
            }
            alert('Image uploaded successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        }
    };

    const handler = async (e) => {
        try {
            const num = /^[0-9\b]+$/;
            insertuser();
            if (!num.test(phone)) {
                alert("Tell text-flied only allawed for number ")
            } else {
                setuser_id(name);
                alert(name);
                await axios.post("/api/freelancer/add", {
                    name,
                    supplier_id,
                    sub_service_id
                });
            }
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
                    <h1>Freelancer</h1>
                    <button onClick={hideform_action}>New</button>
                </div>
                {hideform && <form className='form' onSubmit={handler}>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Full Name*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setname(e.target.value)} />
                            </div>
                            <div className='col-6'>
                                <label>Sex*</label>
                                <select onChange={(e) => setsex(e.target.value)}>
                                    <option value="" disabled className='form-select-placeholder'>Select Sex</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Email*</label>
                                <input type='text' placeholder='Enter Mobile No' onChange={(e) => setemail(e.target.value)} />
                            </div>
                            <div className='col-6'>
                                <label>Mobile No*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setphone(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Supplier*</label>
                                <select onChange={(e) => setsupplier_id(e.target.value)}>
                                    <option value="" disabled>Select Supplier</option>
                                    {supplierdata.map((item) => (
                                        <option>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='col-6'>
                                <label>Sub Service*</label>
                                <select onChange={(e) => setsub_service_id(e.target.value)}>
                                    <option value="" disabled>Select Sub Service</option>
                                    {sub_servicedata.map((item) => (
                                        <option>{item.sub_service}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Profile Image*</label>
                                <div className='filepicker'>
                                    <input type='text' placeholder='Enter Name' value={image} />
                                    <input type='file' className='input-file-picker' onChange={handleFileChange} />
                                </div>
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
                        <input type='text' placeholder='Enter Name' onChange={(e) => setname(e.target.value)} required />
                    </div>
                </div>
                <div className='table-section'>
                    <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Profile Image</th>
                                <th>Freelancer Name</th>
                                <th>Email</th>
                                <th>Mobile No</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.freelancer_id}</td>
                                    <td>
                                        <img
                                            src={`/api/freelancer/image/${item.user_id}`}
                                            width={70} alt=''
                                        />
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.email}</td>
                                    <td>{item.phone}</td>
                                    <td>
                                        <div className='status-table-act'>
                                            <button className='status-table-btns-act'>Actice</button>
                                        </div>
                                    </td>
                                    {/* <td>
                                        <div className='status-table-inact'>
                                            <button className='status-table-btns-inact'>Inactice</button>
                                        </div>
                                    </td> */}
                                    <td>
                                        <div className='table-action-btns'>
                                            <button id='btn-table-edit' className='btn text-success'><BiEdit /></button>
                                            <button onClick={async (e) => {
                                                const freelancer_id = item.freelancer_id;
                                                await axios.post("/api/freelancer/delete", {
                                                    freelancer_id
                                                });
                                                fetchdata();
                                            }} id='btn-table-delete' className='btn text-danger'><BiTrash /></button>
                                        </div>
                                    </td>
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
            </div>
        </div>
    )
}

export default Freelancer