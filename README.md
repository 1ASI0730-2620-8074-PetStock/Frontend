# PetStock Web Application

Web application of **PetStock**, the inventory and sales platform for small pet stores, built by **Nexora** for the Web Applications course (1ASI0730) at UPC.

| | URL |
|---|---|
| Web application | https://petstock-frontend.onrender.com |
| Web services (Scalar) | https://petstock-web-services.onrender.com/scalar |
| Landing page | https://1asi0730-2620-8074-petstock.github.io/LandingPage/ |

## Tech stack

- Vue 3 with Vite
- PrimeVue 5 and PrimeIcons
- Pinia, Vue Router and vue-i18n (`es`, `en`)
- axios, consuming the PetStock web services

## Structure

Each bounded context has its own folder in `src/` with four layers: `domain`, `application` (Pinia stores), `infrastructure` (API calls and assemblers) and `presentation` (views, components and routes). All requests go through `src/shared/infrastructure/http-common.js`.

| Route | Module | Folder |
|---|---|---|
| `/login`, `/register` | Sign in and sign up | `src/iam` |
| `/dashboard` | General dashboard | `src/shared` |
| `/catalog` | Products and suppliers | `src/catalog` |
| `/inventory` | Stock and alerts | `src/inventory` |
| `/sales` | Point of sale, customers and history | `src/sales`, `src/customer` |
| `/purchases` | Purchases to suppliers | `src/purchases` |
| `/analytics` | Weekly chart, rankings and PDF report | `src/analytics` |
| `/profile` | User profile | `src/profile` |

## Run locally

Requirements: Node.js 20.19 or later, and the [PetStock web services](https://github.com/1ASI0730-2620-8074-PetStock/Backend) running on `http://localhost:5238`.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build in `dist/` |
| `npm run preview` | Serves the production build |

`npm run server` and `npm run start` start the json-server fake API (`server/db.json`) used before the web services. They are no longer needed.

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the web services. `.env.development` points to `http://localhost:5238/api/v1` and `.env.production` to the deployed API. |
| `VITE_PRIMEUI_LICENSE` | PrimeUI license key. Set it in `.env.local` or in the hosting panel, never in Git. |

Files ending in `.local` are ignored by Git and override the others. Restart `npm run dev` after changing any `.env` file.

## Deployment

Render static site that builds with `npm run build` and publishes `dist/`, with a rewrite rule from `/*` to `/index.html` so routes work on reload.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)
