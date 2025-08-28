import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';
import Header from '../Components/Header';

function Testimonials() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hideform, sethideform] = useState(false);

  const [hideformtitle, sethideformtitle] = useState("Open");
  const [selectedrowid, setselectedrowid] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [isloadingBTN, setisloadingBTN] = useState(false);

  const [isloadingUpdateBTN, setisloadingUpdateBTN] = useState(false);

  const [data, setdata] = useState([]);

  const [name, setname] = useState("");
  const [description, setdescription] = useState("");
  const [image, setImage] = useState(null);

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
      sethideform(true)
      sethideformtitle("Close");
      setselectedrowid("");
    }
  }

  const fetchdata = async () => {
    fetch('https://back-end-for-xirfadsan.onrender.com/api/testimonial/all')
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
    item.name?.toLowerCase().includes(searchItem.toLowerCase()) ||
    item.testimonial_id?.toString().includes(searchItem)
  );

  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image);

    // Save old data for rollback
    const prevData = [...data];

    // Create optimistic testimonial
    const maxId = data.length > 0 ? Math.max(...data.map(t => t.id)) : 0;
    const tempId = maxId + 1;
    const tempTestimonial = {
      id: tempId,
      name,
      description,
      imageUrl: image ? URL.createObjectURL(image) : "",
      created_at: "Uploading..."
    };

    // Optimistic update
    setdata(prev => [...prev, tempTestimonial]);
    sethideform(false);
    sethideformtitle("Open");
    setisloadingBTN(true);

    try {
      const response = await axios.post("https://back-end-for-xirfadsan.onrender.com/api/testimonial/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(response.data);
      // Option A: refresh from server
      fetchdata();

      setdata(prev =>
        prev.map(t =>
          t.testimonial_id === tempId       // find the optimistic entry
            ? response.data.testimonial  // replace it with real testimonial from server
            : t                 // keep all others unchanged
        )
      );

    } catch (error) {
      console.error("Error uploading testimonial:", error);
      alert("Failed to upload testimonial");

      // Rollback optimistic entry
      setdata(prevData);
    }
  };

  const handelupdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    if (image instanceof File) {
      formData.append("image", image);
    }

    // Keep a copy of the previous state for rollback
    const prevServices = [...data];

    // Optimistic update in UI
    setdata(prev =>
      prev.map(s =>
        s.testimonial_id === selectedrowid
          ? {
            ...s,
            name,
            description,
            imageUrl: image instanceof File ? URL.createObjectURL(image) : s.imageUrl,
            created_at: "Uploading..."
          }
          : s
      )
    );

    setisloadingUpdateBTN(true);

    try {
      await axios.put(`https://back-end-for-xirfadsan.onrender.com/api/testimonial/update/${selectedrowid}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Replace temp optimistic update with actual server data
      fetchdata();
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Failed to update service');

      // Rollback to previous state
      setdata(prevServices);
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
          <h1>Testimonials</h1>
          <button onClick={hideform_action}>{hideformtitle}</button>
        </div>
        {hideform && <form className='form'>
          <div className='container'>
            <div id='form-rows' className='row'>
              <div className='col-6'>
                <label>Name*</label>
                <input type='text' placeholder='Enter Name' onChange={(e) => setname(e.target.value)} />
              </div>
              <div className='col-6'>
                <label>Description*</label>
                <input type='text' placeholder='Enter Description' onChange={(e) => setdescription(e.target.value)} />
              </div>
            </div>
            <div id='form-rows' className='row'>
              <div className='col-6'>
                <label>Profile Image*</label>
                <div className='filepicker'>
                  <input type='text' placeholder='Enter Name' />
                  <input type='file' className='input-file-picker' onChange={handleFileChange} />
                </div>
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
                  <th>Name</th>
                  <th>Description</th>
                  <th>Image</th>
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
                    <td>
                      <img
                        src={`https://back-end-for-xirfadsan.onrender.com/api/testimonial/image/${item.testimonial_id}`}
                        width={70} alt=''
                      />
                    </td>
                    <td>{item.created_at}</td>
                    <td>
                      <div className='table-action-btns'>
                        <button onClick={async (e) => {
                          const testimonial_id = item.testimonial_id;
                          setselectedrowid(testimonial_id);
                          setname(item.name);
                          setdescription(item.description);
                          setShowPopup(true);
                        }} id='btn-table-edit' className='btn text-success'><BiEdit /></button>
                        <button
                          onClick={async () => {
                            const testimonial_id = item.testimonial_id;

                            setdata((prev) => prev.filter((row) => row.testimonial_id !== testimonial_id));

                            try {
                              // 2. Fire both deletes in parallel
                              await axios.post("https://back-end-for-xirfadsan.onrender.com/api/testimonial/delete", {
                                testimonial_id
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
                      <label>Name*</label>
                      <input type='text' placeholder='Enter Name' value={name} onChange={(e) => setname(e.target.value)} />
                    </div>
                    <div className='col-6'>
                      <label>Description*</label>
                      <input type='text' placeholder='Enter Description' value={description} onChange={(e) => setdescription(e.target.value)} />
                    </div>
                  </div>
                  <div id='form-rows' className='row'>
                    <div className='col-6'>
                      <label>Profile Image*</label>
                      <div className='filepicker'>
                        <input type='text' placeholder='Enter Name' value={image} />
                        <input type='file' className='input-file-picker' onChange={handleFileChange} />
                      </div>
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

export default Testimonials