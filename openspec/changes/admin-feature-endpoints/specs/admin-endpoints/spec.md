## ADDED Requirements

### Requirement: Admin dashboard stats contract
The system SHALL expose a dashboard stats endpoint for admin users.

The endpoint:
- MUST be reachable only by authenticated users with role `Admin`
- MUST be `GET /api/admin/GetDashboard`
- MUST return a JSON object matching `AdminDashboardResponse`:
  - `totalUsers` (int)
  - `totalBrands` (int)
  - `totalInfluencers` (int)
  - `totalCampaigns` (int)
  - `totalApplications` (int)
  - `pendingReports` (int)

#### Scenario: Successful dashboard retrieval
- **WHEN** an Admin user calls `GET /api/admin/GetDashboard`
- **THEN** the system returns `200 OK` with an `AdminDashboardResponse` JSON payload containing all required fields

#### Scenario: Non-admin access is blocked
- **WHEN** a non-admin authenticated user calls `GET /api/admin/GetDashboard`
- **THEN** the system returns `403 Forbidden` (or framework-equivalent authorization failure)

### Requirement: Admin contact message listing and replied marking
The system SHALL expose admin endpoints for reading contact messages and marking them as replied.

The endpoints:
- MUST be reachable only by users with role `Admin`
- `GET /api/admin/GetContactMessages`
  - Accepts optional query parameter `isReplied` (boolean)
  - MUST return an array of contact message records with `id`, `name`, `email`, `subject`, `message`, `isReplied`, `createdAt`
- `PATCH /api/admin/MarkContactReplied/{messageId}`
  - MUST set `isReplied=true` for the specified message
  - MUST return `204 No Content` on success

#### Scenario: List messages without filter
- **WHEN** an Admin user calls `GET /api/admin/GetContactMessages` without `isReplied`
- **THEN** the system returns `200 OK` with all contact messages (replied and unreplied)

#### Scenario: List messages with isReplied=true filter
- **WHEN** an Admin user calls `GET /api/admin/GetContactMessages?isReplied=true`
- **THEN** the system returns `200 OK` with only replied messages

#### Scenario: Mark an existing message as replied
- **WHEN** an Admin user calls `PATCH /api/admin/MarkContactReplied/{messageId}` with a valid `messageId`
- **THEN** the system sets `isReplied=true` and returns `204 No Content`

#### Scenario: Mark a non-existent message
- **WHEN** an Admin user calls `PATCH /api/admin/MarkContactReplied/{messageId}` with an unknown `messageId`
- **THEN** the system returns `404 Not Found`

### Requirement: Admin user management (list, enable/disable, delete)
The system SHALL expose admin endpoints for managing users (brands and influencers).

The endpoints:
- MUST be reachable only by users with role `Admin`
- `GET /api/admin/GetUsers`
  - MUST return an array of users excluding `Admin` role users
  - Each item MUST include: `id`, `email`, `role`, `isEnabled`, `createdAt`
- `PATCH /api/admin/EnableUser/{userId}`
  - MUST set `isEnabled=true`
  - MUST return `204 No Content` on success
- `PATCH /api/admin/DisableUser/{userId}`
  - MUST set `isEnabled=false`
  - MUST return `204 No Content` on success
- `DELETE /api/admin/DeleteUser/{userId}`
  - MUST delete the specified non-admin user
  - MUST return `204 No Content` on success

Error handling:
- For enable/disable/delete:
  - if `userId` does not exist, the system returns `404 Not Found`
- For delete:
  - if the target user has role `Admin`, the system returns `400 Bad Request`
- For enable/disable:
  - if the target user has role `Admin`, the system returns `400 Bad Request`
- For delete operations blocked by referential integrity/dependent rows, the system returns `400 Bad Request`

#### Scenario: List non-admin users
- **WHEN** an Admin user calls `GET /api/admin/GetUsers`
- **THEN** the system returns `200 OK` with only Brand/Influencer users and includes the required fields per item

#### Scenario: Enable an existing brand/influencer user
- **WHEN** an Admin user calls `PATCH /api/admin/EnableUser/{userId}` with a valid `userId` for a Brand/Influencer
- **THEN** the system returns `204 No Content` and persists `isEnabled=true`

#### Scenario: Disable an existing brand/influencer user
- **WHEN** an Admin user calls `PATCH /api/admin/DisableUser/{userId}` with a valid `userId` for a Brand/Influencer
- **THEN** the system returns `204 No Content` and persists `isEnabled=false`

#### Scenario: Enable non-existent user
- **WHEN** an Admin user calls `PATCH /api/admin/EnableUser/{userId}` with an unknown `userId`
- **THEN** the system returns `404 Not Found`

#### Scenario: Delete an existing non-admin user
- **WHEN** an Admin user calls `DELETE /api/admin/DeleteUser/{userId}` with a valid `userId` for a Brand/Influencer
- **THEN** the system deletes the user and returns `204 No Content`

#### Scenario: Delete blocked by dependencies
- **WHEN** an Admin user calls `DELETE /api/admin/DeleteUser/{userId}` for a user that cannot be deleted due to dependent rows
- **THEN** the system returns `400 Bad Request` and does not delete the user

### Requirement: Admin campaign management (list, close, delete)
The system SHALL expose admin endpoints for managing campaigns.

The endpoints:
- MUST be reachable only by users with role `Admin`
- `GET /api/admin/GetCampaigns`
  - Accepts optional query parameter `status` (`CampaignStatus` enum name)
  - If `status` is omitted, the system returns all campaigns
  - MUST return an array of `CampaignListResponse` items including: `id`, `title`, `budget`, `deadline`, `platform`, `location`, `status`, `applicationCount`, `tags`
- `PATCH /api/admin/CloseCampaign/{campaignId}`
  - MUST set the campaign status to `Closed`
  - MUST return `204 No Content` on success
- `DELETE /api/admin/DeleteCampaign/{campaignId}`
  - MUST delete the specified campaign
  - MUST return `204 No Content` on success

Error handling:
- For close/delete:
  - if `campaignId` does not exist, the system returns `404 Not Found`
- For delete:
  - if the campaign has related `Application` rows (or otherwise cannot be deleted safely), the system returns `400 Bad Request`

#### Scenario: List campaigns without filter
- **WHEN** an Admin user calls `GET /api/admin/GetCampaigns` without `status`
- **THEN** the system returns `200 OK` with all campaigns as `CampaignListResponse` items

#### Scenario: List campaigns filtered by status
- **WHEN** an Admin user calls `GET /api/admin/GetCampaigns?status=Open`
- **THEN** the system returns `200 OK` with only campaigns matching `status=Open`

#### Scenario: Close an existing campaign
- **WHEN** an Admin user calls `PATCH /api/admin/CloseCampaign/{campaignId}` with a valid campaign id
- **THEN** the system sets `status=Closed` and returns `204 No Content`

#### Scenario: Close a non-existent campaign
- **WHEN** an Admin user calls `PATCH /api/admin/CloseCampaign/{campaignId}` with an unknown `campaignId`
- **THEN** the system returns `404 Not Found`

#### Scenario: Delete blocked due to applications
- **WHEN** an Admin user calls `DELETE /api/admin/DeleteCampaign/{campaignId}` for a campaign with related applications
- **THEN** the system returns `400 Bad Request` and does not delete the campaign

### Requirement: Admin report review workflow (queue, approve, reject)
The system SHALL expose admin endpoints for reviewing submitted campaign reports.

The endpoints:
- MUST be reachable only by users with role `Admin`
- `GET /api/admin/GetReports`
  - Accepts optional query parameter `status` (`ReportStatus` enum name)
  - If `status` is omitted, the system returns pending reports (i.e., `ReportStatus.Pending`)
  - MUST return an array of `ReportResponse` items including: `id`, `applicationId`, `postUrl`, `postingDate`, `startDate`, `endDate`, `views`, `likes`, `comments`, `shares`, `screenshotPath`, `status`
- `PATCH /api/admin/ApproveReport/{reportId}`
  - MUST set report `status=Approved`
  - MUST set `reviewedAt` and `reviewedBy`
  - MUST set the related campaign status to `Completed`
  - MUST return `204 No Content` on success
- `PATCH /api/admin/RejectReport/{reportId}`
  - MUST set report `status=Rejected`
  - MUST set `reviewedAt` and `reviewedBy`
  - MUST return `204 No Content` on success

Error handling:
- For approve/reject:
  - if `reportId` does not exist, the system returns `404 Not Found`

#### Scenario: List pending reports by default
- **WHEN** an Admin user calls `GET /api/admin/GetReports` without `status`
- **THEN** the system returns `200 OK` with only reports where `status=Pending`

#### Scenario: List approved reports
- **WHEN** an Admin user calls `GET /api/admin/GetReports?status=Approved`
- **THEN** the system returns `200 OK` with only reports where `status=Approved`

#### Scenario: Approve an existing report
- **WHEN** an Admin user calls `PATCH /api/admin/ApproveReport/{reportId}` with a valid report id
- **THEN** the system sets report `status=Approved`, stores review audit fields, updates the related campaign status to `Completed`, and returns `204 No Content`

#### Scenario: Reject an existing report
- **WHEN** an Admin user calls `PATCH /api/admin/RejectReport/{reportId}` with a valid report id
- **THEN** the system sets report `status=Rejected`, stores review audit fields, and returns `204 No Content`

#### Scenario: Approve a non-existent report
- **WHEN** an Admin user calls `PATCH /api/admin/ApproveReport/{reportId}` with an unknown `reportId`
- **THEN** the system returns `404 Not Found`

