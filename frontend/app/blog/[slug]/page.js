import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlog, getBlogs } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return {};
  return buildMetadata(`/blog/${slug}`, {
    title: blog.seo?.metaTitle || `${blog.title} | Global Cabs Blog`,
    description: blog.seo?.metaDescription || blog.excerpt,
    openGraph: blog.coverImage?.url ? { images: [blog.coverImage.url] } : undefined,
  });
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const [blog, all] = await Promise.all([getBlog(slug), getBlogs()]);
  if (!blog) notFound();
  const related = all.filter((b) => b.slug !== slug).slice(0, 3);

  return (
    <>
      <article className="py-16">
        <div className="container-gc max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            {blog.category || 'Travel'} · {new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{blog.title}</h1>
          {blog.excerpt && <p className="mt-4 text-lg text-slate-500">{blog.excerpt}</p>}

          {blog.coverImage?.url && (
            <div className="relative mt-8 h-72 overflow-hidden rounded-2xl sm:h-96">
              <Image src={blog.coverImage.url} alt={blog.title} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" priority />
            </div>
          )}

          <div
            className="prose prose-slate mt-10 max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-amber-600 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {blog.tags?.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-100 pt-6">
              {blog.tags.map((t) => (
                <span key={t} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-slate-500">#{t}</span>
              ))}
            </div>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-mist py-16">
          <div className="container-gc">
            <h2 className="font-display text-2xl font-extrabold">Keep reading</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {related.map((b) => (
                <Link key={b._id} href={`/blog/${b.slug}`} className="card p-6 transition hover:-translate-y-1 hover:shadow-lift">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{b.category || 'Travel'}</p>
                  <h3 className="mt-2 font-display font-bold leading-snug">{b.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{b.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
