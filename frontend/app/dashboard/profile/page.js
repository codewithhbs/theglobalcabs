'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState({ profile: '', pwd: '', profileErr: '', pwdErr: '' });
  const [busy, setBusy] = useState('');

  const saveProfile = async () => {
    setBusy('profile');
    setMsg((m) => ({ ...m, profile: '', profileErr: '' }));
    try {
      const res = await api('/auth/me', { method: 'PATCH', body: profile });
      setUser(res.data.user);
      setMsg((m) => ({ ...m, profile: 'Profile updated.' }));
    } catch (e) {
      setMsg((m) => ({ ...m, profileErr: e.message }));
    }
    setBusy('');
  };

  const savePassword = async () => {
    setBusy('pwd');
    setMsg((m) => ({ ...m, pwd: '', pwdErr: '' }));
    try {
      if (pwd.newPassword.length < 6) throw new Error('New password must be at least 6 characters.');
      const res = await api('/auth/update-password', { method: 'PATCH', body: pwd });
      if (res.token) localStorage.setItem('gc_token', res.token);
      setPwd({ currentPassword: '', newPassword: '' });
      setMsg((m) => ({ ...m, pwd: 'Password changed.' }));
    } catch (e) {
      setMsg((m) => ({ ...m, pwdErr: e.message }));
    }
    setBusy('');
  };

  return (
    <div className="grid gap-6">
      <div className="card p-7">
        <h1 className="font-display text-xl font-extrabold">Profile</h1>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Email</label>
            <input className="input" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </div>
        </div>
        {msg.profileErr && <p className="mt-3 text-sm font-semibold text-red-600">{msg.profileErr}</p>}
        {msg.profile && <p className="mt-3 text-sm font-semibold text-emerald-600">{msg.profile}</p>}
        <button className="btn-primary mt-5" onClick={saveProfile} disabled={busy === 'profile'}>
          {busy === 'profile' ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="card p-7">
        <h2 className="font-display text-xl font-extrabold">Change password</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Current password</label>
            <input className="input" type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">New password</label>
            <input className="input" type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} />
          </div>
        </div>
        {msg.pwdErr && <p className="mt-3 text-sm font-semibold text-red-600">{msg.pwdErr}</p>}
        {msg.pwd && <p className="mt-3 text-sm font-semibold text-emerald-600">{msg.pwd}</p>}
        <button className="btn-dark mt-5" onClick={savePassword} disabled={busy === 'pwd'}>
          {busy === 'pwd' ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </div>
  );
}
