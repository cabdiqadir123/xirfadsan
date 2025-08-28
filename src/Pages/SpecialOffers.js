import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';
import Img1 from '../assets/images/1.jpg'
import Header from '../Components/Header';

function SpecialOffers() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(false);
    const [hideformtitle, sethideformtitle] = useState("Open");
    const [isloadingBTN, setisloadingBTN] = useState(false);
    const [isloadingUpdateBTN, setisloadingUpdateBTN] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const [data, setdata] = useState([]);

    const [sub_service_id, setsub_service_id] = useState("");
    const [promocode, setpromocode] = useState("");
    const [description, setdescription] = useState("");
    const [end_date, setend_date] = useState("")
    const [image, setImage] = useState(null);
    const [per, setper] = useState("")
    const [color, setcolor] = useState("");

    const [selectedrowid, setselectedrowid] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setitemsPerPage] = useState(5);

    const handleDelete = async (id) => {
        // 1. Optimistically remove from UI
        const oldData = [...data];
        setdata(data.filter((item) => item.id !== id));

        try {
            // 2. API call
            await axios.post("/api/discount/delete", { id });
        } catch (error) {
            console.error("Delete failed, rolling back:", error);
            // 3. Rollback on failure
            setdata(oldData);
        }
    };

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

    const [sub_servicedata, setsub_servicedata] = useState([]);
    const fetch_subservice_data = async () => {
        const rptdata = await axios.get("/api/subservices/all");
        const resltdata = rptdata.data;
        setsub_servicedata(resltdata);
    };

    const fetchdata = async () => {
        fetch('/api/discount/all')
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
    }, []);

    const [searchItem, setSearchItem] = useState('');

    const [TempData, setTempData] = useState([]);

    const combinedSubservices = [...data, ...TempData];

    const filteredData = combinedSubservices.filter(item =>
        item.sub_service?.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.promocode?.toString().includes(searchItem)
    );

    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handler = async (e) => {
        e.preventDefault(); // prevent page reload

        const formData = new FormData();
        formData.append("sub_service_id", sub_service_id);
        formData.append("promocode", promocode);
        formData.append("description", description);
        formData.append("per", per);
        formData.append("image", image); // must be File object
        formData.append("end_date", end_date);
        formData.append("color", color);

        // Save old data for rollback
        const prevData = [...data];

        // Create optimistic discount
        const maxId = data.length > 0 ? Math.max(...data.map(d => d.id)) : 0;
        const tempId = maxId + 1;
        const tempDiscount = {
            id: tempId,
            sub_service_id, // keep real value instead of "Uploading..."
            sub_service: sub_service_id, // adjust if you map sub_service names later
            promocode,
            description,
            per,
            end_date,
            color,
            imageUrl: image ? URL.createObjectURL(image) : "",
            created_at: "Uploading..."
        };

        // Optimistic UI update
        setdata(prev => [...prev, tempDiscount]);
        sethideform(false);
        sethideformtitle("Open");
        setisloadingBTN(true);

        try {
            await axios.post("/api/discount/add", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Replace optimistic with real data
            fetchdata();
        } catch (error) {
            console.error("Error uploading discount:", error);
            alert("Failed to upload discount");

            // Rollback to old state
            setdata(prevData);
        } finally {
            setisloadingBTN(false);
        }
    };

    const handelupdate = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("sub_service_id", sub_service_id);
        formData.append("promocode", promocode);
        formData.append("description", description);
        formData.append("per", per);
        formData.append("end_date", end_date);
        formData.append("color", color);

        // Only append new image if a file is selected
        if (image instanceof File) formData.append("image", image);

        // Optimistic UI: update table immediately
        setdata(prev =>
            prev.map(item =>
                item.id === selectedrowid
                    ? {
                        ...item,
                        sub_service_id: "Uploading...",
                        sub_service: sub_service_id,
                        promocode,
                        description,
                        per,
                        end_date,
                        color,
                        imageUrl: image instanceof File ? URL.createObjectURL(image) : item.imageUrl,
                    }
                    : item
            )
        );

        try {
            setisloadingUpdateBTN(true);
            const response = await axios.put(`api/discount/update/${selectedrowid}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log(response.data);
            fetchdata(); // confirm with server data
            sethideform(false);
            sethideformtitle("Open");
        } catch (error) {
            console.error("Error updating discount:", error);
            alert("Failed to update discount");
            fetchdata(); // rollback to server state
        } finally {
            setisloadingUpdateBTN(false);
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
                    <h1>Special_offers</h1>
                    <button onClick={hideform_action}>{hideformtitle}</button>
                </div>
                {hideform && <form className='form'>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Promocode*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setpromocode(e.target.value)} />
                            </div>
                            <div className='col-6'>
                                <label>Sub Service*</label>
                                <select value={sub_service_id} onChange={(e) => setsub_service_id(e.target.value)}>
                                    <option value="" disabled>Select Sub Service</option>
                                    {sub_servicedata.map((item) => (
                                        <option>{item.sub_service}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Percantage*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setper(e.target.value)} />
                            </div>
                            <div className='col-6'>
                                <label>Color*</label>
                                <input type='color' placeholder='Enter Name' onChange={(e) => setcolor(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Description*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setdescription(e.target.value)} />
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
                                <label>End Date*</label>
                                <input type='date' placeholder='Enter Name' onChange={(e) => setend_date(e.target.value)} />
                            </div>
                            <div className='col-6'>
                                <img src={Img1} width={120} height={120} alt='' />
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
                                    <th>sub_service_id</th>
                                    <th>sub_service</th>
                                    <th>Promocode</th>
                                    <th>Description</th>
                                    <th>per</th>
                                    <th>Image</th>
                                    <th>End_date</th>
                                    <th>Created_at</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.sub_service_id}</td>
                                        <td>{item.sub_service}</td>
                                        <td>{item.promocode}</td>
                                        <td>{item.description}</td>
                                        <td>{item.per}</td>
                                        <td>
                                            <img
                                                src={item.imageUrl || `/api/discount/image/${item.id || item.id}`}
                                                width={70} alt=''
                                            />
                                        </td>
                                        <td>{item.end_date}</td>
                                        <td>{item.created_at}</td>
                                        <td>
                                            <div className='table-action-btns'>
                                                <button onClick={async (e) => {
                                                    const id = item.id;
                                                    setselectedrowid(id);
                                                    setpromocode(item.promocode);
                                                    setcolor(item.color);
                                                    setdescription(item.description);
                                                    setper(item.per);
                                                    setsub_service_id(item.sub_service);
                                                    const isoDate = item.end_date;
                                                    const formattedDate = isoDate.split("T")[0];
                                                    setend_date(formattedDate);
                                                    setShowPopup(true);
                                                }} id='btn-table-edit' className='btn text-success'><BiEdit /></button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
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
                                            <label>Promocode*</label>
                                            <input type='text' placeholder='Enter Name' value={promocode} onChange={(e) => setpromocode(e.target.value)} />
                                        </div>
                                        <div className='col-6'>
                                            <label>Sub Service*</label>
                                            <select value={sub_service_id} onChange={(e) => setsub_service_id(e.target.value)}>
                                                <option value="" disabled>Select Sub Service</option>
                                                {sub_servicedata.map((item) => (
                                                    <option>{item.sub_service}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div id='form-rows' className='row'>
                                        <div className='col-6'>
                                            <label>Percantage*</label>
                                            <input type='text' placeholder='Enter Name' value={per} onChange={(e) => setper(e.target.value)} />
                                        </div>
                                        <div className='col-6'>
                                            <label>Color*</label>
                                            <input type='color' placeholder='Enter Name' value={color} onChange={(e) => setcolor(e.target.value)} />
                                        </div>
                                    </div>
                                    <div id='form-rows' className='row'>
                                        <div className='col-6'>
                                            <label>Description*</label>
                                            <input type='text' placeholder='Enter Name' value={description} onChange={(e) => setdescription(e.target.value)} />
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
                                            <label>End Date*</label>
                                            <input type='date' placeholder='Enter Name' value={end_date} onChange={(e) => setend_date(e.target.value)} />
                                        </div>
                                        <div className='col-6'>
                                            <img src={Img1} width={120} height={120} alt='' />
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
    )
}

export default SpecialOffers