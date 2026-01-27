"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = void 0;
// CORS configuration
exports.corsConfig = {
    origin: ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(',')) || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
    maxAge: 86400, // 24 hours
};
