import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { BiEdit, BiTrash } from 'react-icons/bi';
import Header from '../Components/Header';

function Blog() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(false);
    const [hideformtitle, sethideformtitle] = useState("Open");

    const [isloadingBTN, setisloadingBTN] = useState(false);

    const [isloadingUpdateBTN, setisloadingUpdateBTN] = useState(false);

    const [data, setdata] = useState([]);

    const [title, settitle] = useState("");
    const [blog, setblog] = useState("");
    const [image, setImage] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const [selectedrowid, setselectedrowid] = useState("");

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
        fetch('https://back-end-for-xirfadsan.onrender.com/api/blog/all')
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
    // In your render, merge tempBlogs and fetched data
    const [tempBlogs, setTempBlogs] = useState([]); // New temporary blogs
    const combinedData = [...data, ...tempBlogs];

    const filteredData = combinedData.filter(item =>
        item.title.toLowerCase().includes(searchItem.toLowerCase()) ||
        item.id.toString().includes(searchItem)
    );
    // Pagination
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handler = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('blog', blog);
        formData.append('image', image);

        // Create a temporary blog object for optimistic UI
        const maxId = data.length > 0 ? Math.max(...data.map(item => item.id)) : 0;
        const tempId = maxId + 1;

        const tempBlog = {
            id: tempId, // temporary ID
            title,
            blog,
            imageUrl: URL.createObjectURL(image), // display image immediately
        };

        // Optimistic update: show temp blog immediately
        setTempBlogs((prev) => [...prev, tempBlog]);
        sethideform(false);
        sethideformtitle("Open");
        setisloadingBTN(true);

        try {
            const response = await axios.post('https://back-end-for-xirfadsan.onrender.com/api/blog/add', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log(response);

            // Refresh data from server
            fetchdata();
            setTempBlogs([]); // clear temporary blogs
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');

            // Rollback optimistic update
            setTempBlogs([]);
            fetchdata();
        } finally {
            setisloadingBTN(false);
        }
    };

    const handelupdate = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", title);
        formData.append("blog", blog);

        // Append new image only if a new one is selected
        if (image instanceof File) {
            formData.append("image", image);
        }

        // Optimistic update: update table locally immediately
        setdata((prev) =>
            prev.map((item) =>
                item.id === selectedrowid
                    ? {
                        ...item,
                        title,
                        blog,
                        imageUrl: image instanceof File ? URL.createObjectURL(image) : item.imageUrl,
                    }
                    : item
            )
        );

        try {
            setisloadingUpdateBTN(true);

            const response = await axios.put(`https://back-end-for-xirfadsan.onrender.com/api/blog/update/${selectedrowid}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log(response);
            fetchdata(); // Refresh data from server to ensure consistency
        } catch (error) {
            console.error("Error updating blog:", error);
            alert("Failed to update blog");
            fetchdata(); // rollback if server update fails
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
                    <h1>Blog</h1>
                    <button onClick={hideform_action}>{hideformtitle}</button>
                </div>
                {hideform && <form className='form'>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-6'>
                                <label>Blog*</label>
                                <input type='text' placeholder='Enter title' onChange={(e) => settitle(e.target.value)} />
                            </div>
                            <div className='col-6'>
                                <label>Blog*</label>
                                <input type='text' placeholder='Enter Blog' onChange={(e) => setblog(e.target.value)} />
                            </div>
                        </div>
                        <div id='form-rows' className='row'>
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
                                    <th>Title</th>
                                    <th>Blog</th>
                                    <th>Image</th>
                                    <th>Created_at</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.title}</td>
                                        <td>{item.blog}</td>
                                        <td>
                                            <img
                                                src={item.imageUrl ? item.imageUrl : `https://back-end-for-xirfadsan.onrender.com/api/blog/image/${item.id}`} // Use temp image if exists
                                                width={70} alt=''
                                            />
                                        </td>
                                        <td>{item.created_at || "Uploading..."}</td> {/* Show placeholder for temp blogs */}
                                        <td>
                                            <div className='table-action-btns'>
                                                <button
                                                    onClick={() => {
                                                        setselectedrowid(item.id);
                                                        settitle(item.title);
                                                        setblog(item.blog);
                                                        setShowPopup(true);
                                                    }}
                                                    id='btn-table-edit'
                                                    className='btn text-success'
                                                >
                                                    <BiEdit />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const id = item.id;

                                                        // Optimistic delete: remove from both tempBlogs and data
                                                        setTempBlogs((prev) => prev.filter((s) => s.id !== id));
                                                        setdata((prev) => prev.filter((s) => s.id !== id));

                                                        try {
                                                            await axios.post("https://back-end-for-xirfadsan.onrender.com/api/blog/delete", { id });
                                                        } catch (error) {
                                                            console.error("Failed to delete blog:", error);
                                                            fetchdata();
                                                            alert("Failed to delete. Please try again.");
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
                },
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
                            <form className="form">
                                <div className="container">
                                    <div id="form-rows" className="row">
                                        <div className="col-6">
                                            <label>Title*</label>
                                            <input
                                                type="text"
                                                placeholder="Enter title"
                                                value={title}
                                                onChange={(e) => settitle(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label>Blog*</label>
                                            <input
                                                type="text"
                                                placeholder="Enter Blog"
                                                value={blog}
                                                onChange={(e) => setblog(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div id="form-rows" className="row">
                                        <div className="col-6">
                                            <label>Image*</label>
                                            <div className="filepicker">
                                                <input type="text" placeholder="Enter Name"value={image} />
                                                <input type="file" className="input-file-picker" onChange={handleFileChange} />
                                            </div>
                                        </div>
                                    </div>
                                    <div id="form-rows" className="row">
                                        <div className="col-4">
                                            <div className="form-btns">
                                                <button onClick={handelupdate} type="submit" className="btn bg-primary text-light">
                                                    {isloadingUpdateBTN ? "Updating..." : "Update"}
                                                </button>
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

export default Blog