import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';

function Product() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(true);

    const [data, setdata] = useState([]);

    const [name, setname] = useState("");
    const [sub_service_id, setsub_service_id] = useState("");
    const [unit_id, setunit_id] = useState("");
    const [descibtion, setdescibtion] = useState("");
    const [image, setimage] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setitemsPerPage] = useState(5);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = data.slice(indexOfFirstItem, indexOfLastItem);
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

    const [servicedata, setservicedata] = useState([]);
    const fetch_service_data = async () => {
        const rptdata = await axios.get("/api/services/all");
        const resltdata = rptdata.data;
        setservicedata(resltdata);
    };

    const [sub_servicedata, setsub_servicedata] = useState([]);
    const fetch_subservice_data = async (id) => {
        const rptdata = await axios.get("/api/subservices/service/all/"+id);
        const resltdata = rptdata.data;
        setsub_servicedata(resltdata);
    };

    const [unitdata, setunitdata] = useState([]);
    const fetch_unit_data = async () => {
        const rptdata = await axios.get("/api/units/all");
        const resltdata = rptdata.data;
        setunitdata(resltdata);
    };

    const fetchdata = async () => {
        fetch('/api/product/all')
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
        fetch_unit_data();
    }, []);

    const handleserviceidChange = (e) => {
        fetch_subservice_data(e.target.value);
    };

    const handleFileChange = (e) => {
        setimage(e.target.files[0]);
    };

    const handler = async () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('sub_service_id', sub_service_id);
        formData.append('unit_id', unit_id);
        formData.append('descibtion', descibtion);
        formData.append('image', image);
        try {
            const response = await axios.post('/api/product/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response);
            alert('Image uploaded successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
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
            <div className='top-header'>
                Super admin
            </div>
            <div className='body'>
                <div className='add-btn'>
                    <h1>Product</h1>
                    <button onClick={hideform_action}>New</button>
                </div>
                {hideform && <form className='form' onSubmit={handler}>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Name*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setname(e.target.value)} />
                            </div>
                            <div className='col-6'>
                                <label>Select Service*</label>
                                <select onChange={handleserviceidChange}>
                                    <option>Select service</option>
                                    {servicedata.map((item) => (
                                        <option>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Select Sub Service*</label>
                                <select onChange={(e) => setsub_service_id(e.target.value)}>
                                    <option>Select Sub service</option>
                                    {sub_servicedata.map((item) => (
                                        <option>{item.sub_service}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='col-6'>
                                <label>Select Units*</label>
                                <select onChange={(e) => setunit_id(e.target.value)}>
                                    <option>Select units</option>
                                    {unitdata.map((item) => (
                                        <option>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Descibtion*</label>
                                <input type='text' placeholder='Enter Name' onChange={(e) => setdescibtion(e.target.value)} />
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
                        <input type='text' placeholder='Enter Name' required />
                    </div>
                </div>
                <div className='table-section'>
                    <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Sub Service</th>
                                <th>Unit</th>
                                <th>Image</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.product_id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.sub_service_id}</td>
                                    <td>{item.unit_id}</td>
                                    <td>
                                        <img
                                            src={`/api/product/image/${item.product_id}`}
                                            width={70} alt=''
                                        />
                                    </td>
                                    <td>
                                        <div className='table-action-btns'>
                                            <button id='btn-table-edit' className='btn text-success'><BiEdit /></button>
                                            <button onClick={async (e) => {
                                                const product_id = item.product_id;
                                                await axios.post("/api/product/delete", {
                                                    product_id
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

export default Product