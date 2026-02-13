# Contracts

## CRUD
GET /contracts  
GET /contracts/:id  
POST /contracts  
PUT /contracts/:id  
DELETE /contracts/:id

## Actions
PATCH /contracts/:id/submit  
POST  /contracts/:id/approve  
POST  /contracts/:id/reject  
PATCH /contracts/:id/activate  
PATCH /contracts/:id/terminate  
PATCH /contracts/:id/renew

## Files
GET  /contracts/:id/document  
POST /contracts/:id/upload  
GET  /contracts/:id/signed-document

## Approvals & Reminders
GET  /contracts/:id/approvals  
POST /contracts/:id/approvals

GET  /contracts/:id/reminders  
POST /contracts/:id/reminders

## Stats
GET /contracts/expiring  
GET /contracts/active  
