'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Icon } from './Icons';

/**
 * Tour booking flow:
 * 1) Pick travel date, pickup location, travellers, vehicle
 *    -> changing vehicle re-fetches price from server live
 * 2) Review fare breakdown -> enter guest details (if not logged-in) -> confirm
 *
 * The price is always recomputed server-side at confirm time as well —
 * the client never gets to set its own price.
 */
export default function TourBookingForm({ tour }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [guestAccount, setGuestAccount] = useState(null);

  // Only vehicles that the admin has priced for this tour
  const availableVehicles = useMemo(
    () => (tour?.vehiclePricing || []).filter((p) => p.vehicle && p.price > 0),
    [tour]
  );

  const [form, setForm] = useState({
    vehicleId: availableVehicles[0]?.vehicle?._id || '',
    travelDate: '',
    pickupLocation: tour?.fromLocation || '',
    travellers: 1,
    notes: '',
    name: '',
    email: '',
    phone: '',
  });

  // Currently selected vehicle + its passenger capacity (driver excluded)
  const selectedVehicle = useMemo(
    () => availableVehicles.find((p) => p.vehicle?._id === form.vehicleId)?.vehicle || null,
    [availableVehicles, form.vehicleId]
  );
  const maxTravellers = selectedVehicle?.seatingCapacity || 1;

  // If the user switches to a smaller car, clamp travellers down automatically
  useEffect(() => {
    if (!selectedVehicle) return;
    setForm((f) => (
      Number(f.travellers) > maxTravellers ? { ...f, travellers: maxTravellers } : f
    ));
  }, [selectedVehicle, maxTravellers]);

  const [fare, setFare] = useState(null);
  const [fareLoading, setFareLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Live price preview whenever the vehicle changes
  useEffect(() => {
    if (!tour?._id || !form.vehicleId) {
      setFare(null);
      return;
    }
    let cancelled = false;
    setFareLoading(true);
    api('/tours/price', {
      method: 'POST',
      body: { tourId: tour._id, vehicleId: form.vehicleId },
    })
      .then((res) => { if (!cancelled) setFare(res.data.fare); })
      .catch(() => { if (!cancelled) setFare(null); })
      .finally(() => { if (!cancelled) setFareLoading(false); });
    return () => { cancelled = true; };
  }, [tour?._id, form.vehicleId]);

  const proceedToReview = () => {
    setError('');
    if (!form.vehicleId) return setError('Please select a vehicle.');
    if (!form.travelDate) return setError('Please choose a travel date.');
    if (!form.pickupLocation) return setError('Please enter a pickup location.');
    if (!fare) return setError('Could not calculate fare. Please try again.');
    setStep(2);
  };

  const confirm = async () => {
    setError('');
    if (!user && !(form.name && form.phone)) return setError('Please enter your name and phone number.');
    setLoading(true);
    try {
      const res = await api('/tours/bookings', {
        method: 'POST',
        body: {
          tourId: tour._id,
          vehicleId: form.vehicleId,
          travelDate: form.travelDate,
          pickupLocation: form.pickupLocation,
          travellers: Number(form.travellers) || 1,
          notes: form.notes,
          guestDetails: user ? undefined : { name: form.name, email: form.email, phone: form.phone },
        },
      });
      setSuccess(res.data);
      setGuestAccount(res.guestAccount || null);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-green-600">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-display text-xl font-bold">Tour booking received!</h3>
        <p className="mt-2 text-sm text-slate-500">
          Booking ID <span className="font-bold text-ink">#{success.bookingId}</span>. Confirmation sent via SMS &amp; email.
        </p>

        {guestAccount?.created && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-left">
            <p className="mb-2 text-sm font-semibold text-amber-800">🎉 Account created for you!</p>
            <div className="space-y-1 text-xs text-amber-700">
              <p>📧 <span className="font-medium">Email:</span> {guestAccount.email}</p>
              <p>🔑 <span className="font-medium">Password:</span> {guestAccount.password} <span className="text-amber-500">(your phone number)</span></p>
            </div>
            <p className="mt-3 text-xs text-amber-600">Login and change your password to manage bookings anytime.</p>
            <a href="/login" className="mt-3 inline-block rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-600">
              Login to your account →
            </a>
          </div>
        )}

        <button
          onClick={() => { setSuccess(null); setStep(1); setGuestAccount(null); }}
          className="btn-ghost mt-6"
        >
          Book another tour
        </button>
      </div>
    );
  }

  if (availableVehicles.length === 0) {
    return (
      <div className="card p-8 text-center">
        <h3 className="font-display text-lg font-bold">Tour pricing coming soon</h3>
        <p className="mt-2 text-sm text-slate-500">
          We&apos;re finalising vehicle pricing for this tour. Please call us for a custom quote.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden shadow-lift" id="book">
      <div className="flex items-center justify-between bg-ink px-6 py-4">
        <h3 className="font-display font-bold text-white">{step === 1 ? 'Book This Tour' : 'Review & Confirm'}</h3>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className={`rounded-full px-2.5 py-1 ${step === 1 ? 'bg-amber-500 text-ink' : 'bg-white/10 text-slate-300'}`}>1. Details</span>
          <span className={`rounded-full px-2.5 py-1 ${step === 2 ? 'bg-amber-500 text-ink' : 'bg-white/10 text-slate-300'}`}>2. Confirm</span>
        </div>
      </div>

      <div className="p-6">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

        {step === 1 && (
          <div className="grid gap-4">
            {/* Vehicle picker — visual cards so price change is obvious */}
            <div>
              <label className="label">Choose your vehicle</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {availableVehicles.map((p) => {
                  const v = p.vehicle;
                  const selected = form.vehicleId === v._id;
                  return (
                    <button
                      key={v._id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, vehicleId: v._id }))}
                      className={`group flex items-center justify-between gap-3 rounded-xl border-2 p-3 text-left transition ${selected ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-amber-300'}`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-ink">{v.name}</p>
                        <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">
                          {v.category} · {v.seatingCapacity}+1
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-display text-base font-extrabold text-amber-600">
                          ₹{Number(p.price).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-slate-400">+ taxes</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="tb-date">Travel Date</label>
                <input
                  id="tb-date" type="date" className="input"
                  min={new Date().toISOString().slice(0, 10)}
                  value={form.travelDate} onChange={set('travelDate')}
                />
              </div>
              <div>
                <label className="label" htmlFor="tb-pax">Travellers</label>
                <input
                  id="tb-pax"
                  type="number"
                  min="1"
                  max={maxTravellers}
                  className="input"
                  value={form.travellers}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isNaN(n)) return setForm((f) => ({ ...f, travellers: '' }));
                    // clamp into [1, maxTravellers] so the user can't go over capacity
                    const clamped = Math.min(Math.max(n, 1), maxTravellers);
                    setForm((f) => ({ ...f, travellers: clamped }));
                  }}
                />
                {selectedVehicle && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Max {maxTravellers} for {selectedVehicle.name} (driver excluded)
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="tb-pickup">Pickup Location</label>
                <input
                  id="tb-pickup" className="input"
                  placeholder="e.g. Connaught Place, Delhi"
                  value={form.pickupLocation} onChange={set('pickupLocation')}
                />
              </div>
            </div>

            {/* Live price preview */}
            <div className="rounded-xl bg-mist p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total package</span>
                {fareLoading ? (
                  <span className="text-sm text-slate-400">Calculating…</span>
                ) : fare ? (
                  <span className="font-display text-2xl font-extrabold text-ink">
                    ₹{fare.total.toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">—</span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Includes all taxes. Price updates with selected vehicle.</p>
            </div>

            <button onClick={proceedToReview} className="btn-primary w-full !py-3.5 text-base">
              Continue <Icon name="arrow" className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 2 && fare && (
          <div className="space-y-5">
            <div className="rounded-xl bg-mist p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">You&apos;re booking</p>
              <p className="mt-1 font-display text-base font-extrabold text-ink">{tour.title}</p>
              <p className="mt-1.5 text-xs text-slate-500">
                {tour.fromLocation} → {tour.toLocation} · {tour.durationDays}D{tour.durationNights ? `/${tour.durationNights}N` : ''}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Travel: <span className="font-semibold text-ink">{form.travelDate}</span> · Pickup: <span className="font-semibold text-ink">{form.pickupLocation}</span> · {form.travellers} travellers
              </p>
            </div>

            <div className="space-y-2 text-sm">
              {fare.breakdown.map((l, i) => (
                <div key={i} className="flex justify-between text-slate-600">
                  <span>{l.label}</span>
                  <span className={l.amount < 0 ? 'text-green-600' : ''}>₹{l.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-slate-200 pt-3 font-display text-lg font-extrabold text-ink">
                <span>Total Fare</span>
                <span>₹{fare.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {!user && (
              <div className="grid gap-3 sm:grid-cols-3">
                <input className="input" placeholder="Your name *" value={form.name} onChange={set('name')} />
                <input className="input" placeholder="Phone *" value={form.phone} onChange={set('phone')} />
                <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} />
              </div>
            )}
            <textarea className="input" rows="2" placeholder="Any special requests (optional)" value={form.notes} onChange={set('notes')} />

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost">Back</button>
              <button onClick={confirm} disabled={loading} className="btn-primary flex-1 !py-3.5 text-base">
                {loading ? 'Booking…' : `Confirm Booking · ₹${fare.total.toLocaleString('en-IN')}`}
              </button>
            </div>
            <p className="text-center text-xs text-slate-400">Pay cash to driver or online later · Free cancellation up to 24 hrs before travel</p>
          </div>
        )}
      </div>
    </div>
  );
}