jest.mock('./src/config/logger.js', () => ({
    info: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));
