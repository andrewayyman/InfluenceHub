# InfluenceHub Backend Architecture Plan

This document is the reference architecture for the InfluenceHub backend. The implementation follows this plan.

See the plan file at `.cursor/plans/influencehub_backend_architecture_56f5878f.plan.md` for the full architecture specification.

## Quick Reference

- **Solution**: InfluenceHub.Domain, InfluenceHub.Application, InfluenceHub.Infrastructure, InfluenceHub.WebApi
- **Flow**: Controller -> Business Service -> Repository
- **Auth**: JWT Bearer, Role-based (Brand, Influencer, Admin)
- **Admin Seed**: admin@influencehub.com / Admin@123
