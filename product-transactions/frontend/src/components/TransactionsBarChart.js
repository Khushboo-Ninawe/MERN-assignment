import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'recharts';

const TransactionsBarChart = ({ month }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchBarChartData = async () => {
      const response = await axios.get('http://localhost:5000/api/transactions/bar-chart', {
        params: { month },
      });
      const formattedData = Object.keys(response.data).map((range) => ({
        priceRange: range,
        itemCount: response.data[range],
      }));
      setData(formattedData);
    };
    fetchBarChartData();
  }, [month]);

  return (
    <BarChart width={600} height={300} data={data}>
      <XAxis dataKey="priceRange" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="itemCount" fill="#8884d8" />
    </BarChart>
  );
};

export default TransactionsBarChart;
