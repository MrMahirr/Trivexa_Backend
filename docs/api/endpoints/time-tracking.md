# Time Tracking

## Entries
GET /time-tracking  
GET /time-tracking/:id

POST /time-tracking/start  
POST /time-tracking/stop  
POST /time-tracking/manual

PUT /time-tracking/:id  
DELETE /time-tracking/:id

## Approval
PATCH /time-tracking/:id/submit  
PATCH /time-tracking/:id/approve  
PATCH /time-tracking/:id/reject

## Reports
GET /time-tracking/active  
GET /time-tracking/my-entries  
GET /time-tracking/summary  
GET /time-tracking/export

GET /time-tracking/by-project  
GET /time-tracking/by-user  
GET /time-tracking/by-department  
