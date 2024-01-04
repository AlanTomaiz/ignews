import { asHTML, asText } from "@prismicio/helpers";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";

import { GetClientPrismic } from "../../services/prismic";
import styles from './styles.module.scss';

type Post = {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
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
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const { slug } = params;

  const session = await getSession({ req });
  // @ts-expect-error
  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: `/posts/preview/${slug}/`,
        permanent: false,
      }
    }
  }

  const prismic = GetClientPrismic();
  const response = await prismic.getByUID('publication', slug as string);

  const post = {
    slug,
    title: asText(response.data.title),
    content: asHTML(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  }

  return {
    props: { post }
  };
}