# Pearl Detergent Wholesale Management System - Frontend

This frontend has been converted from the previous plan-management shell to a Pearl Detergent DWMS frontend and aligned with the uploaded Laravel backend.

## Implemented in this package

- Auth integration with `/auth/login`, `/auth/me`, `/auth/logout`
- Dashboard shell using `/dashboard/summary`
- Dynamic sidebar filtered by authenticated user permissions
- User Management using `/users`, `/roles-lite`, `/branches`, user role assignment, status toggle, and password reset
- Roles & Permissions module using `/roles`, `/permissions`, `/roles/{id}/permissions`
- Clean frontend structure using `types/`, `services/`, `queries/`, and `hooks/`
- Placeholder module pages for the remaining detergent wholesale modules

## Local setup

```bash
npm install
npm run dev
```

Set your backend API URL in `.env`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Default backend seed account from the uploaded backend:

```text
Email: admin@dwms.local
Password: Admin@12345
```

## Phase Update: Warehouses + Stock Transfers

This package now includes the next operational layer after RBAC, branches, and products:

- `types/warehouse.types.ts`
- `services/warehouse.service.ts`
- `queries/warehouse.queries.ts`
- `hooks/use-warehouses.ts`
- `components/dwms/warehouses-page.tsx`
- `app/(dashboard)/warehouses/page.tsx`

- `types/stock-transfer.types.ts`
- `services/stock-transfer.service.ts`
- `queries/stock-transfer.queries.ts`
- `hooks/use-stock-transfers.ts`
- `components/dwms/stock-transfers-page.tsx`
- `app/(dashboard)/transfers/page.tsx`

Backend routes used:

- `GET /warehouses`
- `POST /warehouses`
- `PUT /warehouses/{warehouse}`
- `DELETE /warehouses/{warehouse}`
- `GET /stock-transfers`
- `POST /stock-transfers`
- `POST /stock-transfers/{stockTransfer}/approve`
- `POST /stock-transfers/{stockTransfer}/complete`
