import React, { useEffect, useState } from 'react'
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import Header from '../Components/Header';
import axios from 'axios';
import { BiEdit } from 'react-icons/bi';

function Complaint() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);


  const [isloadingUpdateBTN, setisloadingUpdateBTN] = useState(false);
  const [selectedrowid, setselectedrowid] = useState("");

  const [data, setdata] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(5);

  const [name, setname] = useState("");
  const [complaint, setcomplaint] = useState("");
  const [issue, setissue] = useState("");
  const [comment, setcomment] = useState("");

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const totalPages = Math.ceil(data.length / itemsPerPage);

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

  const [searchItem, setSearchItem] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredData = data.filter(item => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchItem.toLowerCase()) ||
      item.complaint_id?.toString().includes(searchItem);

    const itemDate = new Date(item.created_at);
    const isWithinDateRange =
      (!startDate || new Date(startDate) <= itemDate) &&
      (!endDate || itemDate <= new Date(endDate));

    return matchesSearch && isWithinDateRange;

  });
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handelupdate = async (e) => {
    e.preventDefault();

    // Save old data for rollback
    const prevData = [...data];

    // Optimistic UI update
    setdata(prev =>
      prev.map(f =>
        f.id === selectedrowid
          ? {
            ...f,
            name,
            complaint,
            created_at: "Updating..."
          }
          : f
      )
    );
    setisloadingUpdateBTN(true);
    try {
      const response = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/complaint/update/${selectedrowid}`,
        { issue, comment },
        { headers: { "Content-Type": "application/json" } }
      );

      fetchdata();
      setisloadingUpdateBTN(false);

    } catch (error) {
      alert("Failed to update FAQ");
      console.error(error);
      setisloadingUpdateBTN(false);
      setdata(prevData);
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
          <h1>Complaint</h1>
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
            <input type='text' onChange={(e) => setSearchItem(e.target.value)} placeholder='Enter Name' />
          </div>
        </div>

        {filteredData.length === 0 || data.length === 0 ? <p>No data</p> :
          <div className='table-section'>
            <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name of Complainer</th>
                  <th>Complaint</th>
                  <th>Issue</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item) => (
                  <tr key={item.complaint_id}>
                    <td>{item.complaint_id}</td>
                    <td>{item.name}</td>
                    <td>{item.complaint}</td>
                    <td>{item.issue}</td>
                    <td>{item.created_at}</td>
                    <td>
                      <div className='table-action-btns'>
                        <button onClick={async (e) => {
                          const id = item.complaint_id;
                          setselectedrowid(id);
                          setname(item.name);
                          setcomplaint(item.complaint);
                          setissue(item.issue);
                          setcomment(item.comment);
                          setShowPopup(true);
                        }} id='btn-table-edit' className='btn text-success'><BiEdit /></button>
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
                      <label>From Date*</label>
                      <input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className='col-6'>
                      <label>From To*</label>
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
                        }} className='btn bg-danger text-light'>Reset</button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
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
                    <div className='col-4'>
                      <label>Issue*{issue}</label>
                      <select value={issue} onChange={(e) => setissue(e.target.value)}>
                        <option>Select Issue Type </option>
                        <option value={"Pending"} >Pending</option>
                        <option value={"Review"} >Review</option>
                        <option value={"Resolved"}>Resolved</option>
                      </select>
                    </div>
                    <div className='col-8'>
                      <label>Comment*</label>
                      <textarea type='text' placeholder='Enter Name' value={comment} onChange={(e) => setcomment(e.target.value)} > </textarea>
                    </div>
                  </div>
                  <div id="form-rows" className="row">
                    <div className="col-4">
                      <div className="form-btns">
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

export default Complaint