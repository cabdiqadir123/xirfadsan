import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';
import Header from '../Components/Header';
// import images from '../assets/icon/image_50px.png'


function SubService() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const maxLength = 10;
    const [isloadingBTN, setisloadingBTN] = useState(false);
    const [isloadingUpdateBTN, setisloadingUpdateBTN] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const [hideformtitle, sethideformtitle] = useState("Open");

    const [selectedrowid, setselectedrowid] = useState("");

    const [sub_service, setsub_service] = useState("");
    const [description, setdescription] = useState("");
    const [service_id, setservice_id] = useState("");
    const [image, setimage] = useState("");
    const [price, setprice] = useState("");
    const [data, setdata] = useState([]);

    const [hideform, sethideform] = useState(false);

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

    const fetch_subservice = async () => {
        fetch('https://back-end-for-xirfadsan.onrender.com/api/subservices/all')
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
        fetch_service_data();
        fetch_subservice();
    }, []);

    const [searchItem, setSearchItem] = useState('');
    const [tempSubservices, setTempSubservices] = useState([]);

    const combinedSubservices = [...data, ...tempSubservices];

    const filteredData = combinedSubservices.filter(item =>
        item.sub_service.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.sub_service_id?.toString().includes(searchItem)
    );

    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const handleFileChange = (e) => {
        setimage(e.target.files[0]);
    };

    function getSomaliaTime() {
        const now = new Date();
        // Somalia is always UTC+3 (no DST)
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const somalia = new Date(utc + 3 * 60 * 60 * 1000);

        const pad = (n) => (n < 10 ? "0" + n : n);

        return (
            somalia.getFullYear() +
            "-" +
            pad(somalia.getMonth() + 1) +
            "-" +
            pad(somalia.getDate()) +
            " " +
            pad(somalia.getHours()) +
            ":" +
            pad(somalia.getMinutes()) +
            ":" +
            pad(somalia.getSeconds())
        );
    };

    const handler = async (event) => {
        event.preventDefault();

        const created_at = getSomaliaTime();

        const formData = new FormData();
        formData.append('sub_service', sub_service);
        formData.append('description', description);
        formData.append('service_id', service_id);
        formData.append('price', price);
        formData.append('image', image);
        formData.append("created_at", created_at);

        // Create optimistic temp sub_service
        const maxId = data.length > 0 ? Math.max(...data.map(s => s.sub_service_id)) : 0;
        const tempId = maxId + 1;
        const tempSubService = {
            sub_service_id: tempId,
            sub_service,
            description,
            service_id,
            price,
            imageUrl: image ? URL.createObjectURL(image) : '',
            created_at: "Uploading..."
        };

        // Show temp sub_service immediately
        setdata(prev => [...prev, tempSubService]);
        sethideform(false);
        sethideformtitle("Open");
        setisloadingBTN(true);

        try {
            await axios.post('https://back-end-for-xirfadsan.onrender.com/api/subservices/add', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Replace temp with real data from server
            fetch_subservice();
            setTempSubservices([]);
        } catch (error) {
            console.error('Error uploading sub_service:', error);
            alert('Failed to upload sub_service');

            // Rollback temp sub_service
            setdata(prev => prev.filter(s => s.sub_service_id !== tempId));
            fetch_subservice();
        } finally {
            setisloadingBTN(false);
        }
    };

    const handelupdate = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("sub_service", sub_service);
        formData.append("description", description);
        formData.append('service_id', service_id);
        formData.append('price', price);
        // Conditionally append new files only if selected
        if (image instanceof File) formData.append("image", image);

        // Save previous state for rollback
        const prevData = [...data];

        // Optimistic update
        setdata(prev =>
            prev.map(item =>
                item.sub_service_id === selectedrowid
                    ? {
                        ...item,
                        sub_service,
                        description,
                        imageUrl: image instanceof File ? URL.createObjectURL(image) : item.imageUrl,
                        updated_at: "Updating..."
                    }
                    : item
            )
        );

        setisloadingUpdateBTN(true);

        try {
            await axios.put(`https://back-end-for-xirfadsan.onrender.com/api/subservices/update/${selectedrowid}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Refresh with confirmed server data
            fetch_subservice();
        } catch (error) {
            console.error("Error updating sub-service:", error);
            alert("Failed to update sub-service");

            // Rollback to old state
            setdata(prevData);
        } finally {
            setisloadingUpdateBTN(false);
            sethideform(false);
            sethideformtitle("Open");
        }
    };


    const headers = ['Full Name', 'email', 'Mobile No'];

    const downloadCSV = () => {
        const csvRows = [];
        csvRows.push(headers.join(','));
        data.forEach(row => {
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
                    <h1>Sub Service</h1>
                    <button onClick={hideform_action}>{hideformtitle}</button>
                </div>
                {hideform && <form className='form'>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Sub Service*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setsub_service(e.target.value)} />
                            </div>
                            <div className='col-6'>
                                <label>Select Service*</label>
                                <select onChange={(e) => setservice_id(e.target.value)}>
                                    <option>Select</option>
                                    {servicedata.map((item) => (
                                        <option>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Price*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setprice(e.target.value)} />
                            </div>
                            <div className='col-6'>
                                <label>Image*</label>
                                <div className='filepicker'>
                                    <input type='text' placeholder='Enter Name' />
                                    <input type='file' className='input-file-picker' onChange={handleFileChange} />
                                </div>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Description*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setdescription(e.target.value)} />
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
                <div className='table_search_seaction'>
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
                            <input type='text' onChange={(e) => setSearchItem(e.target.value)} placeholder='Enter Name' required />
                        </div>
                    </div>

                    {filteredData.length === 0 || data.length === 0 ? <p>No data</p> :
                        <div className='table-section'>
                            <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Service ID</th>
                                        <th>Secondry Image</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((item) => {
                                        const isExpanded = expandedRow === item.sub_service_id;
                                        const text = item.description;

                                        return (
                                            <tr key={item.sub_service_id}>
                                                <td>{item.sub_service_id}</td>
                                                <td>{item.sub_service}</td>
                                                <td>
                                                    {isExpanded ? text : text.slice(0, maxLength) + "... "}
                                                    <span
                                                        onClick={() =>
                                                            setExpandedRow(isExpanded ? null : item.sub_service_id)
                                                        }
                                                        style={{ color: "blue", cursor: "pointer", width: '100px' }}
                                                    >
                                                        {isExpanded ? "See less" : "See more"}
                                                    </span>
                                                </td>
                                                <td>{item.service_id}</td>
                                                <td>
                                                    <img
                                                        src={`https://back-end-for-xirfadsan.onrender.com/api/subservices/image/${item.sub_service_id}`}
                                                        width={70} alt=''
                                                    />
                                                </td>
                                                <td>
                                                    <div className='table-action-btns'>
                                                        <button onClick={async (e) => {
                                                            const sub_service_id = item.sub_service_id;
                                                            setselectedrowid(sub_service_id);
                                                            setsub_service(item.sub_service);
                                                            setservice_id(item.name);
                                                            setprice(item.price);
                                                            setdescription(item.description);
                                                            setimage(item.image);
                                                            setShowPopup(true);
                                                        }}
                                                            id='btn-table-edit' className='btn text-success'><BiEdit />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                const sub_service_id = item.sub_service_id;

                                                                // 1. Optimistically remove from UI
                                                                setdata((prev) =>
                                                                    prev.filter((s) => s.sub_service_id !== sub_service_id)
                                                                );

                                                                try {
                                                                    // 2. Send delete request
                                                                    await axios.post("https://back-end-for-xirfadsan.onrender.com/api/subservices/delete", { sub_service_id });
                                                                } catch (error) {
                                                                    console.error("Failed to delete sub-service:", error);

                                                                    // 3. Rollback if request fails
                                                                    fetch_subservice();
                                                                    alert("Failed to delete sub-service. Please try again.");
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
                                        );
                                    })}
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
                                                <label>Sub Service*</label>
                                                <input type='text' placeholder='Enter Name' value={sub_service} onChange={(e) => setsub_service(e.target.value)} />
                                            </div>
                                            <div className='col-6'>
                                                <label>Select Service*</label>
                                                <select value={service_id} onChange={(e) => setservice_id(e.target.value)}>
                                                    <option>Select</option>
                                                    {servicedata.map((item) => (
                                                        <option>{item.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div id='form-rows' className='row'>
                                            <div className='col-6'>
                                                <label>Price*</label>
                                                <input type='text' placeholder='Enter Name' value={price} onChange={(e) => setprice(e.target.value)} />
                                            </div>
                                            <div className='col-6'>
                                                <label>Image*</label>
                                                <div className='filepicker'>
                                                    <input type='text' placeholder='Enter Name' value={image} />
                                                    <input type='file' className='input-file-picker' onChange={handleFileChange} />
                                                </div>
                                            </div>
                                        </div>
                                        <div id='form-rows' className='row'>
                                            <div className='col-6'>
                                                <label>Description*</label>
                                                <input type='text' placeholder='Enter Name' value={description} onChange={(e) => setdescription(e.target.value)} />
                                            </div>
                                        </div>
                                        <div id='form-rows' className='row'>
                                            <div className='col-4'>
                                                <div className='form-btns'>
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
        </div>
    )
}

export default SubService