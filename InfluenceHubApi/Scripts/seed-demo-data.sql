/*
  InfluenceHub — demo seed data (SQL Server)

  Prerequisites:
  - Run after EF migrations (schema from InitialCreate).
  - Passwords use the same scheme as AuthService: SHA256(UTF-8 password) → Base64.
    All seeded users below share password: Test@1234
    Hash: hJ8Vdcz786TWzwDmxWQbf9TaLtPiEsLXm6kWGlpDL/A=

  The API also seeds admin@influencehub.com on startup (password Admin@123 — check Program.cs).
  This script uses *different* emails (…@seed.demo) to avoid unique-index conflicts.

  Enums (int):
    UserRole: Brand=0, Influencer=1, Admin=2
    CampaignStatus: Open=0, InfluencerSelected=1, ReportSubmitted=2, Completed=3, Closed=4
    ApplicationStatus: Pending=0, Accepted=1, Rejected=2
    ReportStatus: Pending=0, Approved=1, Rejected=2

  To reset and re-seed (destructive): uncomment the DELETE block at the bottom, run it, then run INSERTs again.
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

/* ---- Tags (unique Name) ---- */
INSERT INTO Tags (Id, Name) VALUES
  ('11111111-1111-1111-1111-000000000001', N'Beauty'),
  ('11111111-1111-1111-1111-000000000002', N'Fashion'),
  ('11111111-1111-1111-1111-000000000003', N'Tech'),
  ('11111111-1111-1111-1111-000000000004', N'Fitness'),
  ('11111111-1111-1111-1111-000000000005', N'Food'),
  ('11111111-1111-1111-1111-000000000006', N'Travel');

/* ---- Users ---- */
DECLARE @pwd NVARCHAR(500) = N'hJ8Vdcz786TWzwDmxWQbf9TaLtPiEsLXm6kWGlpDL/A='; /* Test@1234 */

INSERT INTO Users (Id, Email, PasswordHash, Role, IsEnabled, CreatedAt) VALUES
  ('22222222-2222-2222-2222-000000000001', N'brand.one@seed.demo', @pwd, 0, 1, SYSUTCDATETIME()),
  ('22222222-2222-2222-2222-000000000002', N'brand.two@seed.demo', @pwd, 0, 1, SYSUTCDATETIME()),
  ('22222222-2222-2222-2222-000000000003', N'influencer.ada@seed.demo', @pwd, 1, 1, SYSUTCDATETIME()),
  ('22222222-2222-2222-2222-000000000004', N'influencer.ben@seed.demo', @pwd, 1, 1, SYSUTCDATETIME()),
  ('22222222-2222-2222-2222-000000000005', N'influencer.cara@seed.demo', @pwd, 1, 1, SYSUTCDATETIME()),
  ('22222222-2222-2222-2222-000000000006', N'seed.admin@seed.demo', @pwd, 2, 1, SYSUTCDATETIME());

/* ---- Brands ---- */
INSERT INTO Brands (Id, UserId, Name, CreatedAt, UpdatedAt) VALUES
  ('33333333-3333-3333-3333-000000000001', '22222222-2222-2222-2222-000000000001', N'Glow Cosmetics Ltd', SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('33333333-3333-3333-3333-000000000002', '22222222-2222-2222-2222-000000000002', N'ByteGear Studio', SYSUTCDATETIME(), SYSUTCDATETIME());

/* ---- Influencers ---- */
INSERT INTO Influencers (Id, UserId, Name, Bio, Platforms, FollowersCount, Location, InstagramUrl, FacebookUrl, TwitterUrl, YouTubeUrl, TikTokUrl, LinkedInUrl, CreatedAt, UpdatedAt) VALUES
  ('44444444-4444-4444-4444-000000000001', '22222222-2222-2222-2222-000000000003',
   N'Ada Bloom',
   N'Lifestyle & skincare creator. UGC and long-form reviews.',
   N'["Instagram","TikTok"]', 125000, N'London, UK',
   N'https://instagram.com/adabloom', NULL, NULL, NULL, N'https://tiktok.com/@adabloom', NULL,
   SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('44444444-4444-4444-4444-000000000002', '22222222-2222-2222-2222-000000000004',
   N'Ben Carter',
   N'Tech unboxings, coding streams, sponsor-friendly.',
   N'["YouTube","Twitter"]', 89000, N'Toronto, CA',
   NULL, NULL, N'https://twitter.com/bencodes', N'https://youtube.com/@bencartertech', NULL, N'https://linkedin.com/in/bencarter',
   SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('44444444-4444-4444-4444-000000000003', '22222222-2222-2222-2222-000000000005',
   N'Cara Miles',
   N'Food & travel. Restaurant features and recipe shorts.',
   N'["Instagram","YouTube"]', 210000, N'Austin, US',
   N'https://instagram.com/caramiles', NULL, NULL, N'https://youtube.com/@caramiles', NULL, NULL,
   SYSUTCDATETIME(), SYSUTCDATETIME());

/* ---- InfluencerTags ---- */
INSERT INTO InfluencerTags (Id, InfluencerId, TagId) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001', '44444444-4444-4444-4444-000000000001', '11111111-1111-1111-1111-000000000001'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002', '44444444-4444-4444-4444-000000000001', '11111111-1111-1111-1111-000000000002'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003', '44444444-4444-4444-4444-000000000002', '11111111-1111-1111-1111-000000000003'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000004', '44444444-4444-4444-4444-000000000003', '11111111-1111-1111-1111-000000000005'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-000000000005', '44444444-4444-4444-4444-000000000003', '11111111-1111-1111-1111-000000000006');

/* ---- Campaigns ---- */
INSERT INTO Campaigns (Id, BrandId, Title, Description, Budget, Deadline, Platform, Location, Status, CreatedAt, UpdatedAt) VALUES
  ('55555555-5555-5555-5555-000000000001', '33333333-3333-3333-3333-000000000001',
   N'Spring skincare reel series',
   N'3x 30–45s TikToks featuring our new vitamin C serum. Authentic before/after or routine slot.',
   4500.00, '2026-06-30T23:59:59', N'TikTok', N'UK / IE', 0, SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('55555555-5555-5555-5555-000000000002', '33333333-3333-3333-3333-000000000001',
   N'IG Stories takeover — launch week',
   N'5–7 story frames over 48h; swipe-up or link sticker to product page.',
   2800.00, '2026-05-15T23:59:59', N'Instagram', N'UK', 1, SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('55555555-5555-5555-5555-000000000003', '33333333-3333-3333-3333-000000000002',
   N'Wireless keyboard long-form review',
   N'8–12 min YouTube review; include b-roll and honest pros/cons.',
   6000.00, '2026-07-01T23:59:59', N'YouTube', N'North America', 0, SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('55555555-5555-5555-5555-000000000004', '33333333-3333-3333-3333-000000000002',
   N'Holiday gadget gift guide mention',
   N'Short segment in existing gift guide video + pinned comment.',
   3200.00, '2025-12-20T23:59:59', N'YouTube', N'Global', 3, SYSUTCDATETIME(), SYSUTCDATETIME()),
  ('55555555-5555-5555-5555-000000000005', '33333333-3333-3333-3333-000000000001',
   N'Archived summer promo (closed)',
   N'Legacy campaign kept for admin/report testing.',
   1500.00, '2025-08-01T23:59:59', N'Instagram', N'UK', 4, SYSUTCDATETIME(), SYSUTCDATETIME());

/* ---- CampaignTags ---- */
INSERT INTO CampaignTags (Id, CampaignId, TagId) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000001', '55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-000000000001'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000002', '55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-000000000002'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000003', '55555555-5555-5555-5555-000000000002', '11111111-1111-1111-1111-000000000001'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000004', '55555555-5555-5555-5555-000000000003', '11111111-1111-1111-1111-000000000003'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000005', '55555555-5555-5555-5555-000000000004', '11111111-1111-1111-1111-000000000003'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-000000000006', '55555555-5555-5555-5555-000000000005', '11111111-1111-1111-1111-000000000002');

/* ---- Applications (unique CampaignId + InfluencerId) ---- */
INSERT INTO Applications (Id, CampaignId, InfluencerId, Status, Message, CreatedAt) VALUES
  ('66666666-6666-6666-6666-000000000001', '55555555-5555-5555-5555-000000000001', '44444444-4444-4444-4444-000000000001', 0,
   N'Happy to deliver 3 hooks + CTA variants. Portfolio in profile.', SYSUTCDATETIME()),
  ('66666666-6666-6666-6666-000000000002', '55555555-5555-5555-5555-000000000001', '44444444-4444-4444-4444-000000000003', 0,
   N'Food angle: morning routine + serum as part of “get ready”.', SYSUTCDATETIME()),
  ('66666666-6666-6666-6666-000000000003', '55555555-5555-5555-5555-000000000001', '44444444-4444-4444-4444-000000000002', 2,
   N'Applied by mistake — not a fit for beauty.', SYSUTCDATETIME()),
  ('66666666-6666-6666-6666-000000000004', '55555555-5555-5555-5555-000000000002', '44444444-4444-4444-4444-000000000001', 1,
   N'Confirmed slots for Mon/Wed story arc.', SYSUTCDATETIME()),
  ('66666666-6666-6666-6666-000000000005', '55555555-5555-5555-5555-000000000002', '44444444-4444-4444-4444-000000000003', 0,
   N'Can cross-promote on YT community post.', SYSUTCDATETIME()),
  ('66666666-6666-6666-6666-000000000006', '55555555-5555-5555-5555-000000000003', '44444444-4444-4444-4444-000000000002', 1,
   N'Long-form desk setup fits this keyboard well.', SYSUTCDATETIME()),
  ('66666666-6666-6666-6666-000000000007', '55555555-5555-5555-5555-000000000003', '44444444-4444-4444-4444-000000000001', 0,
   N'Could do a short-form cut-down from IG.', SYSUTCDATETIME()),
  ('66666666-6666-6666-6666-000000000008', '55555555-5555-5555-5555-000000000004', '44444444-4444-4444-4444-000000000002', 1,
   N'Gift guide segment delivered on time.', SYSUTCDATETIME()),
  ('66666666-6666-6666-6666-000000000009', '55555555-5555-5555-5555-000000000005', '44444444-4444-4444-4444-000000000001', 1,
   N'Legacy accepted application.', SYSUTCDATETIME());

/* ---- CampaignReports (unique ApplicationId; optional ReviewedBy) ---- */
INSERT INTO CampaignReports (Id, ApplicationId, PostUrl, PostingDate, StartDate, EndDate, Views, Likes, Comments, Shares, ScreenshotPath, Status, RejectionReason, CreatedAt, ReviewedAt, ReviewedBy) VALUES
  ('77777777-7777-7777-7777-000000000001', '66666666-6666-6666-6666-000000000008',
   N'https://www.youtube.com/watch?v=demo-gift-guide', '2025-11-10T10:00:00', '2025-11-10T00:00:00', '2025-11-17T23:59:59',
   125000, 4200, 380, 210, N'seed/reports/gift-guide.png', 1, NULL, SYSUTCDATETIME(), SYSUTCDATETIME(), '22222222-2222-2222-2222-000000000006'),
  ('77777777-7777-7777-7777-000000000002', '66666666-6666-6666-6666-000000000004',
   N'https://www.instagram.com/stories/seed-demo/launch-week', '2026-03-01T09:00:00', '2026-03-01T00:00:00', '2026-03-03T23:59:59',
   45000, 1200, 95, 40, N'seed/reports/ig-stories.png', 0, NULL, SYSUTCDATETIME(), NULL, NULL);

/* ---- ContactMessages ---- */
INSERT INTO ContactMessages (Id, Name, Email, Subject, Message, IsReplied, CreatedAt) VALUES
  ('88888888-8888-8888-8888-000000000001', N'Jordan Lee', N'jordan@example.com', N'Partnership inquiry',
   N'We represent a beverage brand and would like to discuss rates for Q3.', 0, SYSUTCDATETIME()),
  ('88888888-8888-8888-8888-000000000002', N'Samira Khan', N'samira@example.com', N'Bug on registration',
   N'I get a 400 when submitting the form with a long company name.', 1, SYSUTCDATETIME()),
  ('88888888-8888-8888-8888-000000000003', N'Chris Park', N'chris@example.com', N'Press',
   N'Requesting a comment for an article on creator marketplaces.', 0, SYSUTCDATETIME());

COMMIT TRANSACTION;
GO

/*
  -- Destructive reset (FK-safe order; then re-run INSERT transaction above)
  -- DELETE FROM CampaignReports;
  -- DELETE FROM CampaignTags;
  -- DELETE FROM Applications;
  -- DELETE FROM Campaigns;
  -- DELETE FROM InfluencerTags;
  -- DELETE FROM Brands;
  -- DELETE FROM Influencers;
  -- DELETE FROM ContactMessages;
  -- DELETE FROM Users WHERE Email LIKE N'%@seed.demo';
  -- DELETE FROM Tags;
*/
