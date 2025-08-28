import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash  } from 'react-icons/bi';
import Header from './../../Components/Header';

function ManageAvaibility() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(true);

    const [data, setdata] = useState([]);

    const [name, setname] = useState("");
    const [description, setdescription] = useState("");

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

    const [cusomerdata, setcusomerdata] = useState([]);
    const fetch_customer_data = async () => {
        const rptdata = await axios.get("/api/user/customer/all");
        const resltdata = rptdata.data;
        setcusomerdata(resltdata);
    };

    const fetchdata = async () => {
        fetch('/api/testimonial/all')
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
    }, []);

    const handler = async () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        try {
            const response = await axios.post('/api/testimonial/add', formData, {
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
            <Header/>
            <div className='body'>
                <div className='add-btn'>
                    <h1>Manage Avaibility</h1>
                    <button onClick={hideform_action}>New</button>
                </div>
                {hideform && <form className='form' onSubmit={handler}>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-12'>
                                <label>Name*</label>
                                <select>
                                    <option>Select Customer</option>
                                    {cusomerdata.map((item) => (
                                        <option>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-12'>
                                <label>Reason*</label>
                                <input type='text' placeholder='Enter Description' onChange={(e) => setdescription(e.target.value)} />
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
                                <th>Name</th>
                                <th>Reason</th>
                                <th>created_at</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.testimonial_id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.description}</td>
                                    <td>{item.created_at}</td>
                                    <td>
                                        <div className='table-action-btns'>
                                            <button id='btn-table-edit' className='btn text-success'><BiEdit /></button>
                                            <button onClick={async (e) => {
                                                const testimonial_id = item.testimonial_id;
                                                await axios.post("/api/testimonial/delete", {
                                                    testimonial_id
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

export default ManageAvaibility