// Jest setup file for additional configuration
// This file runs before each test file

// Set up any global test utilities or mocks here

// Polyfill for TextEncoder/TextDecoder (required by jsdom)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
