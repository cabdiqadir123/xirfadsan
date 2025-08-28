import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';
import Header from '../Components/Header';

function Faq() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hideform, sethideform] = useState(false);

  const [showPopup, setShowPopup] = useState(false);

  const [isloadingBTN, setisloadingBTN] = useState(false);

  const [isloadingUpdateBTN, setisloadingUpdateBTN] = useState(false);

  const [hideformtitle, sethideformtitle] = useState("Open");
  const [selectedrowid, setselectedrowid] = useState("");

  const [data, setdata] = useState([]);

  const [question, setquestion] = useState("");
  const [answer, setanswer] = useState("");

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
      sethideformtitle("Open");
    } else {
      sethideform(true);
      sethideformtitle("Close");
      setselectedrowid("");
    }
  }

  const fetchdata = async () => {
    fetch('https://back-end-for-xirfadsan.onrender.com/api/faq/all')
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

  const [Tempdata, setTempdata] = useState([]);

  const combinedData = [...data, ...Tempdata];

  const filteredData = combinedData.filter(item =>
    item.question?.toLowerCase().includes(searchItem.toLowerCase()) ||
    item.faq_id?.toString().includes(searchItem)
  );

  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handler = async (e) => {
    e.preventDefault();
    const prevData = [...data];

    const maxId = data.length > 0 ? Math.max(...data.map(f => f.id)) : 0;
    const tempId = maxId + 1;
    const tempFaq = {
      id: tempId,
      question,
      answer,
      created_at: "Uploading..."
    };

    setdata(prev => [...prev, tempFaq]);
    sethideform(false);
    sethideformtitle("Open");
    setisloadingBTN(true);

    try {
      await axios.post("https://back-end-for-xirfadsan.onrender.com/api/faq/add", { question, answer });

      fetchdata();
      setisloadingBTN(false);
    } catch (err) {
      console.error("Error adding FAQ:", err);
      alert("Failed to add FAQ");
      setdata(prevData);
    }
  };

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
            question,
            answer,
            updated_at: "Updating..."
          }
          : f
      )
    );
    setisloadingUpdateBTN(true);
    try {
      const response = await axios.put(
        `https://back-end-for-xirfadsan.onrender.com/api/faq/update/${selectedrowid}`,
        { question, answer },
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
      sethideform(false);
      sethideformtitle("Open");
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
          <h1>Faq</h1>
          <button onClick={hideform_action}>{hideformtitle}</button>
        </div>
        {hideform && <form className='form'>
          <div className='container'>
            <div id='form-rows' className='row'>
              <div className='col-6'>
                <label>Question*</label>
                <textarea placeholder='Enter The answer' onChange={(e) => setquestion(e.target.value)} />
              </div>
              <div className='col-6'>
                <label>Answers*</label>
                <textarea placeholder='Enter The answer' onChange={(e) => setanswer(e.target.value)} />
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
                  <th>Questions</th>
                  <th>Answers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item) => (
                  <tr key={item.faq_id}>
                    <td>{item.faq_id}</td>
                    <td>{item.question}</td>
                    <td>{item.answer}</td>
                    <td>
                      <div className='table-action-btns'>
                        <button onClick={async (e) => {
                          const faq_id = item.faq_id;
                          setselectedrowid(faq_id);
                          setquestion(item.question);
                          setanswer(item.answer);
                          setShowPopup(true);
                        }} id='btn-table-edit' className='btn text-success'><BiEdit /></button>
                        <button
                          onClick={async () => {
                            const faq_id = item.faq_id;

                            setdata((prev) => prev.filter((row) => row.faq_id !== faq_id));

                            try {
                              // 2. Fire both deletes in parallel
                              await axios.post("https://back-end-for-xirfadsan.onrender.com/api/faq/delete", {
                                faq_id
                              });
                              fetchdata();
                            } catch (error) {
                              console.error("Delete failed:", error);

                              // 3. Rollback if failed
                              fetchdata();
                              alert("Failed to delete staff. Please try again.");
                            }
                          }}
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
                      <label>Question*</label>
                      <textarea placeholder='Enter The answer' value={question} onChange={(e) => setquestion(e.target.value)} />
                    </div>
                    <div className='col-6'>
                      <label>Answers*</label>
                      <textarea placeholder='Enter The answer' value={answer} onChange={(e) => setanswer(e.target.value)} />
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

export default Faq