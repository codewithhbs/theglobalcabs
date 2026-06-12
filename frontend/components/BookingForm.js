'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { TRIP_TYPES } from '@/lib/constants';
import { Icon } from './Icons';

// Conversion-focused 2-step booking flow: trip details -> fare review & confirm
export default function BookingForm({ vehicles: vehiclesProp = [], routes: routesProp = [], compact = false, preselect = {} }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState(vehiclesProp);
  const [routes, setRoutes] = useState(routesProp);

  useEffect(() => {
    if (vehiclesProp.length === 0) {
      api('/vehicles?status=active&limit=50').then((r) => setVehicles(r.data)).catch(() => {});
    }
    if (routesProp.length === 0) {
      api('/routes?status=active&limit=100').then((r) => setRoutes(r.data)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [form, setForm] = useState({
    tripType: preselect.tripType || 'oneWay',
    routeId: preselect.routeId || '',
    pickupLocation: preselect.pickupLocation || '',
    dropLocation: preselect.dropLocation || '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    vehicleId: preselect.vehicleId || '',
    passengers: 1,
    distanceKm: '',
    couponCode: '',
    name: '', email: '', phone: '',
    notes: '',
  });
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const selectedRoute = useMemo(() => routes.find((r) => r._id === form.routeId), [routes, form.routeId]);

  useEffect(() => {
    if (selectedRoute) {
      setForm((f) => ({ ...f, pickupLocation: selectedRoute.pickupLocation, dropLocation: selectedRoute.dropLocation }));
    }
  }, [selectedRoute]);

  const getFare = async () => {
    setError('');
    if (!form.vehicleId || !form.pickupDate || !form.pickupTime) return setError('Please select vehicle, date and time.');
    if (!form.routeId && !form.distanceKm) return setError('Choose a route or enter approximate distance in km.');
    setLoading(true);
    try {
      const res = await api('/fares/calculate', {
        method: 'POST',
        body: {
          routeId: form.routeId || undefined,
          vehicleId: form.vehicleId,
          distanceKm: Number(form.distanceKm) || undefined,
          date: form.pickupDate, time: form.pickupTime,
          tripType: form.tripType, couponCode: form.couponCode || undefined,
        },
      });
      setFare(res.data.fare);
      setStep(2);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const confirm = async () => {
    setError('');
    if (!user && !(form.name && form.phone)) return setError('Please enter your name and phone number.');
    setLoading(true);
    try {
      const res = await api('/bookings', {
        method: 'POST',
        body: {
          routeId: form.routeId || undefined,
          vehicleId: form.vehicleId,
          tripType: form.tripType,
          pickupLocation: form.pickupLocation,
          dropLocation: form.dropLocation,
          pickupDate: form.pickupDate,
          pickupTime: form.pickupTime,
          returnDate: form.returnDate || undefined,
          passengers: Number(form.passengers) || 1,
          distanceKm: Number(form.distanceKm) || undefined,
          couponCode: form.couponCode || undefined,
          notes: form.notes,
          guestDetails: user ? undefined : { name: form.name, email: form.email, phone: form.phone },
        },
      });
      setSuccess(res.data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-green-600"><Icon name="check" className="h-7 w-7" /></span>
        <h3 className="mt-4 font-display text-xl font-bold">Booking received!</h3>
        <p className="mt-2 text-sm text-slate-500">
          Booking ID <span className="font-bold text-ink">#{success.bookingId}</span>. Confirmation has been sent by SMS &amp; email. Our team will assign a driver shortly.
        </p>
        <button onClick={() => { setSuccess(null); setStep(1); setFare(null); }} className="btn-ghost mt-6">Book another cab</button>
      </div>
    );
  }

  return (
    <div className={`card overflow-hidden ${compact ? '' : 'shadow-lift'}`} id="book">
      <div className="flex items-center justify-between bg-ink px-6 py-4">
        <h3 className="font-display font-bold text-white">{step === 1 ? 'Book Your Cab' : 'Review & Confirm'}</h3>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className={`rounded-full px-2.5 py-1 ${step === 1 ? 'bg-amber-500 text-ink' : 'bg-white/10 text-slate-300'}`}>1. Trip</span>
          <span className={`rounded-full px-2.5 py-1 ${step === 2 ? 'bg-amber-500 text-ink' : 'bg-white/10 text-slate-300'}`}>2. Confirm</span>
        </div>
      </div>

      <div className="p-6">
        {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Trip Type</label>
              <div className="flex flex-wrap gap-2">
                {TRIP_TYPES.map((t) => (
                  <button
                    key={t.value} type="button"
                    onClick={() => setForm((f) => ({ ...f, tripType: t.value }))}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${form.tripType === t.value ? 'bg-ink text-white' : 'bg-mist text-slate-600 hover:bg-slate-200'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {routes.length > 0 && (
              <div className="sm:col-span-2">
                <label className="label" htmlFor="bf-route">Popular Route (optional — for fixed fares)</label>
                <select id="bf-route" className="input" value={form.routeId} onChange={set('routeId')}>
                  <option value="">Custom trip — enter locations below</option>
                  {routes.map((r) => <option key={r._id} value={r._id}>{r.name} · {r.distanceKm} km</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="label" htmlFor="bf-pickup">Pickup Location</label>
              <input id="bf-pickup" className="input" placeholder="e.g. Sector 56, Gurugram" value={form.pickupLocation} onChange={set('pickupLocation')} disabled={!!selectedRoute} />
            </div>
            <div>
              <label className="label" htmlFor="bf-drop">Drop Location</label>
              <input id="bf-drop" className="input" placeholder="e.g. IGI Airport T3" value={form.dropLocation} onChange={set('dropLocation')} disabled={!!selectedRoute} />
            </div>
            <div>
              <label className="label" htmlFor="bf-date">Pickup Date</label>
              <input id="bf-date" type="date" className="input" min={new Date().toISOString().slice(0, 10)} value={form.pickupDate} onChange={set('pickupDate')} />
            </div>
            <div>
              <label className="label" htmlFor="bf-time">Pickup Time</label>
              <input id="bf-time" type="time" className="input" value={form.pickupTime} onChange={set('pickupTime')} />
            </div>
            {form.tripType === 'roundTrip' && (
              <div>
                <label className="label" htmlFor="bf-return">Return Date</label>
                <input id="bf-return" type="date" className="input" min={form.pickupDate} value={form.returnDate} onChange={set('returnDate')} />
              </div>
            )}
            <div>
              <label className="label" htmlFor="bf-vehicle">Vehicle</label>
              <select id="bf-vehicle" className="input" value={form.vehicleId} onChange={set('vehicleId')}>
                <option value="">Select vehicle</option>
                {vehicles.map((v) => <option key={v._id} value={v._id}>{v.name} ({v.seatingCapacity}+1) · ₹{v.perKmRate}/km</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="bf-pax">Passengers</label>
              <input id="bf-pax" type="number" min="1" max="8" className="input" value={form.passengers} onChange={set('passengers')} />
            </div>
            {!form.routeId && (
              <div>
                <label className="label" htmlFor="bf-km">Approx. Distance (km)</label>
                <input id="bf-km" type="number" min="1" className="input" placeholder="e.g. 28" value={form.distanceKm} onChange={set('distanceKm')} />
              </div>
            )}
            <div className="sm:col-span-2">
              <button onClick={getFare} disabled={loading} className="btn-primary w-full !py-3.5 text-base">
                {loading ? 'Calculating…' : 'Get Instant Fare'} <Icon name="arrow" className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && fare && (
          <div className="space-y-5">
            <div className="rounded-xl bg-mist p-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{form.pickupLocation}</span>
                <span className="route-dots mx-3 h-1 flex-1" />
                <span>{form.dropLocation}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{form.pickupDate} at {form.pickupTime} · {TRIP_TYPES.find((t) => t.value === form.tripType)?.label}</p>
            </div>

            <div className="space-y-2 text-sm">
              {fare.breakdown.map((l, i) => (
                <div key={i} className="flex justify-between text-slate-600">
                  <span>{l.label}</span><span className={l.amount < 0 ? 'text-green-600' : ''}>₹{l.amount}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-slate-200 pt-3 font-display text-lg font-extrabold text-ink">
                <span>Total Fare</span><span>₹{fare.total}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input className="input" placeholder="Coupon code (optional)" value={form.couponCode} onChange={set('couponCode')} />
              <button onClick={getFare} className="btn-ghost shrink-0">Apply</button>
            </div>

            {!user && (
              <div className="grid gap-3 sm:grid-cols-3">
                <input className="input" placeholder="Your name *" value={form.name} onChange={set('name')} />
                <input className="input" placeholder="Phone *" value={form.phone} onChange={set('phone')} />
                <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} />
              </div>
            )}
            <textarea className="input" rows="2" placeholder="Notes for driver (optional)" value={form.notes} onChange={set('notes')} />

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost">Back</button>
              <button onClick={confirm} disabled={loading} className="btn-primary flex-1 !py-3.5 text-base">
                {loading ? 'Booking…' : `Confirm Booking · ₹${fare.total}`}
              </button>
            </div>
            <p className="text-center text-xs text-slate-400">Pay cash to driver or online later · Free cancellation up to 4 hrs before pickup</p>
          </div>
        )}
      </div>
    </div>
  );
}
