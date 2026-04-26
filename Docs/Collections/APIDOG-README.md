# Apidog Collection (Local + Mocks + Tests)

## Files

- Collection: [InfluenceHub.apidog.postman_collection.json](InfluenceHub.apidog.postman_collection.json)
- Environment: [InfluenceHub.apidog.local.postman_environment.json](InfluenceHub.apidog.local.postman_environment.json)

## What this collection includes

- All current backend endpoints in `InfluenceHub.WebApi/Controllers`.
- Auto tests on every request:
  - Status is one of `200`, `201`, `204`
  - Response time < `5000ms`
  - JSON validity check when content type is JSON
- Auto variable capture on critical flows:
  - `Login` -> `token`, `userId`, `role`
  - `Create Campaign` -> `campaignId`
  - `Apply` -> `applicationId`
  - `Submit Report` -> `reportId`
  - `Get Campaign Applications` -> first `applicationId`
  - `Get Contact Messages` -> first `messageId`
  - `Get Users` -> first `targetUserId`
  - `Get Reports` -> first `reportId`
- Mock examples are attached to all requests (`response[]`) for Apidog import/mock usage.

## Import into Apidog

1. Open Apidog.
2. Create a new project.
3. Import -> Postman Collection v2.1.
4. Import [InfluenceHub.apidog.postman_collection.json](InfluenceHub.apidog.postman_collection.json).
5. Import environment file [InfluenceHub.apidog.local.postman_environment.json](InfluenceHub.apidog.local.postman_environment.json).
6. Select the imported environment.

## Run locally

1. Start API (`InfluenceHub.WebApi`):
   - `dotnet run`
2. Make sure `baseUrl` matches your local URL and port.
3. Run `Auth -> Login` first to populate `token`.
4. Execute role-specific folders with matching token:
   - `Brands` with Brand account
   - `Influencers` and `Reports` with Influencer account
   - `Admin` with Admin account

## Suggested full test order

1. Login as Brand.
2. Brands -> Create Campaign (sets `campaignId`).
3. Login as Influencer.
4. Applications -> Apply (sets `applicationId`).
5. Login as Brand.
6. Applications -> Get Campaign Applications (refreshes `applicationId`).
7. Applications -> Accept Or Reject (`status: 1`).
8. Login as Influencer.
9. Reports -> Submit Report (sets `reportId`).
10. Login as Admin.
11. Admin -> Get Reports.
12. Admin -> Approve Report (or Reject Report).
13. Reports -> Get Report ROI.

## Notes

- `Reports -> Submit Report` uses `form-data` and requires a screenshot file.
- Enums in request payloads are numeric:
  - `UserRole`: Brand `0`, Influencer `1`, Admin `2`
  - `CampaignStatus`: Open `0`, InfluencerSelected `1`, ReportSubmitted `2`, Completed `3`, Closed `4`
  - `ApplicationStatus`: Pending `0`, Accepted `1`, Rejected `2`
  - `ReportStatus`: Pending `0`, Approved `1`, Rejected `2`
