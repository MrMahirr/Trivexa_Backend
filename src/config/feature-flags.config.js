"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureFlagsConfig = void 0;
// Feature flags configuration
exports.featureFlagsConfig = {
    // Auth features
    enableMfa: process.env.FEATURE_MFA === 'true',
    enableOAuth: process.env.FEATURE_OAUTH === 'true',
    // Accounting features
    enableInvoicing: process.env.FEATURE_INVOICING !== 'false',
    enableExpenses: process.env.FEATURE_EXPENSES !== 'false',
    // Notifications
    enableEmailNotifications: process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'false',
    enablePushNotifications: process.env.FEATURE_PUSH_NOTIFICATIONS === 'true',
    // Audit
    enableAuditLog: process.env.FEATURE_AUDIT_LOG !== 'false',
};
