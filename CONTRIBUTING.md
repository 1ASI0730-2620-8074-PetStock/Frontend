# Contributing

## Branches

We use a simple GitFlow:

| Branch | Purpose |
|---|---|
| `main` | Released versions only. It is updated from `release/x.y.z` branches. |
| `develop` | Integration branch. |
| `feature/<name>`, `fix/<name>`, `chore/<name>`, `docs/<name>` | Created from an updated `develop` and merged back with a pull request to `develop`. |
| `release/x.y.z` | Created from `develop`, merged into `main`, tagged `vx.y.z` and merged back into `develop`. |

Never open a pull request from a feature branch to `main`.

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) in English:

```
type(scope): short description
```

- **Types:** `feat`, `fix`, `chore`, `test`, `docs`, `refactor`, `style`.
- **Scope:** the module you changed (`iam`, `catalog`, `inventory`, `sales`, `purchases`, `analytics`, `profile`, `shared`).

Keep commits small, one step per commit.

## Code style

- Code, comments and names in English. User-facing texts go in `src/locales` (`es` and `en`).
- Only change the folders of your module. Changes in `src/shared` must be agreed with the team.
- Call the API from the `infrastructure` layer, through `http-common.js` or `BaseEndpoint`. Use the same routes and JSON fields as the web services.
- Map API resources to entities with assemblers. Views use the Pinia stores, not axios directly.

## Before opening a pull request

- [ ] `npm run build` succeeds.
- [ ] Your module works with `npm run dev` against the local web services, with no errors in the browser console.
- [ ] No `.env.local`, `node_modules/`, `dist/` or license keys in the commits.
