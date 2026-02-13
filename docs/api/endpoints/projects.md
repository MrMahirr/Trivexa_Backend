# Projects Management

## CRUD
GET /projects  
GET /projects/:id  
POST /projects  
PUT /projects/:id  
DELETE /projects/:id

## Status
PATCH /projects/:id/status  
PATCH /projects/:id/activate  
PATCH /projects/:id/complete  
PATCH /projects/:id/cancel  
PATCH /projects/:id/hold

## Team
GET    /projects/:id/members  
POST   /projects/:id/members  
DELETE /projects/:id/members/:userId  
PATCH  /projects/:id/members/:userId/role  
PATCH  /projects/:id/members/:userId/permissions

## Tasks
GET  /projects/:id/tasks  
POST /projects/:id/tasks  
POST /projects/:id/tasks/from-template  
GET  /projects/:id/board/:department

## Resources
GET /projects/:id/time-entries  
GET /projects/:id/invoices  
GET /projects/:id/files  
GET /projects/:id/meetings  
GET /projects/:id/milestones

POST   /projects/:id/milestones  
PUT    /projects/:id/m
