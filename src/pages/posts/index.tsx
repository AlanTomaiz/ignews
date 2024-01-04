import { asText } from '@prismicio/helpers';
import { GetStaticProps } from 'next';
import Head from 'next/head';

import Link from 'next/link';
import { GetClientPrismic } from '../../services/prismic';
import styles from './styles.module.scss';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

interface PostsProps {
  posts: Post[];
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.postList}>
          {posts.map(post => (
            <Link href={`/posts/${post.slug}`} key={post.slug}>
              <time>{post.updatedAt}</time>
              <strong>{post.title}</strong>
              <p>{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const clientPrismic = GetClientPrismic();
  const response = await clientPrismic.getByType(
    'publication',
    {
      fetch: ['publication.title', 'publication.content'],
      pageSize: 100,
    }
  );

  const posts = response.results.map(post => ({
    slug: post.uid,
    title: asText(post.data.title),
    excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
    updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  }));

  return {
    props: { posts }
  }
}