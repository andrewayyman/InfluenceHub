---
name: ef-query-audit
description: Audits EF Core query handlers for performance problems and best-practice violations. Use this skill whenever the user asks to review, optimize, or check a query handler, repository method, or any EF Core code — even if they just say "check this handler" or "is this query ok?" or "why is this slow?". Also trigger proactively when reading handler files that contain DbContext queries.
---

# EF Core Query Audit

You are an EF Core performance expert. Review the target file(s) for the issues below, report every violation with a `file:line` reference, explain *why* it matters, and propose a concrete fix.

## Step 1 — Locate the code

If the user points to a specific file, read it. Otherwise search for handlers in:
- `src/AZM.Zimmer.Application/Features/**/Queries/**/*Handler.cs`
- `src/AZM.Zimmer.Application/Features/**/Commands/**/*Handler.cs`

Also read the related entity and EF configuration if needed to check index coverage.

## Step 2 — Check for these issues

### N+1 Queries
Lazy-loaded navigation properties accessed in a loop cause one SQL query per iteration. Look for:
- Navigation properties used inside `foreach` / `Select` without a prior `Include()`
- `.ToList()` called before a projection that touches relations

**Fix:** Add the appropriate `.Include()` / `.ThenInclude()` before materialisation, or project with a single query using `Select()`.

### Missing `AsNoTracking()`
Read-only queries (Get / GetList handlers) should never track entities — tracking wastes memory and CPU for no benefit when you're not saving changes.

Look for any query in a `Get*QueryHandler` that does **not** have `.AsNoTracking()`.

**Fix:** Add `.AsNoTracking()` immediately after `_context.{Entity}`.

### Inefficient Projections
Loading full entities then mapping in memory (`.ToList()` then `Select(...)` in C#) pulls unnecessary columns. Compare what the handler returns vs. what it loads.

**Fix:** Push the `Select(mapper.ToDto)` expression *before* `.ToListAsync()` so EF translates it to SQL.

### Missing `Include()` for Required Relations
If a DTO property maps from a navigation property but there is no `.Include()`, EF will either throw or silently return `null` depending on configuration.

**Fix:** Add `.Include(e => e.Relation)` or use a projection that accesses the relation inline so EF can translate it.

### Cartesian Explosion
Multiple `.Include()` calls on collection navigations on the same level produce a cross-join that multiplies rows. Look for two or more `Include()` calls where both targets are collections.

**Fix:** Use `AsSplitQuery()` to break the query into separate SQL statements.

### `Count()` Before Pagination
Calling `.Count()` and `.Skip().Take()` as two separate round-trips is fine, but calling `.ToList()` then checking `.Count` in C# is not — it loads the entire table.

**Fix:** Use `.CountAsync()` on the `IQueryable` before materialising; this is what `PaginatedList.CreateAsync()` already does — make sure it is being used.

### Unfiltered Global Query Filter Bypass
Using `.IgnoreQueryFilters()` disables the soft-delete filter globally. Flag any such call and verify it is intentional.

### Missing Index Coverage
Check the EF configuration file (`src/AZM.Zimmer.Infrastructure/Data/Configurations/{Entity}Configuration.cs`) for the entity being queried. If the handler filters or orders by a property that has no `.HasIndex()`, flag it.

## Step 3 — Report format

For every issue found, output a block like this:

```
❌ [Issue Type] — file:line
   What: <one sentence describing the problem>
   Why:  <one sentence explaining the performance/correctness impact>
   Fix:  <code snippet showing the corrected version>
```

If no issues are found, say:
```
✅ No EF Core issues found in [file]. Query looks good.
```

End with a brief summary: total issues found, severity (🔴 critical / 🟡 warning / 🟢 info), and the single highest-priority fix.

## Reference patterns

**Good read query:**
```csharp
var result = await _context.Items
    .AsNoTracking()
    .Where(x => x.Status == Status.Active)
    .Select(ItemMapper.ToDetailDto)
    .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
```

**Good paginated list query:**
```csharp
var query = _context.Items
    .AsNoTracking()
    .Where(x => string.IsNullOrEmpty(request.Search)
        || x.Name.Contains(request.Search));

return await PaginatedList<ItemDto>.CreateAsync(
    query.Select(ItemMapper.ToDto),
    request.PageNumber,
    request.PageSize,
    cancellationToken);
```
