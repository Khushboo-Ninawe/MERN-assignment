const axios = require('axios');
const Transaction = require('../models/Transaction');

// Initialize database with seed data
exports.initializeDatabase = async (req, res) => {
  try {
    const { data } = await axios.get(process.env.THIRD_PARTY_API_URL);
    await Transaction.deleteMany({});
    await Transaction.insertMany(data);
    res.status(200).json({ message: 'Database initialized with seed data' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List all transactions with search and pagination
exports.listTransactions = async (req, res) => {
  try {
    const { search = '', page = 1, perPage = 10, month } = req.query;
    const regex = new RegExp(search, 'i');
    const transactions = await Transaction.find({
      dateOfSale: { $regex: new RegExp(`-${month}-`, 'i') },
      $or: [{ title: regex }, { description: regex }, { price: regex }],
    })
    .skip((page - 1) * perPage)
    .limit(Number(perPage));
    
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Statistics API
exports.getStatistics = async (req, res) => {
  try {
    const { month } = req.query;
    const transactions = await Transaction.find({
      dateOfSale: { $regex: new RegExp(`-${month}-`, 'i') }
    });

    const totalSaleAmount = transactions.reduce((acc, transaction) => acc + (transaction.isSold ? transaction.price : 0), 0);
    const totalSoldItems = transactions.filter(transaction => transaction.isSold).length;
    const totalNotSoldItems = transactions.filter(transaction => !transaction.isSold).length;

    res.status(200).json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bar Chart Data API
exports.getBarChartData = async (req, res) => {
  try {
    const { month } = req.query;
    const transactions = await Transaction.find({
      dateOfSale: { $regex: new RegExp(`-${month}-`, 'i') }
    });

    const priceRanges = {
      '0-100': 0,
      '101-200': 0,
      '201-300': 0,
      '301-400': 0,
      '401-500': 0,
      '501-600': 0,
      '601-700': 0,
      '701-800': 0,
      '801-900': 0,
      '901-above': 0,
    };

    transactions.forEach(transaction => {
      const price = transaction.price;
      if (price >= 0 && price <= 100) priceRanges['0-100']++;
      else if (price > 100 && price <= 200) priceRanges['101-200']++;
      else if (price > 200 && price <= 300) priceRanges['201-300']++;
      else if (price > 300 && price <= 400) priceRanges['301-400']++;
      else if (price > 400 && price <= 500) priceRanges['401-500']++;
      else if (price > 500 && price <= 600) priceRanges['501-600']++;
      else if (price > 600 && price <= 700) priceRanges['601-700']++;
      else if (price > 700 && price <= 800) priceRanges['701-800']++;
      else if (price > 800 && price <= 900) priceRanges['801-900']++;
      else priceRanges['901-above']++;
    });

    res.status(200).json(priceRanges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pie Chart Data API
exports.getPieChartData = async (req, res) => {
  try {
    const { month } = req.query;
    const transactions = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: new RegExp(`-${month}-`, 'i') } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Combined API
exports.getCombinedData = async (req, res) => {
  try {
    const { month } = req.query;

    const statisticsPromise = this.getStatistics(req, res);
    const barChartDataPromise = this.getBarChartData(req, res);
    const pieChartDataPromise = this.getPieChartData(req, res);

    const [statistics, barChartData, pieChartData] = await Promise.all([statisticsPromise, barChartDataPromise, pieChartDataPromise]);

    res.status(200).json({
      statistics: statistics.data,
      barChartData: barChartData.data,
      pieChartData: pieChartData.data,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
