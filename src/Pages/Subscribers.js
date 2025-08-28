import React, { useEffect, useState } from 'react'
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import Header from '../Components/Header';

function Subscribers() {
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

  const fetchdata = async () => {
    fetch('/api/subscriber/all')
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

  const filteredData = data.filter(item =>
    item.email.toLowerCase().includes(searchItem.toLowerCase()) ||
    item.id.toString().includes(searchItem)
  );
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // const handler = async (e) => {
  //   try {
  //     await axios.post("/api/subscriber/add", {
  //       email,
  //     });
  //   } catch (errr) {
  //     console.log("error jiro");
  //   }
  // };

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
          <h1>Subscribers</h1>
        </div>
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
                  <th>emails</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.email}</td>
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

export default Subscribers

