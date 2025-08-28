import React, { useEffect, useState } from 'react'
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import Header from './../../Components/Header';

function ViewEarning() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(false);

    const [status, setstatus] = useState('');

    const [data, setdata] = useState([]);

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
        } else {
            sethideform(true)
        }
    }

    const fetchdata = async () => {
        fetch('/api/earning/all')
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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredData = data.filter(item => {
        const matchesSearch =
            item.status.toLowerCase().includes(searchItem.toLowerCase()) ||
            item.book_id.toString().includes(searchItem);

        const itemDate = new Date(item.created_at);
        const isWithinDateRange =
            (!startDate || new Date(startDate) <= itemDate) &&
            (!endDate || itemDate <= new Date(endDate));

        const matchesStatus =
            !status || item.status === status;

        return matchesSearch && isWithinDateRange && matchesStatus;

    });
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

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
                    <h1>Earnings</h1>
                    <button onClick={hideform_action}>New</button>
                </div>
                {hideform && <form className='form'>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-4'>
                                <label>Select Booking Status*</label>
                                <select value={status} onChange={(e) => setstatus(e.target.value)}>
                                    <option value="">Select Booking Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>
                            <div className='col-4'>
                                <label>From Date*</label>
                                <input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className='col-4'>
                                <label>To Date*</label>
                                <input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
                            <div className='col-4'>
                                <div className='form-btns'>
                                    <button onClick={() => {
                                        setSearchItem('');
                                        setStartDate('');
                                        setEndDate('');
                                        setstatus('');
                                    }} className='btn bg-danger text-light'>Reset</button>
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
                        <input type='text' onChange={(e) => setSearchItem(e.target.value)} placeholder='Enter Name' />
                    </div>
                </div>

                {filteredData.length === 0 || data.length === 0 ? <p>No data</p> :
                    <div className='table-section'>
                        <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
                            <thead>
                                <tr>
                                    <th>Book ID #</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.book_id}</td>
                                        <td>{item.amount}</td>
                                        <td>{item.status}</td>
                                        <td>{item.created_at}</td>
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

export default ViewEarning