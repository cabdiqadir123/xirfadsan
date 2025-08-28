import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';
import Header from '../Components/Header';

function Customer() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(false);
    const [hideformtitle, sethideformtitle] = useState("Open");

    const [data, setdata] = useState([]);

    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [password, setpassword] = useState('name');
    const [phone, setphone] = useState("");
    const [address, setaddress] = useState();
    const [dof, setdof] = useState();
    const [role] = useState("customer");
    const [sex, setsex] = useState("");
    const [image, setimage] = useState("");
    const [status] = useState("Active");
    const [token] = useState("no token");

    const [selectedrowid, setselectedrowid] = useState("");

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
            sethideformtitle("Open");
        } else {
            sethideform(true)
            sethideformtitle("Close");
            setselectedrowid("");
        }
    }

    const fetchdata = async () => {
        fetch('https://back-end-for-xirfadsan.onrender.com/api/user/customer/all')
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
    }, []);

    const [searchItem, setSearchItem] = useState('');

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.id.toString().includes(searchItem)
    );
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const handleFileChange = (e) => {
        setimage(e.target.files[0]);
    };

    const handler = async () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('dof', dof);
        formData.append('sex', sex);
        formData.append('role', role);
        formData.append('status', status);
        formData.append('image', image);
        formData.append('token', token);
        try {
            const num = /^[0-9\b]+$/;
            if (!num.test(phone)) {
                alert("Tell text-flied only allawed for number ")
            } else {
                const response = await axios.post('https://back-end-for-xirfadsan.onrender.com/api/user/add', formData, {
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

    const handelupdate = async (e) => {

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('dof', dof);
        formData.append('sex', sex);
        formData.append('role', role);
        formData.append('status', status);

        // Append new image only if a new one is selected
        if (image instanceof File) {
            formData.append("image", image);
        }

        try {
            const response = await axios.put(`https://back-end-for-xirfadsan.onrender.com/api/user/update/${selectedrowid}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert(response.data);
        } catch (error) {
            console.error("Error updating discount:", error);
            alert("Failed to update discount");
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
                    <h1>Customer</h1>
                    <button onClick={hideform_action}>{hideformtitle}</button>
                </div>
                {hideform && <form className='form'>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Name*</label>
                                <input type='text' placeholder='Enter Name' value={name} onChange={(e) => setname(e.target.value)} required />
                            </div>
                            <div className='col-6'>
                                <label>Email*</label>
                                <input type='text' placeholder='Enter Name' value={email} onChange={(e) => setemail(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-3'>
                                <label>Mobile No*</label>
                                <input type='text' placeholder='Enter Name' value={phone} onChange={(e) => setphone(e.target.value)} />
                            </div>
                            <div className='col-3'>
                                <label>Sex*</label>
                                <select value={sex} onChange={(e) => setsex(e.target.value)}>
                                    <option>Select Sex</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>
                            <div className='col-6'>
                                <label> Address*</label>
                                <input type='text' placeholder='Enter Name' value={address} onChange={(e) => setaddress(e.target.value)} />
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
                            <div className='col-6'>
                                <label> DOF*</label>
                                <input type='date' value={address} onChange={(e) => setdof(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-4'>
                                <div className='form-btns'>
                                    <button onClick={handler} type="submit" className='btn bg-success text-light'>Submit</button>
                                    <button onClick={handelupdate} type="submit" className='btn bg-primary text-light'>Update</button>
                                    <button type='reset' className='btn bg-danger text-light'>Cancel</button>
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
                                    <th>Image</th>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Mobile No</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>
                                            <img
                                                src={`https://back-end-for-xirfadsan.onrender.com/api/user/customer/image/${item.id}`}
                                                width={70} alt=''
                                            />
                                        </td>
                                        <td>{item.name}</td>
                                        <td>{item.email}</td>
                                        <td>{item.phone}</td>
                                        <td>
                                            <div className='table-action-btns'>
                                                <button onClick={async (e) => {
                                                    const id = item.id;
                                                    setselectedrowid(id);
                                                    setname(item.name);
                                                    setemail(item.email);
                                                    setpassword(item.password);
                                                    setphone(item.phone);
                                                    setaddress(item.address);
                                                    setdof(item.dof);
                                                    sethideform(true);
                                                }} id='btn-table-edit' className='btn text-success'><BiEdit /></button>
                                                <button id='btn-table-delete' className='btn text-danger'><BiTrash /></button>
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

export default Customer