import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Service_requests() {
  const [image, setImage] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Fetch all images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  // Fetch images from the backend
  const fetchImages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/images');
      setUploadedImages(response.data); // Store the image IDs and names
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Failed to fetch images');
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!image) {
      alert('Please select an image');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      // Post request to upload the image to the backend
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response);
      alert('Image uploaded successfully');
      fetchImages(); // Refresh the list of images
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  return (
    <div className="App">
      <h1>Upload and Display Images</h1>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Image</button>

      <hr />

      <h2>Uploaded Images</h2>
      <table border="1" style={{ width: '100%', marginTop: '20px' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {uploadedImages.map((image) => (
            <tr key={image.id}>
              <td>{image.id}</td>
              <td>
                {/* Display image thumbnail inside the table */}
                <img
                  src={`http://localhost:5000/image/${image.id}`}
                  alt={image.image_name}
                  style={{ maxWidth: '100px', height: 'auto' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Service_requests;
