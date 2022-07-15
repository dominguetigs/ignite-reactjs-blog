import { PrismicDocument, Query } from '@prismicio/types';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function formatPostsPagination(
  data: Query<PrismicDocument<Record<string, any>, string, string>>
): PostPagination {
  return {
    next_page: data.next_page,
    results: (data.results ?? []).map(result => ({
      uid: result.uid,
      data: {
        title: result.data.title,
        subtitle: result.data.subtitle,
        author: result.data.author,
      },
      first_publication_date: format(
        new Date(result.first_publication_date),
        'PP',
        {
          locale: ptBR,
        }
      ),
    })),
  };
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  function handleLoadPosts(): void {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        const { next_page, results } = formatPostsPagination(data);

        setPosts([...posts, ...results]);

        setNextPage(next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Posts | Ignite--blog</title>
      </Head>

      <main className={styles.container}>
        <div className={`${styles.posts} ${commonStyles.contentWidth}`}>
          {posts.map(post => (
            <Link key={post.uid} href={`/posts/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div>
                  <time>
                    <FiCalendar size={20} />{' '}
                    <span>{post.first_publication_date}</span>
                  </time>
                  <span>
                    <FiUser size={20} /> <span>{post.data.author}</span>
                  </span>
                </div>
              </a>
            </Link>
          ))}
          {!!nextPage && (
            <button
              type="button"
              className={styles.loadPosts}
              onClick={handleLoadPosts}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    pageSize: 3,
  });

  const postsPagination: PostPagination = formatPostsPagination(postsResponse);

  return {
    props: {
      postsPagination,
    },
    revalidate: 24 * 60 * 60, // 24 hours
  };
};
