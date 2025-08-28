import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';
import images from '../assets/icon/image_50px.png'

function Services() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(false);
    const [isloadingBTN, setisloadingBTN] = useState(false);
    const [isloadingUpdateBTN, setisloadingUpdateBTN] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const [hideformtitle, sethideformtitle] = useState("Open");
    const [selectedrowid, setselectedrowid] = useState("");
    const [name, setname] = useState("");
    const [image, setimage] = useState("");
    const [secondry_image, setsecondry_image] = useState("");
    const [color, setcolor] = useState("");
    const [services, setservices] = useState([]);
    const [tempServices, setTempServices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setitemsPerPage] = useState(5);
    const [searchItem, setSearchItem] = useState('');

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    function hideform_action() {
        if (hideform) {
            sethideform(false);
            sethideformtitle("Open");
        } else {
            sethideform(true);
            sethideformtitle("Close");
            setselectedrowid("");
        }
    }

    const fetch_service = async () => {
        try {
            const response = await fetch('https://back-end-for-xirfadsan.onrender.com/api/services/all');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setservices(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => { fetch_service(); }, []);

    const combinedServices = [...services, ...tempServices];

    const filteredData = combinedServices.filter(item =>
        item.name.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.service_id?.toString().includes(searchItem)
    );

    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleFileChange = (e) => setimage(e.target.files[0]);
    const handleFileChange2 = (e) => setsecondry_image(e.target.files[0]);

    const handler = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('image', image);
        formData.append('secondry_image', secondry_image);
        formData.append('color', color);

        // Optimistic UI: create a temporary service
        const maxId = services.length > 0 ? Math.max(...services.map(s => s.service_id)) : 0;
        const tempId = maxId + 1;
        const tempService = {
            service_id: tempId, // temp id
            name,
            color,
            imageUrl: image ? URL.createObjectURL(image) : '',
            secondryImageUrl: secondry_image ? URL.createObjectURL(secondry_image) : '',
            created_at: "Uploading..."
        };

        // Show temp service immediately
        setservices(prev => [...prev, tempService]);
        sethideform(false);
        sethideformtitle("Open");
        setisloadingBTN(true);

        try {
            // Send to server
            const response = await axios.post('https://back-end-for-xirfadsan.onrender.com/api/services/add', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Replace temp service with real service from server
            fetch_service(); // fetch updated list from server
        } catch (error) {
            console.error('Error uploading service:', error);
            alert('Failed to upload service');

            // Rollback: remove the temp service
            setservices(prev => prev.filter(s => s.service_id !== tempId));
        } finally {
            setisloadingBTN(false);
        }
    };

    const handelupdate = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('color', color);
        if (image instanceof File) formData.append('image', image);
        if (secondry_image instanceof File) formData.append('secondry_image', secondry_image);

        // Keep a copy of the previous state for rollback
        const prevServices = [...services];

        // Optimistic update in UI
        setservices(prev =>
            prev.map(s =>
                s.service_id === selectedrowid
                    ? {
                        ...s,
                        name,
                        color,
                        imageUrl: image instanceof File ? URL.createObjectURL(image) : s.imageUrl,
                        secondryImageUrl: secondry_image instanceof File ? URL.createObjectURL(secondry_image) : s.secondryImageUrl,
                        updated_at: "Updating..."
                    }
                    : s
            )
        );

        setisloadingUpdateBTN(true);

        try {
            await axios.put(`https://back-end-for-xirfadsan.onrender.com/api/services/update/${selectedrowid}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Replace temp optimistic update with actual server data
            fetch_service();
        } catch (error) {
            console.error('Error updating service:', error);
            alert('Failed to update service');

            // Rollback to previous state
            setservices(prevServices);
        } finally {
            setisloadingUpdateBTN(false);
            sethideform(false);
            sethideformtitle("Open");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const headers = ['Full Name', 'email', 'Mobile No'];

    const downloadCSV = () => {
        const csvRows = [];
        csvRows.push(headers.join(','));
        currentData.forEach(row => {
            csvRows.push([row.name, row.email, row.created_at].join(','));
        });
        const csvData = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(csvData);
        link.download = 'Customer_data.csv';
        link.click();
    };

    return (
        <div className='page'>
            <div className='top-header'>
                Super admin
            </div>
            <div className='body'>
                <div className='add-btn'>
                    <h1>Service</h1>
                    <button onClick={hideform_action}>{hideformtitle}</button>
                </div>
                {hideform && <form className='form'>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-10'>
                                <label>Name*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setname(e.target.value)} />
                            </div>
                            <div className='col-2'>
                                <label>Color*</label>
                                <input type='color' placeholder='Enter Name' onChange={(e) => setcolor(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Image*</label>
                                <div className='filepicker'>
                                    <input type='text' placeholder='Enter image' />
                                    <input type='file' className='input-file-picker' onChange={handleFileChange} />
                                </div>
                            </div>
                            <div className='col-6'>
                                <label>Second Image*</label>
                                <div className='filepicker'>
                                    <input type='text' placeholder='Enter image 2'/>
                                    <input type='file' className='input-file-picker' onChange={handleFileChange2} />
                                </div>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                {selectedrowid === "" ? <img src={images} alt='' width={50} height={50} /> : <img
                                    src={`https://back-end-for-xirfadsan.onrender.com/api/services/image/${selectedrowid}`}
                                    width={120}
                                    height={120}
                                    alt=''
                                />}
                            </div>
                            <div className='col-6'>
                                {selectedrowid === "" ? <img src={image} alt='' width={50} height={50} /> : <img
                                    src={`https://back-end-for-xirfadsan.onrender.com/api/services/secondry_image/${selectedrowid}`}
                                    width={120}
                                    height={120}
                                    alt=''
                                />}
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
                            <input type='text' onChange={(e) => setSearchItem(e.target.value)} placeholder='Search...!' required />
                        </div>
                    </div>

                    <div className='table-section'>
                        {/* Table Section */}
                        {filteredData.length === 0 ? <p>No data</p> :
                            <table border="1" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Image</th>
                                        <th>Second Image</th>
                                        <th>Created At</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map(item => (
                                        <tr key={item.service_id}>
                                            <td>{item.service_id}</td>
                                            <td>{item.name}</td>
                                            <td><img src={item.imageUrl || `https://back-end-for-xirfadsan.onrender.com/api/services/image/${item.service_id}`} width={70} alt="" /></td>
                                            <td><img src={item.secondryImageUrl || `https://back-end-for-xirfadsan.onrender.com/api/services/secondry_image/${item.service_id}`} width={70} alt="" /></td>
                                            <td>{item.created_at}</td>
                                            <td>
                                                <button onClick={() => {
                                                    setselectedrowid(item.service_id);
                                                    setname(item.name);
                                                    setcolor(item.color);
                                                    setShowPopup(true);
                                                }} className='btn text-success'><BiEdit /></button>
                                                <button onClick={async () => {
                                                    const id = item.service_id;
                                                    // Optimistic delete
                                                    setservices(prev => prev.filter(s => s.service_id !== id));
                                                    setTempServices(prev => prev.filter(s => s.service_id !== id));
                                                    try {
                                                        await axios.post('https://back-end-for-xirfadsan.onrender.com/api/services/delete', { service_id: id });
                                                    } catch (err) {
                                                        alert("Failed to delete");
                                                        fetch_service();
                                                    }
                                                }} className='btn text-danger'><BiTrash /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        }
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
                </div>
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
                                        <div className='col-10'>
                                            <label>Name*</label>
                                            <input type='text' placeholder='Enter Name' value={name} onChange={(e) => setname(e.target.value)} />
                                        </div>
                                        <div className='col-2'>
                                            <label>Color*</label>
                                            <input type='color' placeholder='Enter Name' value={color} onChange={(e) => setcolor(e.target.value)} />
                                        </div>
                                    </div>
                                    <div id='form-rows' className='row'>
                                        <div className='col-6'>
                                            <label>Image*</label>
                                            <div className='filepicker'>
                                                <input type='text' placeholder='Enter image' value={image} />
                                                <input type='file' className='input-file-picker' onChange={handleFileChange} />
                                            </div>
                                        </div>
                                        <div className='col-6'>
                                            <label>Second Image*</label>
                                            <div className='filepicker'>
                                                <input type='text' placeholder='Enter image 2' value={secondry_image} />
                                                <input type='file' className='input-file-picker' onChange={handleFileChange2} />
                                            </div>
                                        </div>
                                    </div>
                                    <div id='form-rows' className='row'>
                                        <div className='col-6'>
                                            {selectedrowid === "" ? <img src={images} alt='' width={50} height={50} /> : <img
                                                src={`https://back-end-for-xirfadsan.onrender.com/api/services/image/${selectedrowid}`}
                                                width={120}
                                                height={120}
                                                alt=''
                                            />}
                                        </div>
                                        <div className='col-6'>
                                            {selectedrowid === "" ? <img src={image} alt='' width={50} height={50} /> : <img
                                                src={`https://back-end-for-xirfadsan.onrender.com/api/services/secondry_image/${selectedrowid}`}
                                                width={120}
                                                height={120}
                                                alt=''
                                            />}
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
        </div >
    )
}

export default Services