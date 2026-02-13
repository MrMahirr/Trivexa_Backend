# Users Management

## CRUD
GET    /users  
GET    /users/:id  
POST   /users  
PUT    /users/:id  
DELETE /users/:id

## Actions
PATCH /users/:id/activate  
PATCH /users/:id/deactivate  
PATCH /users/:id/role  
PATCH /users/:id/department  
PATCH /users/:id/permissions

GET /users/:id/permissions  
GET /users/:id/projects  
GET /users/:id/tasks  
GET /users/:id/time-entries  
GET /users/:id/activity

## Current User
GET    /users/me  
PUT    /users/me  
PATCH  /users/me/avatar  
GET    /users/me/notifications  
GET    /users/me/statistics  
