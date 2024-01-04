import * as Prismic from '@prismicio/client';

export const GetClientPrismic = () => {
  const client = Prismic.createClient(
    process.env.PRISMIC_ENDPOINT,
    {
      accessToken: process.env.PRISMIC_TOKEN
    }
  );

  return client;
}