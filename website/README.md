# RetalCare Web

React + Vite website for the existing patient billing API. Arabic and English, responsive layouts, patient records, invoices, reports and browser PDF printing.

## Run

1. Start the backend with `npm run server` from the parent project folder (port 5000).
2. Run `npm install` and `npm run dev` in this `website` folder.
3. Open the local URL printed by Vite.

Vite forwards `/api` to `http://127.0.0.1:5000`. Copy `.env.example` to `.env` and change `API_PROXY_TARGET` if the backend runs elsewhere. For production use `npm run build`, host `dist`, and configure a same-origin `/api` reverse proxy, or set `VITE_API_URL` before building and enable CORS on the backend.

## Migration notes

- Website entry: `src/web/main.jsx`. The old Expo project lives in `../app` and is not imported or built. Translation files are separate copies so each project can run independently.
- Real records come only from the existing backend. No example patient records or automatic patient-name translation services are used.
- Session tokens are held in sessionStorage; the language preference is in localStorage.
- The current backend has no invoice update endpoint. “New copy” creates another invoice while preserving the original. Reports can be updated through the existing PUT endpoint.
- PDF export uses the browser print dialog: choose **Save as PDF**, A4, disable browser headers/footers. Print styling is independent of website styling.
- The prior changes had replaced the original raster logo/stamp and invoice template. The web print layout restores the previous blue, white, date-grouped structure, but currently retains the available SVG logo/stamp. Exact historical visual matching requires the original logo/stamp or a reference PDF.
- The existing backend remains responsible for authentication and authorization; no backend source or database has been modified.
