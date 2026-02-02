# 📚 API Documentation

## Overview

Sari uses **tRPC** for type-safe API communication between the frontend and backend. This document provides an overview of the available API endpoints.

---

## Authentication

All protected endpoints require a valid session cookie (`sari_session`).

### Procedure Types

| Type | Description |
|------|-------------|
| `publicProcedure` | No authentication required |
| `protectedProcedure` | Requires authenticated user |
| `adminProcedure` | Requires admin role |

---

## Auth Router (`auth.*`)

### `auth.me`
- **Type**: Query (protected)
- **Returns**: Current user object

### `auth.login`
- **Type**: Mutation (public)
- **Input**: `{ email: string, password: string }`
- **Returns**: `{ success: boolean, token: string, user: User }`

### `auth.signup`
- **Type**: Mutation (public)
- **Input**: `{ name: string, email: string, password: string, businessName: string, phone?: string }`
- **Returns**: `{ success: boolean, token: string, user: User }`

### `auth.logout`
- **Type**: Mutation (protected)
- **Returns**: `{ success: true }`

---

## Merchants Router (`merchants.*`)

### `merchants.get`
- **Type**: Query (protected)
- **Returns**: Current merchant profile

### `merchants.update`
- **Type**: Mutation (protected)
- **Input**: Merchant update data
- **Returns**: `{ success: boolean }`

### `merchants.getSettings`
- **Type**: Query (protected)
- **Returns**: Merchant settings

---

## Products Router (`products.*`)

### `products.list`
- **Type**: Query (protected)
- **Input**: `{ search?: string, categoryId?: number, limit?: number }`
- **Returns**: Array of products

### `products.create`
- **Type**: Mutation (protected)
- **Input**: Product data
- **Returns**: `{ success: boolean, productId: number }`

### `products.update`
- **Type**: Mutation (protected)
- **Input**: `{ productId: number, ...updateData }`
- **Returns**: `{ success: boolean }`

### `products.delete`
- **Type**: Mutation (protected)
- **Input**: `{ productId: number }`
- **Returns**: `{ success: boolean }`

---

## Conversations Router (`conversations.*`)

### `conversations.list`
- **Type**: Query (protected)
- **Input**: `{ limit?: number, status?: string }`
- **Returns**: Array of conversations with customer info

### `conversations.getMessages`
- **Type**: Query (protected)
- **Input**: `{ conversationId: number }`
- **Returns**: Array of messages

### `conversations.sendMessage`
- **Type**: Mutation (protected)
- **Input**: `{ conversationId: number, content: string, type?: string }`
- **Returns**: `{ success: boolean, messageId: number }`

---

## Campaigns Router (`campaigns.*`)

### `campaigns.list`
- **Type**: Query (protected)
- **Returns**: Array of campaigns

### `campaigns.create`
- **Type**: Mutation (protected)
- **Input**: Campaign data
- **Returns**: `{ success: boolean, campaignId: number }`

### `campaigns.getStats`
- **Type**: Query (protected)
- **Input**: `{ campaignId: number }`
- **Returns**: Campaign statistics

---

## WhatsApp Router (`whatsapp.*`)

### `whatsapp.getConnectionStatus`
- **Type**: Query (protected)
- **Returns**: Connection status

### `whatsapp.getQrCode`
- **Type**: Query (protected)
- **Returns**: QR code for connection

### `whatsapp.disconnect`
- **Type**: Mutation (protected)
- **Returns**: `{ success: boolean }`

---

## Subscriptions Router (`subscriptions.*`)

### `subscriptions.current`
- **Type**: Query (protected)
- **Returns**: Current subscription details

### `subscriptions.upgrade`
- **Type**: Mutation (protected)
- **Input**: `{ planId: number }`
- **Returns**: `{ success: boolean, paymentUrl?: string }`

---

## Dashboard Router (`dashboard.*`)

### `dashboard.getStats`
- **Type**: Query (protected)
- **Returns**: Dashboard statistics

### `dashboard.getRecentActivity`
- **Type**: Query (protected)
- **Returns**: Recent activity items

---

## Admin Routers

### `admin.merchants.list`
- **Type**: Query (admin)
- **Returns**: All merchants

### `admin.merchants.getDetails`
- **Type**: Query (admin)
- **Input**: `{ merchantId: number }`
- **Returns**: Detailed merchant information

### `admin.plans.list`
- **Type**: Query (admin)
- **Returns**: All subscription plans

### `admin.plans.update`
- **Type**: Mutation (admin)
- **Input**: Plan update data
- **Returns**: `{ success: boolean }`

---

## tRPC Client Usage

```typescript
import { trpc } from '@/lib/trpc';

// Queries
const { data: user } = trpc.auth.me.useQuery();
const { data: products } = trpc.products.list.useQuery({ limit: 10 });

// Mutations
const loginMutation = trpc.auth.login.useMutation();
await loginMutation.mutateAsync({ email, password });

// With React Query options
const { data, isLoading, error } = trpc.merchants.get.useQuery(undefined, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: 3,
});
```

---

## Error Handling

tRPC errors follow a standard format:

```typescript
{
  code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_SERVER_ERROR',
  message: string,
  data?: any
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `BAD_REQUEST`: Invalid input
- `CONFLICT`: Resource conflict (e.g., duplicate)
- `INTERNAL_SERVER_ERROR`: Server error

---

## Rate Limiting

| Endpoint Type | Limit |
|--------------|-------|
| Login API | 5 requests / 15 minutes |
| Public APIs | 100 requests / minute |
| Webhooks | 200 requests / minute |
| AI Endpoints | 10 requests / minute |

---

## Webhooks

### Tap Payment Webhook
- **URL**: `POST /api/webhooks/tap`
- **Body**: Tap payment callback data

### WhatsApp Webhook (Green API)
- **URL**: `POST /api/webhooks/whatsapp`
- **Body**: Green API message data
