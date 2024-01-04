import { asHTML, asText } from "@prismicio/helpers";
import { GetStaticPaths, GetStaticProps } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { GetClientPrismic } from "../../../services/prismic";
import styles from '../styles.module.scss';

type Post = {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface PostPreviewProps {
  post: Post;
}

export default function PostPreview({ post }: PostPreviewProps) {
  const { data } = useSession();
  const router = useRouter();

  useEffect(() => {
    // @ts-expect-error
    if (data?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [data]);

  return (
    <>
      <Head>
        <title>{`${post.title} | Ignews`}</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <Link href="/" className={styles.continueReading}>
            Wanna continue reading?
            <span>Subscribe now</span>
            🤗
          </Link>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = GetClientPrismic();
  const response = await prismic.getByUID('publication', slug as string);

  const post = {
    slug,
    title: asText(response.data.title),
    content: asHTML(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  }

  return {
    props: { post },
    revalidate: 60 * 30, // 30 minutes
  };
}