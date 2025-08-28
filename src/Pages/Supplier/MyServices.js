import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';
import Header from './../../Components/Header';

function MyServices() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setdata] = useState([]);

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
        const storeduserID = localStorage.getItem('userID');
        fetch("api/services/getbyservice/all/"+storeduserID)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setservicedata(data); // Set the data to state
                setLoading(false); // Set loading to false after data is fetched
            })
            .catch(err => {
                setError(err.message); // Handle any errors
                setLoading(false);
            });
    };

    const fetch_subservice = async () => {
        const storeduserID = localStorage.getItem('userID');
        fetch("api/subservices/getsupplier/all/" + storeduserID)
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
        fetch_subservice();
        fetch_service_data();
    }, []);


    const [searchItem, setSearchItem] = useState('');

    const filteredData = data.filter(item =>
        item.sub_service.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.sub_service_id.toString().includes(searchItem)
    );
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

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
    if (error) return <p>Error: {error} + userID</p>;

    return (
        <div className='page'>
            <Header />
            <div className='body'>
                <h1>My service</h1>
                <div id='my-services-pg' className='dash-box1'>
                    {servicedata.map((item) => (
                        <div className='d-box-1' style={{ background: item.color }}>
                            <img
                                src={`api/services/image/${item.service_id}`}
                                width={50} alt=''
                            />
                            <h4>{item.name}</h4>
                        </div>
                    ))}
                </div>
                <h1>Sub Services</h1>
                {data.length === 0 ? <p>No data</p> :
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
                        <div className='table-section'>
                            <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Service</th>
                                        <th>Secondry Image</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.sub_service_id}</td>
                                            <td>{item.sub_service}</td>
                                            <td>{item.service_id}</td>
                                            <td>
                                                <img
                                                    src={`/api/subservices/image/${item.sub_service_id}`}
                                                    width={50} alt=''
                                                />
                                            </td>
                                            <td>
                                                <div className='table-action-btns'>
                                                    <button id='btn-table-edit' className='btn text-success'><BiEdit /></button>
                                                    <button onClick={async (e) => {
                                                        const sub_service_id = item.sub_service_id;
                                                        await axios.post("/api/subservices/delete", {
                                                            sub_service_id
                                                        });
                                                        fetch_subservice();
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
                }
            </div>
        </div>
    )
}

export default MyServices