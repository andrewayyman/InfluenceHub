# InfluenceHub Postman Guide

## Files

- Collection: `InfluenceHub.postman_collection.json`
- Environment: `InfluenceHub.local.postman_environment.json`

## Import

1. Open Postman.
2. Click **Import**.
3. Import both files from `InfluenceHubApi/Scripts/postman`.
4. Select environment **InfluenceHub Local**.

## Configure base URL

- Default in environment is `https://localhost:7188`.
- If your API runs on a different port, update `baseUrl`.

## Authentication flow

1. Run `Auth -> Login`.
2. The request test script auto-saves `token` and `userId` in environment.
3. All protected requests use `Bearer {{token}}`.

## Seeded credentials

- Admin (seeded by app startup):
  - Email: `admin@influencehub.com`
  - Password: `Admin@123`
- Demo seeded users in SQL script:
  - Password for `@seed.demo` users: `Test@1234`

## Role-based folders

- `Admin` endpoints require Admin token.
- `Brands` endpoints require Brand token.
- `Influencers`, `Reports`, and `Applications -> Apply` require Influencer token.
- `Campaigns` supports Brand or Influencer token.
- `Contact` and `Reports -> Get Report ROI` are public.

## Important variables

Set these after creating/retrieving data:

- `campaignId`
- `applicationId`
- `reportId`
- `messageId`
- `targetUserId`

## Suggested end-to-end test order

1. Login as Brand.
2. `Brands -> Create Campaign` and copy returned campaign id into `campaignId`.
3. Login as Influencer.
4. `Applications -> Apply` using `campaignId`.
5. Login as Brand.
6. `Applications -> Get Campaign Applications`, copy `applicationId`.
7. `Applications -> Accept Or Reject` with status `1` (Accepted).
8. Login as Influencer.
9. `Reports -> Submit Report` (form-data with screenshot) using `applicationId`.
10. Login as Admin.
11. `Admin -> Get Reports`, copy `reportId`.
12. `Admin -> Approve Report` or `Admin -> Reject Report`.
13. `Reports -> Get Report ROI`.

## Notes

- `Reports -> Submit Report` must be sent as **form-data** and include a `screenshot` file.
- Status enums:
  - `UserRole`: Brand `0`, Influencer `1`, Admin `2`
  - `CampaignStatus`: Open `0`, InfluencerSelected `1`, ReportSubmitted `2`, Completed `3`, Closed `4`
  - `ApplicationStatus`: Pending `0`, Accepted `1`, Rejected `2`
  - `ReportStatus`: Pending `0`, Approved `1`, Rejected `2`
