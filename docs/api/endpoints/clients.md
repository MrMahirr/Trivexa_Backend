# Clients Management

## CRUD
GET /clients  
GET /clients/:id  
POST /clients  
PUT /clients/:id  
DELETE /clients/:id

## Relations
GET /clients/:id/projects  
GET /clients/:id/invoices  
GET /clients/:id/payments  
GET /clients/:id/contracts

## Contacts
GET    /clients/:id/contacts  
POST   /clients/:id/contacts  
PUT    /clients/:id/contacts/:contactId  
DELETE /clients/:id/contacts/:contactId

## Client Portal Users
GET    /clients/:id/users  
POST   /clients/:id/users  
PUT    /clients/:id/users/:userId  
DELETE /clients/:id/users/:userId

PATCH  /clients/:id/users/:userId/activate  
PATCH  /clients/:id/users/:userId/deactivate  
POST   /clients/:id/users/:userId/send-access-link

## Stats
GET /clients/:id/statistics  
