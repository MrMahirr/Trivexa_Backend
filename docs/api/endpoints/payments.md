# Payments & Expenses

## Payments
GET /accounting/payments  
GET /accounting/payments/:id  
POST /accounting/payments  
PUT /accounting/payments/:id  
DELETE /accounting/payments/:id

POST /accounting/payments/:id/verify  
POST /accounting/payments/:id/reconcile

GET /accounting/payments/summary  
GET /accounting/payments/by-method  
GET /accounting/payments/by-client

## Expenses
GET /accounting/expenses  
GET /accounting/expenses/:id  
POST /accounting/expenses  
PUT /accounting/expenses/:id  
DELETE /accounting/expenses/:id

POST /accounting/expenses/:id/submit  
POST /accounting/expenses/:id/approve  
POST /accounting/expenses/:id/reject  
POST /accounting/expenses/:id/pay

GET /accounting/expenses/pending  
GET /accounting/expenses/by-category  
GET /accounting/expenses/export  
