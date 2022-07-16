import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <>Carregando...</>;
  }

  const firstPublicationDate = format(
    new Date(post.first_publication_date),
    'PP',
    {
      locale: ptBR,
    }
  );
  const wordsPerMinute = 200;
  const postDuration = post.data.content.reduce((acc, content) => {
    const heading = content.heading.split(' ');
    const body = RichText.asText(content.body)
      .replace(/[\r\n]/gm, '')
      .split(' ');
    const words = heading.length + body.length;

    return acc + Math.ceil(words / wordsPerMinute);
  }, 0);

  return (
    <>
      <Head>
        <title>Post | {post.data.title}</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.banner}>
          <img
            src={post.data.banner.url}
            alt="Banner post"
            width="100%"
            height="auto"
          />
        </div>
        <article className={commonStyles.contentWidth}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.postDescriptions}>
            <time>
              <FiCalendar size={20} />
              <span>{firstPublicationDate}</span>
            </time>
            <span>
              <FiUser size={20} /> <span>{post.data.author}</span>
            </span>
            <span>
              <FiClock size={20} /> <span>{postDuration} min</span>
            </span>
          </div>

          {post.data.content.map(content => (
            <div key={content.heading} className={styles.content}>
              <h2>{content.heading}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post', { pageSize: 3 });
  const paths = posts.results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', String(params.slug));
  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content,
      title: response.data.title,
      subtitle: response.data.subtitle,
    },
  };

  return {
    props: {
      post,
    },
  };
};
