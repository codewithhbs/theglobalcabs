import Link from 'next/link';
import Image from 'next/image';
import { getBlogs } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { Icon } from '@/components/Icons';

export async function generateMetadata() {
  return buildMetadata('/blog', {
    title: 'Travel Blog | Tips, Routes & Guides — Global Cabs',
    description: 'Travel tips, route guides and cab booking advice for Gurugram, Delhi NCR and North India road trips.',
  });
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function BlogPage() {
  const blogs = await getBlogs();
  const [featured, ...rest] = blogs;

  return (
    <>
      <section className="bg-ink py-16 text-white">
        <div className="container-gc">
          <p className="eyebrow text-amber-400">Blog</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Road trip guides & travel tips.</h1>
        </div>
        <div className="lane mt-12" />
      </section>

      <section className="py-16">
        <div className="container-gc">
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="card group grid overflow-hidden md:grid-cols-2">
              <div className="relative h-64 bg-ink md:h-auto">
                {featured.coverImage?.url ? (
                  <Image src={featured.coverImage.url} alt={featured.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="grid h-full place-items-center text-amber-500/40"><Icon name="pin" className="h-12 w-12" /></div>
                )}
              </div>
              <div className="p-8 md:p-10">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{featured.category || 'Travel'} · {fmtDate(featured.createdAt)}</p>
                <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight group-hover:text-amber-600 sm:text-3xl">{featured.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-500">{featured.excerpt}</p>
                <p className="mt-6 text-sm font-semibold text-amber-600">Read article →</p>
              </div>
            </Link>
          )}

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((b) => (
              <Link key={b._id} href={`/blog/${b.slug}`} className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                <div className="relative h-44 bg-ink">
                  {b.coverImage?.url ? (
                    <Image src={b.coverImage.url} alt={b.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full place-items-center text-amber-500/40"><Icon name="pin" className="h-10 w-10" /></div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{b.category || 'Travel'} · {fmtDate(b.createdAt)}</p>
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug group-hover:text-amber-600">{b.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{b.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
          {blogs.length === 0 && <p className="text-slate-500">No articles published yet — check back soon.</p>}
        </div>
      </section>
    </>
  );
}
