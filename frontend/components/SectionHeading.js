export default function SectionHeading({ eyebrow, title, subtitle, center = false }) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className={`eyebrow ${center ? 'justify-center' : ''}`}>{eyebrow}</p>}
      <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-slate-500">{subtitle}</p>}
    </div>
  );
}
