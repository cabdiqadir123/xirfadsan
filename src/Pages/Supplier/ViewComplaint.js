import React, { useEffect, useState } from 'react'
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import Header from './../../Components/Header';

function ViewComplaint() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hideform, sethideform] = useState(true);

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
      sethideform(false)
    } else {
      sethideform(true)
    }
  }

  const fetchdata = async () => {
    fetch('https://back-end-for-xirfadsan.onrender.com/api/complaint/all')
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
          <h1>Complaint</h1>
          <button onClick={hideform_action}>New</button>
        </div>
        {hideform && <form className='form'>
          <div className='container'>
            <div id='form-rows' className='row'>
              <div className='col-6'>
                <label>From Date*</label>
                <input type='date' placeholder='enter complaint' />
              </div>
              <div className='col-6'>
                <label>From To*</label>
                <input type='date' placeholder='enter complaint' />
              </div>
            </div>
            <div id='form-rows' className='row'>
              <div className='col-4'>
                <div className='form-btns'>
                  <button className='btn bg-danger text-light'>Reset</button>
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
            <input type='text' placeholder='Enter Name' />
          </div>
        </div>
        <div className='table-section'>
          <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name of Complainer</th>
                <th>Complaint</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => (
                <tr key={item.complaint_id}>
                  <td>{item.complaint_id}</td>
                  <td>{item.name}</td>
                  <td>{item.complaint}</td>
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
      </div>
    </div>
  )
}

export default ViewComplaint