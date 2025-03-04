// This file is for local development only
// For production, use Vercel Cron Jobs instead

const cron = require('node-cron');
const axios = require('axios');

// Schedule a task to run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running documentation fetch cron job...');

  try {
    // Call your fetch API endpoint to update the documentation
    // Replace with your actual deployed URL in production
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const response = await axios.get(
      `${baseUrl}/api/fetch?key=${process.env.ADMIN_KEY || 'dev-key'}`
    );

    console.log('Cron job result:', response.data);
  } catch (error) {
    console.error('Error running cron job:', error.message);
  }
});

console.log('Cron job scheduled');
