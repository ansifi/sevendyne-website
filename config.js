// API Configuration for Sevendyne Frontend
// This file handles switching between development and production API URLs

const CONFIG = {
    // Detect environment
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    // API Base URLs
    API_URLS: {
        development: 'http://localhost:5000/api',
        production: 'https://your-backend-domain.com/api' // Update with your production backend URL
    },

    // Get current API URL based on environment
    getApiUrl() {
        return this.isDevelopment ? this.API_URLS.development : this.API_URLS.production;
    }
};

// Export for use in other files
window.APP_CONFIG = CONFIG;

console.log('🔧 Environment:', CONFIG.isDevelopment ? 'Development' : 'Production');
console.log('🌐 API URL:', CONFIG.getApiUrl());

