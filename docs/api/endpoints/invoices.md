# Invoices

## CRUD
GET /accounting/invoices  
GET /accounting/invoices/:id  
POST /accounting/invoices  
PUT /accounting/invoices/:id  
DELETE /accounting/invoices/:id

## Actions
PATCH /accounting/invoices/:id/issue  
PATCH /accounting/invoices/:id/send  
PATCH /accounting/invoices/:id/cancel  
PATCH /accounting/invoices/:id/duplicate  
POST  /accounting/invoices/:id/reminder

## Items
GET    /accounting/invoices/:id/items  
POST   /accounting/invoices/:id/items  
PUT    /accounting/invoices/:id/items/:itemId  
DELETE /accounting/invoices/:id/items/:itemId

## Files
GET  /accounting/invoices/:id/pdf  
GET  /accounting/invoices/:id/preview  
POST /accounting/invoices/:id/regenerate-pdf

## Stats
GET /accounting/invoices/stats  
GET /accounting/invoices/overdue  
GET /accounting/invoices/unpaid  
