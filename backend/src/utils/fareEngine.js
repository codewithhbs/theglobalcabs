// Central fare calculation engine.
// Supports: fixed fare, distance-based, seasonal/festival windows, peak-hour multipliers, tax & discounts.
const Settings = require('../models/Settings');

const isWithinDateWindow = (date, from, to) => {
  const d = new Date(date).setHours(0, 0, 0, 0);
  return d >= new Date(from).setHours(0, 0, 0, 0) && d <= new Date(to).setHours(0, 0, 0, 0);
};

const isWithinTimeWindow = (time, start, end) => {
  // time format "HH:mm"
  if (!time || !start || !end) return false;
  if (start <= end) return time >= start && time <= end;
  return time >= start || time <= end; // overnight window e.g. 22:00 - 06:00
};

/**
 * @param {Object} opts
 * @param {Object} opts.fareRule   - FareRule doc (route+vehicle specific) or null
 * @param {Object} opts.vehicle    - Vehicle doc (fallback per-km pricing)
 * @param {Number} opts.distanceKm - trip distance
 * @param {Date}   opts.date       - pickup date
 * @param {String} opts.time       - pickup time "HH:mm"
 * @param {String} opts.tripType   - oneWay | roundTrip | local | airport | railway | outstation
 * @param {Object} [opts.coupon]   - { type: 'flat'|'percent', value }
 */
const calculateFare = async ({ fareRule, vehicle, distanceKm = 0, date = new Date(), time = '', tripType = 'oneWay', coupon = null }) => {
  const settings = (await Settings.findOne().lean()) || {};
  const taxPercent = settings.taxPercent ?? 5;
  const breakdown = [];
  let base = 0;

  if (fareRule && fareRule.fareType === 'fixed') {
    base = fareRule.fixedFare;
    breakdown.push({ label: 'Fixed route fare', amount: base });
  } else {
    const perKm = fareRule?.perKmRate ?? vehicle?.perKmRate ?? 0;
    const minFare = fareRule?.minimumFare ?? vehicle?.minimumFare ?? 0;
    const effectiveKm = tripType === 'roundTrip' ? distanceKm * 2 : distanceKm;
    base = Math.max(Math.round(effectiveKm * perKm), minFare);
    breakdown.push({ label: `Distance fare (${effectiveKm} km × ₹${perKm})`, amount: base });
  }

  let subtotal = base;

  // Seasonal / festival pricing windows
  if (fareRule?.pricingWindows?.length) {
    for (const w of fareRule.pricingWindows) {
      if (w.active && isWithinDateWindow(date, w.from, w.to)) {
        const extra = w.type === 'percent' ? Math.round((subtotal * w.value) / 100) : w.value;
        subtotal += extra;
        breakdown.push({ label: `${w.label || 'Seasonal'} surcharge`, amount: extra });
      }
    }
  }

  // Peak hour multiplier
  const peak = fareRule?.peakHours || settings.peakHours;
  if (peak?.active && isWithinTimeWindow(time, peak.start, peak.end)) {
    const extra = Math.round((subtotal * (peak.percent || 0)) / 100);
    subtotal += extra;
    breakdown.push({ label: `Peak hour (${peak.start}-${peak.end})`, amount: extra });
  }

  // Discount / coupon
  let discount = 0;
  if (coupon) {
    discount = coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
    discount = Math.min(discount, subtotal);
    breakdown.push({ label: `Discount${coupon.code ? ` (${coupon.code})` : ''}`, amount: -discount });
  }

  const taxable = subtotal - discount;
  const tax = Math.round((taxable * taxPercent) / 100);
  breakdown.push({ label: `Tax / GST (${taxPercent}%)`, amount: tax });

  return { base, subtotal, discount, taxPercent, tax, total: taxable + tax, breakdown };
};

module.exports = { calculateFare };
