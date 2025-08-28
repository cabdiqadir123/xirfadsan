import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';
import Header from '../Components/Header';

function Staff() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(false);
    const [hideformtitle, sethideformtitle] = useState("Open");
    const [showPopup, setShowPopup] = useState(false);

    const [isloadingBTN, setisloadingBTN] = useState(false);

    const [isloadingUpdateBTN, setisloadingUpdateBTN] = useState(false);

    const [data, setdata] = useState([]);

    const [name, setname] = useState("");
    const [email, setemail] = useState("");
    const [password, setpassword] = useState('123');
    const [phone, setphone] = useState("");
    const [address, setaddress] = useState();
    const [dof, setdof] = useState();
    const [role] = useState("Staff");
    const [sex, setsex] = useState("");
    const [image, setimage] = useState("");
    const [status, setstatus] = useState("Active");
    const [service_id, setservice_id] = useState("");
    const [user_id, setuser_id] = useState("");
    const [available,setavailable] = useState("true");
    const [token] = useState("no token");

    const [selectedrowid, setselectedrowid] = useState("");

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

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setitemsPerPage] = useState(5);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const [servicedata, setservicedata] = useState([]);
    const fetch_service_data = async () => {
        const rptdata = await axios.get("/api/services/all");
        const resltdata = rptdata.data;
        setservicedata(resltdata);
    };


    const fetchdata = async () => {
        fetch('/api/staff/all_admin')
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

    const [TempStaff, setTempStaff] = useState([]);

    const combinedData = [...data, ...TempStaff];

    const filteredData = combinedData.filter(item =>
        item.staff_name?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.staff_id?.toString().includes(searchItem)
    );

    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const handleFileChange = (e) => {
        setimage(e.target.files[0]);
    };

    const handler = async (e) => {
        e.preventDefault(); // prevent form refresh

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("dof", dof);
        formData.append("sex", sex);
        formData.append("role", role);
        formData.append("status", status);
        formData.append("image", image);
        formData.append("token", token);

        const num = /^[0-9\b]+$/;
        if (!num.test(phone)) {
            alert("Phone field allows only numbers");
            return;
        }

        // Generate temp staff for optimistic UI
        const maxId = data.length > 0 ? Math.max(...data.map(s => s.staff_id)) : 0;
        const tempId = maxId + 1;
        const tempStaff = {
            staff_id: tempId,
            staff_name: name,
            staff_email: email,
            staff_phone: phone,
            status,
            imageUrl: image ? URL.createObjectURL(image) : "",
            created_at: "Uploading..."
        };

        setdata(prev => [...prev, tempStaff]);
        sethideform(false);
        sethideformtitle("Open");
        setisloadingBTN(true);

        try {
            // Step 1: Create user
            const userResponse = await axios.post("api/user/add", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Step 2: Create staff linked to user
            const staffResponse = await axios.post("api/staff/add", {
                name,
                service_id,
                available,
            });

            console.log("User created:", userResponse.data);
            console.log("Staff created:", staffResponse.data);

            // Success → refresh real staff list
            fetchdata();
            setTempStaff([]); // clear optimistic temp
        } catch (error) {
            console.error("Error adding user or staff:", error);
            alert("Failed to add staff");

            // Rollback optimistic temp staff
            setTempStaff(prev => prev.filter(s => s.staff_id !== tempId));
            fetchdata();
        } finally {
            setisloadingBTN(false);
        }
    };

    const handelupdate = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("dof", dof);
        formData.append("sex", sex);
        formData.append("role", role);
        formData.append("status", status);

        if (image instanceof File) {
            formData.append("image", image);
        }

        // Save old data for rollback
        const prevData = [...data];

        // Optimistic UI update
        setdata(prev =>
            prev.map(s =>
                s.staff_user_id === selectedrowid
                    ? {
                        ...s,
                        name,
                        email,
                        phone,
                        status,
                        imageUrl: image instanceof File ? URL.createObjectURL(image) : s.imageUrl,
                        updated_at: "Updating..."
                    }
                    : s
            )
        );

        setisloadingUpdateBTN(true);

        try {
            // Step 1: update user
            const userResponse = await axios.put(`api/user/update/${user_id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Step 2: update staff
            await axios.put(`/api/staff/update/${selectedrowid}`, {
                service_id,
                available
            });

            console.log("Staff updated successfully", userResponse.data);

            // Success → reload server data
            fetchdata();
        } catch (error) {
            console.error("Error updating staff:", error);
            alert("Failed to update staff");

            // Rollback optimistic update
            setdata(prevData);
        } finally {
            setisloadingUpdateBTN(false);
            sethideform(false);
            sethideformtitle("Open");
        }
    };

    const handelupdate_status = async (user_id, newStatus) => {
        // Optimistically update UI
        setdata(prevData => prevData.map(item =>
            item.staff_user_id === user_id ? { ...item, status: newStatus } : item
        ));

        try {
            await axios.put(`/api/user/status/${user_id}`, { status: newStatus }, {
                headers: { 'Content-Type': 'application/json' }
            });
            // Optionally refetch only if needed
            // fetchdata();
        } catch (error) {
            alert('Failed to update status');
            console.error(error);
            // Revert change if failed
            setdata(prevData => prevData.map(item =>
                item.staff_user_id === user_id ? { ...item, status: newStatus === "Active" ? "Inactive" : "Active" } : item
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
        link.download = 'Customer_data.csv';
        link.click();
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='page'>
            <Header />
            <div className='body'>
                <div className='add-btn'>
                    <h1>Staff data</h1>
                    <button onClick={hideform_action}>{hideformtitle}</button>
                </div>
                {hideform && <form className='form'>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Full Name*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setname(e.target.value)} />
                            </div>
                            <div className='col-6'>
                                <label>Email*</label>
                                <input type='text' placeholder='Enter Mobile No' onChange={(e) => setemail(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-3'>
                                <label>Mobile No*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setphone(e.target.value)} />
                            </div>
                            <div className='col-3'>
                                <label>Sex*{sex}</label>
                                <select onChange={(e) => setsex(e.target.value)}>
                                    <option >Select Sex</option>
                                    <option value={"Male"} >Male</option>
                                    <option value={"Female"}>Female</option>
                                </select>
                            </div>
                            <div className='col-6'>
                                <label> Address*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setaddress(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Service*</label>
                                <select onChange={(e) => setservice_id(e.target.value)}>
                                    <option>Select Service</option>
                                    {servicedata.map((item) => (
                                        <option>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-3'>
                                <label>password*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setphone(e.target.value)} />
                            </div>
                            <div className='col-3'>
                                <label>Status*</label>
                                <select onChange={(e) => setstatus(e.target.value)}>
                                    <option>Select Status</option>
                                    <option value={"Active"}>Active</option>
                                    <option value={"Inactive"}>Inactive</option>
                                </select>
                            </div>
                            <div className='col-6'>
                                <label> DOF*</label>
                                <input type='date' placeholder='Enter Name' onChange={(e) => setdof(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Profile Image*</label>
                                <div className='filepicker'>
                                    <input type='text' placeholder='Enter Name' />
                                    <input type='file' className='input-file-picker' onChange={handleFileChange} />
                                </div>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-4'>
                                <div className='form-btns'>
                                    <button onClick={handler} type="submit" className='btn bg-success text-light'>{isloadingBTN ? 'Savings...' : 'Save'}</button>
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
                                    <th>Profile Image</th>
                                    <th>Staff Name</th>
                                    <th>Email</th>
                                    <th>Mobile No</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item) => (
                                    <tr key={item.staff_id}>
                                        <td>{item.staff_id}</td>
                                        <td>
                                            <img
                                                src={item.imageUrl || `api/user/image/${item.staff_user_id}?`}
                                                width={70} alt=''
                                            />
                                        </td>
                                        <td>{item.staff_name}</td>
                                        <td>{item.staff_email}</td>
                                        <td>{item.staff_phone}</td>
                                        <td>
                                            <div className={item.status === "Active" ? 'status-table-act' : 'status-table-inact'}>
                                                <button
                                                    onClick={() => handelupdate_status(item.staff_user_id, item.status === "Active" ? "Inactive" : "Active")}
                                                    className={item.status === "Active" ? 'status-table-btns-act' : 'status-table-btns-inact'}
                                                >
                                                    {item.status === "Active" ? "Active" : "Inactive"}
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className='table-action-btns'>
                                                <button onClick={async (e) => {
                                                    const staff_id = item.staff_id;
                                                    setuser_id(item.staff_user_id);
                                                    setselectedrowid(staff_id);
                                                    setname(item.staff_name);
                                                    setemail(item.staff_email);
                                                    setpassword(item.password);
                                                    setphone(item.staff_phone);
                                                    setaddress(item.staff_address);
                                                    const isoDate = item.dof;
                                                    const formattedDate = isoDate.split("T")[0];
                                                    setdof(formattedDate);
                                                    setstatus(item.status);
                                                    setservice_id(item.servicename);
                                                    setsex(item.sex);
                                                    setShowPopup(true);
                                                    setavailable(item.available)
                                                }} id='btn-table-edit' className='btn text-success'><BiEdit /></button>
                                                <button
                                                    onClick={async () => {
                                                        const staff_id = item.staff_id;
                                                        const user_id = item.staff_user_id;

                                                        // 1. Optimistically remove row from UI
                                                        setdata((prev) => prev.filter((row) => row.staff_id !== staff_id));

                                                        try {
                                                            // 2. Fire both deletes in parallel
                                                            await Promise.all([
                                                                axios.post("/api/staff/delete", { staff_id }),
                                                                axios.post("/api/user/delete", { id: user_id }),
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
                {showPopup && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            background: "rgba(0,0,0,0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1000,
                        }}
                    >
                        <div
                            style={{
                                background: "#fff",
                                padding: "20px",
                                borderRadius: "8px",
                                maxWidth: "700px",
                                width: "90%",
                            }}
                        >
                            <form className='form'>
                                <div className='container'>
                                    <div id='form-rows' className='row'>
                                        <div className='col-6'>
                                            <label>Full Name*</label>
                                            <input type='text' placeholder='Enter Name' value={name} onChange={(e) => setname(e.target.value)} />
                                        </div>
                                        <div className='col-6'>
                                            <label>Email*</label>
                                            <input type='text' placeholder='Enter Mobile No' value={email} onChange={(e) => setemail(e.target.value)} />
                                        </div>
                                    </div>
                                    <div id='form-rows' className='row'>
                                        <div className='col-3'>
                                            <label>Mobile No*</label>
                                            <input type='text' placeholder='Enter Name' value={phone} onChange={(e) => setphone(e.target.value)} />
                                        </div>
                                        <div className='col-3'>
                                            <label>Sex*{sex}</label>
                                            <select value={sex} onChange={(e) => setsex(e.target.value)}>
                                                <option >Select Sex</option>
                                                <option value={"Male"} >Male</option>
                                                <option value={"Female"}>Female</option>
                                            </select>
                                        </div>
                                        <div className='col-6'>
                                            <label> Address*</label>
                                            <input type='text' placeholder='Enter Name' value={address} onChange={(e) => setaddress(e.target.value)} />
                                        </div>
                                    </div>
                                    <div id='form-rows' className='row'>
                                        <div className='col-6'>
                                            <label>Service*</label>
                                            <select value={service_id} onChange={(e) => setservice_id(e.target.value)}>
                                                <option>Select Service</option>
                                                {servicedata.map((item) => (
                                                    <option>{item.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className='col-3'>
                                            <label>Available*{sex}</label>
                                            <select value={available} onChange={(e) => setavailable(e.target.value)}>
                                                <option >Select Available</option>
                                                <option value={"true"} >true</option>
                                                <option value={"false"}>false</option>
                                            </select>
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
                                    </div>
                                    <div id="form-rows" className="row">
                                        <div className="col-4">
                                            <div className="form-btns">
                                                <button onClick={handelupdate} type="submit" className='btn bg-primary text-light'>{isloadingUpdateBTN ? 'Updating...' : 'Update'}</button>
                                                <button onClick={() => setShowPopup(false)} className="btn bg-danger text-light">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Staff