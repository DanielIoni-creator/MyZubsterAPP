// services/moneroService.js
const axios = require('axios');

class MoneroService {
  constructor() {
    this.rpcUrl = 'http://127.0.0.1:28083/json_rpc';
    this.feePercent = parseInt(process.env.MONERO_FEE_PERCENT) || 2;
    this.maxConfirmations = 10;
    this.pollingInterval = 10000; // 10 secondi
    this.maxAttempts = 60; // 10 minuti totali
  }

  // Metodo per inviare richieste RPC
  async rpcRequest(method, params = {}) {
    try {
      const response = await axios.post(this.rpcUrl, {
        jsonrpc: '2.0',
        id: '0',
        method: method,
        params: params
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      if (response.data.error) {
        throw new Error(`RPC Error: ${response.data.error.message}`);
      }

      return response.data.result;
    } catch (error) {
      console.error('[Monero RPC] Errore:', error.message);
      throw error;
    }
  }

  // 1. Genera subaddress per un ordine
  async createSubaddress(label) {
    try {
      const result = await this.rpcRequest('create_address', {
        account_index: 0,
        label: label
      });

      console.log(`[Monero] 📍 Subaddress generato per ${label}`);
      return {
        address: result.address,
        addressIndex: result.address_index,
        label: label
      };
    } catch (error) {
      console.error('[Monero] ❌ Errore generazione subaddress:', error.message);
      throw error;
    }
  }

  // 2. Ottieni saldo
  async getBalance() {
    try {
      const result = await this.rpcRequest('get_balance');
      return {
        balance: result.balance,
        unlockedBalance: result.unlocked_balance,
        blocksToUnlock: result.blocks_to_unlock || 0
      };
    } catch (error) {
      console.error('[Monero] ❌ Errore getBalance:', error);
      throw error;
    }
  }

  // 3. Controlla pagamenti per un subaddress
  async checkPayment(addressIndex, minConfirmations = 1) {
    try {
      const transfers = await this.rpcRequest('get_transfers', {
        in: true,
        account_index: 0,
        subaddr_indices: [addressIndex]
      });

      const confirmed = transfers.in?.filter(tx => 
        tx.confirmations >= minConfirmations
      ) || [];

      if (confirmed.length === 0) {
        return null;
      }

      const lastTx = confirmed[confirmed.length - 1];
      return {
        txid: lastTx.txid,
        amount: lastTx.amount,
        confirmations: lastTx.confirmations,
        addressIndex: lastTx.subaddr_index?.minor || addressIndex,
        timestamp: new Date().toISOString(),
        paymentId: lastTx.payment_id || null,
        unlockTime: lastTx.unlock_time || 0
      };
    } catch (error) {
      console.error('[Monero] ❌ Errore checkPayment:', error);
      throw error;
    }
  }

  // 4. Monitora pagamento con conferme progressive
  async monitorPayment(orderId, addressIndex, onProgress = null) {
    let attempts = 0;
    let lastConfirmations = 0;

    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        attempts++;

        try {
          // Controlla pagamento (min 1 conferma)
          const payment = await this.checkPayment(addressIndex, 1);

          if (payment) {
            // Notifica progresso
            if (onProgress && payment.confirmations > lastConfirmations) {
              lastConfirmations = payment.confirmations;
              onProgress({
                orderId,
                confirmations: payment.confirmations,
                maxConfirmations: this.maxConfirmations,
                progress: Math.min(100, (payment.confirmations / this.maxConfirmations) * 100)
              });
            }

            // Verifica se ha abbastanza conferme
            if (payment.confirmations >= this.maxConfirmations) {
              clearInterval(intervalId);
              const fee = this.calculateFee(payment.amount);
              resolve({
                orderId,
                payment: {
                  txid: payment.txid,
                  amount: payment.amount,
                  netAmount: fee.netAmount,
                  fee: fee.fee,
                  feePercent: this.feePercent,
                  confirmations: payment.confirmations,
                  timestamp: payment.timestamp,
                  paymentId: payment.paymentId,
                  unlockTime: payment.unlockTime
                }
              });
              return;
            }

            console.log(`[Monero] 🔄 Conferme: ${payment.confirmations}/${this.maxConfirmations} per ordine ${orderId}`);
          }

          if (attempts >= this.maxAttempts) {
            clearInterval(intervalId);
            reject(new Error(`Timeout: pagamento non ricevuto per l'ordine ${orderId}`));
          }
        } catch (error) {
          clearInterval(intervalId);
          reject(error);
        }
      }, this.pollingInterval);
    });
  }

  // 5. Ottieni indirizzo wallet principale
  async getWalletAddress() {
    try {
      const result = await this.rpcRequest('get_address');
      return result.address;
    } catch (error) {
      console.error('[Monero] ❌ Errore getWalletAddress:', error);
      throw error;
    }
  }

  // 6. Calcola fee
  calculateFee(amount) {
    const fee = amount * (this.feePercent / 100);
    return {
      fee: fee,
      netAmount: amount - fee,
      feePercent: this.feePercent
    };
  }

  // 7. Verifica stato transazione
  async getTransaction(txid) {
    try {
      const result = await this.rpcRequest('get_transfers', {
        txid: txid
      });
      return result;
    } catch (error) {
      console.error('[Monero] ❌ Errore getTransaction:', error);
      throw error;
    }
  }

  // 8. Invia transazione di test
  async sendTestTransaction(amount, address) {
    try {
      const result = await this.rpcRequest('transfer', {
        destinations: [{ address: address, amount: amount }],
        account_index: 0
      });
      return result;
    } catch (error) {
      console.error('[Monero] ❌ Errore sendTestTransaction:', error);
      throw error;
    }
  }
}

module.exports = new MoneroService();