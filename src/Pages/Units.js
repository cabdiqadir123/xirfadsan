import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';

function Units() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform1] = useState(true);

    const [name, setname] = useState("");
    const [ismultiple, setismultiple] = useState("no");

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


    function hideform_action() {
        if (hideform === true) {
            sethideform1(false)
        } else {
            sethideform1(true)
        }
    }


    const fetchdata = async () => {
        fetch('https://back-end-for-xirfadsan.onrender.com/api/units/all')
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

    const handler = async (e) => {
        try {
            await axios.post("https://back-end-for-xirfadsan.onrender.com/api/units/add", {
                name,
                ismultiple
            });
        } catch (errr) {
            console.log("error jiro");
        }
    };

    const headers = ['Full Name', 'Is Multiple'];

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
                    <h1>Units</h1>
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
                                <label>Is Multiple*</label>
                                <div className='container'>
                                    <div className='row'>
                                        <div className='col-12'>
                                            <input type='checkbox' placeholder='Enter Name' className='checkbox' onChange={(e) => setismultiple("yes")} />
                                        </div>
                                    </div>
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
                                <th>Is Multiple</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.unit_id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.ismultiple}</td>
                                    <td>
                                        <div className='table-action-btns'>
                                            <button id='btn-table-edit' className='btn text-success'><BiEdit /></button>
                                            <button onClick={async (e) => {
                                                const unit_id = item.unit_id;
                                                await axios.post("https://back-end-for-xirfadsan.onrender.com/api/units/delete", {
                                                    unit_id
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

export default Units