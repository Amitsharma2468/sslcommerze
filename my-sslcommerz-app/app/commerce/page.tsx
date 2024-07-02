// pages/index.tsx
"use client"
// pages/index.tsx
import { useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BDT');
  const [message, setMessage] = useState('');

  const handlePayment = async () => {
    try {
      const response = await axios.post('http://localhost:5000/init', {
        amount,
        currency
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        setMessage('Failed to initiate payment.');
      }
    } catch (error:any) {
      setMessage('Error initiating payment: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="w-full max-w-xs">
        <h1 className="text-3xl font-bold mb-4">SSLCommerz Payment</h1>
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 mb-4 w-full"
        />
        <button
          onClick={handlePayment}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Pay Now
        </button>
        {message && <p className="mt-4 text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default Home;
