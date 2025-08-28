// src/NotifySender.js
import React, { useState } from 'react';
import axios from 'axios';

const NotifySender = () => {
  const [message, setMessage] = useState("");

  const handleSendNotification = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/send/send-data', { // change to your actual backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Hello',
          body: message,
          token: 'dluimm0nQzqj0SG8f04438:APA91bHV7hmzTvuDb1JzUKI299d2i-9rxT7m2Y_8pfUQstGLIldA0NEdYJii1TPhIHt9QBDcMHpIccBQbbpmx6aGjZmyQwjkiDBY3Zc-CfOXLEl1HJUjwWs',
        }),
      });

      const data = await response.json();
      console.log('Notification Response:', data);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <div>
      <h2>Send Notification</h2>
      <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Notification message" />
      <button onClick={handleSendNotification}>Send</button>
    </div>
  );
};

export default NotifySender;
