import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Newspaper } from 'lucide-react';
import { formatNewsDate, getNewsArticles, NEWS_CATEGORY_LABELS } from '@/lib/news';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: `News | ${SITE_NAME}`,
  description: `Circuit updates, platform announcements, and news from ${SITE_NAME}.`,
};

function categoryClass(category: keyof typeof NEWS_CATEGORY_LABELS): string {
  if (category === 'circuit') return 'border-brand-500/30 bg-brand-500/10 text-brand-300';
  if (category === 'update') return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
  return 'border-slate-600 bg-slate-800/60 text-slate-300';
}

export default function NewsPage() {
  const articles = getNewsArticles();

  return (
    <div className="w-full">
      <section className="relative border-b border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(34,197,94,0.1),transparent)]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-3xl space-y-3 text-center sm:space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              <Newspaper size={12} />
              Announcements
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              News
            </h1>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
              Circuit updates, platform news, and featured announcements from {SITE_NAME}.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-12 md:py-14 lg:py-16">
        <ul className="mx-auto grid max-w-4xl gap-4 sm:gap-5">
          {articles.map((article) => (
            <li key={article.slug}>
              <article className="group rounded-2xl border border-slate-800 bg-slate-950/60 p-5 transition hover:border-slate-700 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <time dateTime={article.publishedAt} className="text-slate-500">
                    {formatNewsDate(article.publishedAt)}
                  </time>
                  <span
                    className={`rounded-full border px-2 py-0.5 font-semibold uppercase tracking-wider ${categoryClass(article.category)}`}
                  >
                    {NEWS_CATEGORY_LABELS[article.category]}
                  </span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-white transition group-hover:text-brand-200 sm:text-xl">
                  <Link href={`/news/${article.slug}`} className="hover:underline decoration-brand-500/40 underline-offset-2">
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{article.excerpt}</p>
                <Link
                  href={`/news/${article.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 transition hover:text-brand-200"
                >
                  Read more
                  <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
