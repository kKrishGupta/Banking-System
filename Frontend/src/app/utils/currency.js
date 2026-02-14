const USD_TO_INR_RATE = Number(import.meta.env.VITE_USD_TO_INR || 83.5);

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function usdToInr(amount) {
  const numericAmount = Number(amount || 0);
  return numericAmount * USD_TO_INR_RATE;
}

export function formatInr(amount) {
  return inrFormatter.format(Number(amount || 0));
}

export function formatUsdAsInr(usdAmount) {
  return formatInr(usdToInr(usdAmount));
}

export function getUsdToInrRate() {
  return USD_TO_INR_RATE;
}
