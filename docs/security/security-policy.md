# Security Policy

This document defines the high-level security rules for Trivexa.

## 1. Access Policy
- **Principle of Least Privilege**: Users and systems are granted only the minimum permissions necessary.
- **MFA**: Multi-Factor Authentication is mandatory for all Admin and Staff accounts.
- **Offboarding**: Access is revoked immediately (within 1 hour) upon employee termination.

## 2. Data Policy
- **Classification**:
    - **Public**: Marketing content.
    - **Internal**: Project documentation.
    - **Confidential**: Client data, Invoices.
    - **Restricted**: PII, API Keys, Passwords.
- **Handling**: Restricted data must never be shared via Email or Slack. Use 1Password/LastPass.

## 3. Network Policy
- **VPN**: Remote access to internal tools (Staging DB, Admin Dash) requires VPN.
- **Firewall**: Inbound traffic is blocked by default, except for ports 80/443.

## 4. Workstation Policy
- **Disk Encryption**: All developer laptops must have BitLocker/FileVault enabled.
- **Updates**: OS and Browser security patches must be installed within 7 days.
- **Lock Screen**: workstations must lock automatically after 5 minutes of inactivity.

## 5. Vulnerability Reporting
If you discover a security issue:
1.  Do **NOT** exploit it further.
2.  Email `security@trivexa.com` immediately.
3.  Do **NOT** disclose publicly until fixed (Responsible Disclosure).
