<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Public pages read content only through `src/lib/content.functions.ts` server functions using the anon publishable client (`public-db.server.ts`); RLS decides what is public. Why: keeps SSR reads safe and avoids exposing admin data.
- Public portfolio lives in `portfolio_items`; internal project management (budgets, notes) must use separate tables. Why: column-level privacy can't be enforced on an anon-readable table.
- Editable site copy lives in `website_content` (key → jsonb) so the future CMS can change it without code. Why: brief requires no-code content management.
- Staff permissions use `user_roles` + `has_role`/`is_staff`/`is_admin` SQL functions. Why: roles must never live on profiles or client storage.
- New enquiries create a notification + activity log via DB trigger. Why: admin is notified regardless of which code path inserts.
- Dark-first design; `.surface-light` re-themes a section to the light palette. All colors are tokens in `src/styles.css`.
