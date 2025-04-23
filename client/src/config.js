const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://jobnest.onrender.com/api'
    : 'http://localhost:6005/api'
};

export default config;