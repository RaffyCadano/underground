import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { TournamentDescriptionContent } from '@/app/components/tournament-description-content';
import {
  formatNewsDate,
  getNewsArticle,
  getNewsArticles,
  NEWS_CATEGORY_LABELS,
} from '@/lib/news';
import { SITE_NAME } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getNewsArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsArticle(slug);
  if (!article) return { title: `News | ${SITE_NAME}` };

  return {
    title: `${article.title} | ${SITE_NAME} News`,
    description: article.excerpt,
  };
}

function categoryClass(category: keyof typeof NEWS_CATEGORY_LABELS): string {
  if (category === 'circuit') return 'border-brand-500/30 bg-brand-500/10 text-brand-300';
  if (category === 'update') return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
  return 'border-slate-600 bg-slate-800/60 text-slate-300';
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getNewsArticle(slug);
  if (!article) notFound();

  return (
    <section className="container py-10 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/news"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-brand-300"
        >
          <ArrowLeft size={16} />
          All news
        </Link>

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

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-400">{article.excerpt}</p>

        <div className="prose-invert mt-10 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 sm:p-8">
          <TournamentDescriptionContent content={article.body} featured />
        </div>
      </div>
    </section>
  );
}
