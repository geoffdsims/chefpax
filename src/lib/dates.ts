export function nextDeliveryDateNow(
  now = new Date(),
  cutoffDow = Number(process.env.CHEFPAX_CUTOFF_DOW ?? 3),
  cutoffTime = process.env.CHEFPAX_CUTOFF_TIME ?? "18:00",
  deliveryDow = Number(process.env.CHEFPAX_DELIVERY_DOW ?? 5)
) {
  // parse cutoff time
  const [hh, mm] = cutoffTime.split(":").map(Number);
  const local = new Date(now);
  const isCutoffDay = local.getDay() === cutoffDow;
  const pastCutoffToday = isCutoffDay && (local.getHours() > hh || (local.getHours() === hh && local.getMinutes() >= mm));

  // helper to get next weekday
  function nextDow(date: Date, dow: number, addWeek = false) {
    const d = new Date(date);
    const current = d.getDay();
    let diff = (dow + 7 - current) % 7;
    if (diff === 0 && addWeek) diff = 7;
    d.setDate(d.getDate() + diff);
    return d;
  }

  const pastCutoff = pastCutoffToday || (local.getDay() > cutoffDow);
  const deliverThisWeek = !pastCutoff;

  // find Friday (or configured day)
  const target = nextDow(local, deliveryDow, !deliverThisWeek);
  target.setHours(9, 0, 0, 0); // default window start
  return target; // Date object
}

