
export const formatCurrency = (amount: number): number => {
  return Math.round(amount * 100) / 100;
};


export const calculateBillFinancials = (
  currentReading: number,
  previousReading: number,
  rate: number,
  surchargePercent: number,
  isLate: boolean,
) => {
  const consumedUnits = currentReading - previousReading;
  if (consumedUnits < 0)
    throw new Error("Current reading cannot be lower than previous reading");

  const billAmount = formatCurrency(consumedUnits * rate);
  const surchargeAmount = isLate
    ? formatCurrency(billAmount * surchargePercent)
    : 0;

  return {
    consumedUnits,
    billAmount,
    surchargeAmount,
    totalAmount: formatCurrency(billAmount + surchargeAmount),
  };
};
