// Simple test script to verify API endpoints
const express = require('express');
const app = express();

// Import the API handler
const apiHandler = require('./api/index.ts').default;

// Test the API handler
async function testAPI() {
  console.log('Testing API endpoints...');
  
  // Mock request and response objects
  const mockReq = {
    method: 'GET',
    path: '/api/health',
    url: '/api/health',
    headers: {}
  };
  
  const mockRes = {
    status: (code) => {
      console.log(`Status: ${code}`);
      return mockRes;
    },
    json: (data) => {
      console.log('Response:', JSON.stringify(data, null, 2));
      return mockRes;
    },
    header: () => mockRes,
    sendStatus: (code) => {
      console.log(`Send Status: ${code}`);
      return mockRes;
    },
    headersSent: false
  };
  
  try {
    await apiHandler(mockReq, mockRes);
    console.log('API test completed successfully');
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();