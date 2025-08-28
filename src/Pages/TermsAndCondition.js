import React, { useEffect, useState } from 'react'
import axios from 'axios';
import Header from '../Components/Header';

function TermsAndCondition() {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideform, sethideform] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const [isloadingBTN, setisloadingBTN] = useState(false);

    const [isloadingUpdateBTN, setisloadingUpdateBTN] = useState(false);

    const [hideformtitle, sethideformtitle] = useState("Open");
    const [selectedrowid, setselectedrowid] = useState("");

    const [term, setterm] = useState("");

    const [data, setdata] = useState([]);

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
        fetch('/api/terms/all')
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
        e.preventDefault();
        const prevData = [...data];

        const maxId = data.length > 0 ? Math.max(...data.map(f => f.id)) : 0;
        const tempId = maxId + 1;
        const tempFaq = {
            id: tempId,
            term
        };

        setdata(prev => [...prev, tempFaq]);
        sethideform(false);
        sethideformtitle("Open");
        setisloadingBTN(true);

        try {
            await axios.post("/api/terms/add", {
                term,
            });

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
                        term
                    }
                    : f
            )
        );
        setisloadingUpdateBTN(true);
        try {
            const response = await axios.put(`/api/terms/update/${selectedrowid}`, {
                term: term,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className='page'>
            <Header />
            <div className='body'>
                <div className='add-btn'>
                    <h1>Terms And Condition</h1>
                    {data && data.length > 0 ? (<div></div>) : <button onClick={hideform_action}>{hideformtitle}</button>}
                </div>
                {hideform && <form className='form'>
                    <div className='container'>
                        <div id='form-rows' className='row'>
                            <div className='col-12'>
                                <label>Terms And Condition*</label>
                                <textarea placeholder='Enter Terms' value={term} onChange={(e) => setterm(e.target.value)} />
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
                <div className='table-section'>
                    <table border="1" style={{ width: '100%', marginBottom: '20px' }}>
                        {data && data.length > 0 ? (
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.term}</td>
                                    </tr>
                                ))}
                            </tbody>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                No Terms And Condition data.
                            </div>
                        )}
                    </table>
                    <div className='table-bottom'>
                        <div className='table-print-section'>
                            <button onClick={() => {
                                if (Array.isArray(data) && data.length > 0) {
                                    setterm(data[0].term);
                                    setShowPopup(true);
                                } else if (data.term) {
                                    setterm(data.term);
                                    setShowPopup(true);
                                } else {
                                    console.log('No term found');
                                }
                                setShowPopup(true);
                            }}>Update</button>
                        </div>
                    </div>
                </div>
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
                                        <div className='col-12'>
                                            <label>Terms And Condition*</label>
                                            <textarea placeholder='Enter Terms' value={term} onChange={(e) => setterm(e.target.value)} />
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

export default TermsAndCondition