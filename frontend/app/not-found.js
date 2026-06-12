import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-gc py-32 text-center">
      <p className="eyebrow justify-center">Wrong turn</p>
      <h1 className="mt-4 font-display text-5xl font-extrabold">404</h1>
      <p className="mt-3 text-slate-500">This route doesn&apos;t exist. Let&apos;s get you back on the road.</p>
      <Link href="/" className="btn-primary mt-8">Back to Home</Link>
    </div>
  );
}
