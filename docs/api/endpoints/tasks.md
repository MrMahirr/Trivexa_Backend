# Tasks Management

## CRUD
GET /tasks  
GET /tasks/:id  
POST /tasks  
PUT /tasks/:id  
DELETE /tasks/:id

## Actions
PATCH /tasks/:id/status  
PATCH /tasks/:id/assign  
PATCH /tasks/:id/priority  
PATCH /tasks/:id/due-date

POST /tasks/:id/start  
POST /tasks/:id/complete

## Approval
POST /tasks/:id/submit-review  
POST /tasks/:id/approve  
POST /tasks/:id/reject  
POST /tasks/:id/request-changes

## Relations
GET    /tasks/:id/dependencies  
POST   /tasks/:id/dependencies  
DELETE /tasks/:id/dependencies/:depId

GET  /tasks/:id/subtasks  
POST /tasks/:id/subtasks

GET    /tasks/:id/comments  
POST   /tasks/:id/comments  
PUT    /tasks/:id/comments/:commentId  
DELETE /tasks/:id/comments/:commentId

GET  /tasks/:id/time-entries  
GET  /tasks/:id/attachments  
POST /tasks/:id/attachments  
DELETE /tasks/:id/attachments/:fileId

## Templates
GET /task-templates  
GET /task-templates/:id  
POST /task-templates  
PUT /task-templates/:id  
DELETE /task-templates/:id  
