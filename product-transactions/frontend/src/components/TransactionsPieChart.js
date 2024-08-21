import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Tooltip } from 'recharts';

const TransactionsPieChart = ({ month }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchPieChartData = async () => {
      const response = await axios.get('http://localhost:5000/api/transactions/pie-chart', {
        params: { month },
      });
      setData(response.data.map((item) => ({ name: item._id, value: item.count })));
    };
    fetchPieChartData();
  }, [month]);

  return (
    <PieChart width={400} height={400}>
      <Pie
        dataKey="value"
        isAnimationActive={false}
        data={data}
        cx={200}
        cy={200}
        outerRadius={80}
        fill="#8884d8"
        label
      />
      <Tooltip />
    </PieChart>
  );
};

export default TransactionsPieChart;
