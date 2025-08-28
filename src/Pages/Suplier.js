import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import Header from '../Components/Header';

function Suplier() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(false);
    const [hideformtitle, sethideformtitle] = useState("Open");

    const [isloadingBTN, setisloadingBTN] = useState(false);
    const [isloadingUpdateBTN, setisloadingUpdateBTN] = useState(false);

    const [data, setdata] = useState([]);

    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [password, setpassword] = useState('123');
    const [phone, setphone] = useState("");
    const [address, setaddress] = useState();
    const [dof, setdof] = useState();
    const [role] = useState("Supplier");
    const [sex, setsex] = useState("");
    const [image, setimage] = useState("");
    const [status, setstatus] = useState("Active");
    const [user_id, setuser_id] = useState("");
    const [service_id, setservice_id] = useState("");
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

    const [servicedata, setservicedata] = useState([]);
    const fetch_service_data = async () => {
        const rptdata = await axios.get("https://back-end-for-xirfadsan.onrender.com/api/services/all");
        const resltdata = rptdata.data;
        setservicedata(resltdata);
    };

    const fetchdata = async () => {
        fetch('https://back-end-for-xirfadsan.onrender.com/api/supplier/all')
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
        fetch_service_data();
    }, []);

    const [searchItem, setSearchItem] = useState('');

    const [TempSuppliers, setTempSuppliers] = useState([]);

    const combinedData = [...data, ...TempSuppliers];

    const filteredData = combinedData.filter(item =>
        item.name?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.supplier_id?.toString().includes(searchItem)
    );

    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const handleFileChange = (e) => {
        setimage(e.target.files[0]);
    };

    const handler = async (e) => {
        e.preventDefault();

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

        const num = /^[0-9\b]+$/;
        if (!num.test(phone)) {
            alert("Phone field only allows numbers");
            return;
        }

        // Optimistic UI: create temp supplier
        const maxId = data.length > 0 ? Math.max(...data.map(s => s.user_id)) : 0;
        const tempId = maxId + 1;
        const tempSupplier = {
            user_id: tempId,
            name,
            email,
            phone,
            address,
            dof,
            sex,
            role,
            status,
            imageUrl: image ? URL.createObjectURL(image) : '',
            service_id,
            created_at: "Uploading..."
        };
        setTempSuppliers(prev => [...prev, tempSupplier]);
        sethideform(false);
        sethideformtitle("Open");
        setisloadingBTN(true);

        try {
            // Add user
            const response = await axios.post('https://back-end-for-xirfadsan.onrender.com/api/user/add', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Add supplier
            await axios.post('https://back-end-for-xirfadsan.onrender.com/api/supplier/add', { name, service_id });

            fetchdata(); // Refresh table
            setTempSuppliers([]); // Clear temp
            setisloadingBTN(false);
            console.log(response);
        } catch (error) {
            console.error('Error uploading supplier:', error);
            alert('Failed to upload supplier');
            setTempSuppliers([]); // Rollback temp
            fetchdata(); // Ensure table matches server
            setisloadingBTN(false);
        }
    };

    const handelupdate = async (e) => {
        e.preventDefault();

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

        // Append new image only if selected
        if (image instanceof File) {
            formData.append("image", image);
        }

        // Optimistic UI: update temp supplier in table immediately
        setdata(prev =>
            prev.map(s =>
                s.user_id === user_id
                    ? {
                        ...s,
                        name,
                        email,
                        phone,
                        address,
                        dof,
                        sex,
                        role,
                        status,
                        imageUrl: image instanceof File ? URL.createObjectURL(image) : s.imageUrl,
                        service_id
                    }
                    : s
            )
        );

        setisloadingUpdateBTN(true);

        try {
            // Update user
            const response = await axios.put(`https://back-end-for-xirfadsan.onrender.com/api/user/update/${user_id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Update supplier service
            await axios.put(`https://back-end-for-xirfadsan.onrender.com/api/supplier/update/${selectedrowid}`, { service_id });

            fetchdata(); // Refresh table from server
            sethideform(false);
            sethideformtitle("Open");
            setisloadingUpdateBTN(false);
            console.log(response);
        } catch (error) {
            console.error("Error updating supplier:", error);
            alert("Failed to update supplier");
            fetchdata(); // Rollback changes
            setisloadingUpdateBTN(false);
        }
    };

    const handelupdate_status = async (user_id, newStatus) => {
        // Optimistically update UI
        setdata(prevData => prevData.map(item =>
            item.user_id === user_id ? { ...item, status: newStatus } : item
        ));

        try {
            await axios.put(`https://back-end-for-xirfadsan.onrender.com/api/user/status/${user_id}`, { status: newStatus }, {
                headers: { 'Content-Type': 'application/json' }
            });
            // Optionally refetch only if needed
            // fetchdata();
        } catch (error) {
            alert('Failed to update status');
            console.error(error);
            // Revert change if failed
            setdata(prevData => prevData.map(item =>
                item.user_id === user_id ? { ...item, status: newStatus === "Active" ? "Inactive" : "Active" } : item
            ));
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
        link.download = 'my-table.csv';
        link.click();
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='page'>
            <Header />
            <div className='body'>
                <div className='add-btn'>
                    <h1>Suplier</h1>
                    <button onClick={hideform_action}>{hideformtitle}</button>
                </div>
                {hideform && <form className='form'>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Name*</label>
                                <input type='text' placeholder='Enter Name' value={name} onChange={(e) => setname(e.target.value)} />
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
                                    <option value={"Male"}>Male</option>
                                    <option value={"Female"}>Female</option>
                                </select>
                            </div>
                            <div className='col-6'>
                                <label> Address*</label>
                                <input type='text' placeholder='Enter Name' value={address} onChange={(e) => setaddress(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-3'>
                                <label>password*</label>
                                <input type='text' placeholder='Enter Name' value={password} onChange={(e) => setphone(e.target.value)} />
                            </div>
                            <div className='col-3'>
                                <label>Status*</label>
                                <select value={status} onChange={(e) => setstatus(e.target.value)}>
                                    <option>Select Status</option>
                                    <option value={"Active"}>Active</option>
                                    <option value={"Inactive"}>Inactive</option>
                                </select>
                            </div>
                            <div className='col-6'>
                                <label> DOF*</label>
                                <input type='date' placeholder='Enter Name' value={dof} onChange={(e) => setdof(e.target.value)} />
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
                                <label>Services*</label>
                                <select value={service_id} onChange={(e) => setservice_id(e.target.value)}>
                                    <option>Select Services</option>
                                    {servicedata.map((item) => (
                                        <option>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-4'>
                                <div className='form-btns'>
                                    <button onClick={handler} type="submit" className='btn bg-success text-light'>{isloadingBTN ? 'Savings...' : 'Save'}</button>
                                    <button onClick={handelupdate} type="submit" className='btn bg-primary text-light'>{isloadingUpdateBTN ? 'Updating...' : 'Update'}</button>
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
                                    <th>Image</th>
                                    <th>Supplier Name</th>
                                    <th>Email</th>
                                    <th>Mobile No</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item) => (
                                    <tr key={item.supplier_id}>
                                        <td>{item.supplier_id}</td>
                                        <td>
                                            <img
                                                src={item.imageUrl || `https://back-end-for-xirfadsan.onrender.com/api/supplier/image/${item.user_id}`}
                                                width={70} alt=''
                                            />
                                        </td>
                                        <td>{item.name}</td>
                                        <td>{item.email}</td>
                                        <td>{item.phone}</td>
                                        <td>
                                            <div className={item.status === "Active" ? 'status-table-act' : 'status-table-inact'}>
                                                <button
                                                    onClick={() => handelupdate_status(item.user_id, item.status === "Active" ? "Inactive" : "Active")}
                                                    className={item.status === "Active" ? 'status-table-btns-act' : 'status-table-btns-inact'}
                                                >
                                                    {item.status === "Active" ? "Active" : "Inactive"}
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className='table-action-btns'>
                                                <button onClick={async (e) => {
                                                    const supplier_id = item.supplier_id;
                                                    setuser_id(item.user_id);
                                                    setselectedrowid(supplier_id);
                                                    setname(item.name);
                                                    setemail(item.email);
                                                    setpassword(item.password);
                                                    setphone(item.phone);
                                                    setaddress(item.address);
                                                    setdof(item.dof);
                                                    setstatus(item.status);
                                                    setservice_id(item.service_name);
                                                    sethideform(true);
                                                    fetchdata();
                                                    setsex(item.sex);
                                                }} id='btn-table-edit' className='btn text-success'><BiEdit /></button>
                                                <button
                                                    onClick={async () => {
                                                        const supplier_id = item.supplier_id;
                                                        const user_id = item.user_id;

                                                        // 1. Optimistically remove row from UI
                                                        setdata((prev) => prev.filter((row) => row.supplier_id !== supplier_id));

                                                        try {
                                                            // 2. Fire both deletes in parallel
                                                            await Promise.all([
                                                                axios.post("https://back-end-for-xirfadsan.onrender.com/api/supplier/delete", { supplier_id }),
                                                                axios.post("https://back-end-for-xirfadsan.onrender.com/api/user/delete", { id: user_id }),
                                                            ]);
                                                        } catch (error) {
                                                            console.error("Delete failed:", error);

                                                            // 3. Rollback if failed
                                                            fetchdata();
                                                            alert("Failed to delete staff. Please try again.");
                                                        }
                                                    }}
                                                    id="btn-table-delete"
                                                    className="btn text-danger"
                                                >
                                                    <BiTrash />
                                                </button>
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
                }
            </div>
        </div>
    )
}

export default Suplier