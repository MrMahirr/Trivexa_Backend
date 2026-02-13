# Incident Response Plan

This document outlines the steps Trivexa takes in the event of a security incident (Data Breach, DDoS, Ransomware, etc.).
We follow the **NIST** Incident Response Cycle.

## 1. Preparation
- **Tools**: Centralized Logging (ELK/CloudWatch), Monitoring (Prometheus/Grafana).
- **Team**: Security Lead, CTO, Legal Counsel.
- **Drills**: Conducted semi-annually.

## 2. Detection & Analysis
- **Alerts**:
    - High number of 401 Unauthorized responses (Brute Force).
    - Database CPU spike (SQL Injection).
    - New Admin user created (Privilege Escalation).
- **Triage**:
    - **P1 (Critical)**: Data leak, System down.
    - **P2 (High)**: Suspicious activity, no confirmed leak.
    - **P3 (Low)**: Spam, failed scans.

## 3. Containment, Eradication, & Recovery

### 3.1 Containment
- **Disconnect**: Isolate affected servers from the network.
- **Revoke**: Invalidate all active Application Tokens and Force Logout.
- **Block**: Ban malicious IPs at the Firewall/WAF level.

### 3.2 Eradication
- **Patch**: Apply security fixes for the exploited vulnerability.
- **Clean**: Rebuild compromised containers from fresh images.
- **Verify**: Audit code and logs to ensure the attacker is gone.

### 3.3 Recovery
- **Restore**: Recover data from clean backups (Pre-incident).
- **Monitor**: Enhanced monitoring for 48 hours.

## 4. Post-Incident Activity
- **Retrospective**: Write a "Post-Mortem" report.
    - What happened?
    - How did we detect it?
    - How fast did we respond?
- **Improvement**: Update policies and tools to prevent recurrence.
