// services/feeService.js
class FeeService {
  constructor() {
    console.log('[Fee] ⚙️ Servizio fee avviato (mock)');
  }

  async getFeeConfig() {
    return {
      baseFee: parseInt(process.env.FEE_BASE) || 100,
      variableFee: parseInt(process.env.FEE_VARIABLE) || 200,
      discountThreshold: parseInt(process.env.FEE_DISCOUNT_THRESHOLD) || 10000,
      discountRate: parseInt(process.env.FEE_DISCOUNT_RATE) || 150
    };
  }

  async calculateFee(amount) {
    const config = await this.getFeeConfig();
    let fee = config.baseFee + (amount * config.variableFee) / 10000;
    if (amount >= config.discountThreshold) {
      fee = fee * (1 - config.discountRate / 10000);
    }
    return Math.max(0, Math.round(fee * 100) / 100);
  }
}

module.exports = new FeeService();