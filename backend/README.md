# Backend di MyZubster

Server Node.js/Express per le API MyZubster, incluso un gateway Monero self-hosted ispirato a Monero Merchant/MoneroPay. L'entrypoint predefinito `src/index.js` salva le richieste di pagamento in MongoDB.

## Pagamenti Monero

Endpoint REST disponibili:

- `POST /api/payment/create` — riceve `amount`, `description`, `sellerId`, crea un `paymentId`, genera un indirizzo one-shot e salva in MongoDB.
- `GET /api/payment/status/:paymentId` — verifica importo ricevuto/conferme sulla blockchain Monero e aggiorna MongoDB.
- `POST /api/payment/webhook` — riceve conferme da MoneroPay/worker, aggiorna MongoDB e invia una callback opzionale all'app.

Il client Android riceve solo `address`, `amountXmr`, `uri` e stato: nessuna chiave privata viene inviata al dispositivo.

## Configurazione

Copia `.env.example` in `.env` e imposta almeno una modalità:

1. **Consigliata: MoneroPay self-hosted**
   - `MONEROPAY_URL=http://127.0.0.1:5000`
   - `MONERO_NODE_URL=http://127.0.0.1:18081/json_rpc`

2. **Fallback: monero-wallet-rpc**
   - lascia vuoto `MONEROPAY_URL`
   - `MONERO_WALLET_RPC_URL=http://127.0.0.1:18083/json_rpc`
   - `MONERO_NODE_URL=http://127.0.0.1:18081/json_rpc`

Variabili supportate:

- `MONERO_NODE_URL` — nodo monerod pubblico o proprio per contesto/health check.
- `MONERO_WALLET_RPC_URL` — wallet RPC merchant/view-only per creare subaddress e controllare pagamenti.
- `MONEROPAY_URL` — istanza MoneroPay self-hosted.
- `MONERO_RPC_USERNAME` / `MONERO_RPC_PASSWORD` — Basic Auth se richiesta.
- `MONERO_CONFIRMATIONS_DEFAULT` — `0` per velocità, `10` per massima sicurezza.
- `MONGODB_URI` / `MONGODB_DB` — database per persistere le richieste in `monero_payments`.
- `MONERO_PAYMENT_STORE` — file JSON locale per `npm run start:json-store`.
- `PAYMENT_WEBHOOK_SECRET` — segreto opzionale per `POST /api/payment/webhook`.
- `PAYMENT_STATUS_CALLBACK_URL` — callback server/app opzionale invocata quando il webhook aggiorna un pagamento.

## Avvio

```bash
npm install
npm start
```

Controllo sintassi:

```bash
npm run check
```

## Esempio

```bash
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"amountXmr":"0.05","description":"Lezione MyZubster","confirmations":0}'
```

Per pagamenti ad alto rischio passa `"confirmations":10` o imposta `MONERO_CONFIRMATIONS_DEFAULT=10`.

Se vuoi usare il vecchio prototipo con store JSON locale invece di MongoDB:

```bash
npm run start:json-store
```
