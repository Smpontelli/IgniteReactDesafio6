import { GetStaticProps } from 'next';
import {FiCalendar, FiUser} from 'react-icons/fi'
import Head from 'next/head'
import Link from 'next/link'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';
import { useEffect, useState } from 'react';
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

export default function Home ({postsPagination}: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');

  useEffect(() => {
    setPosts(postsPagination.results);
    setNextPage(postsPagination.next_page);
  }, [postsPagination.results, postsPagination.next_page]);

  function handlePagination(): void {
    fetch(nextPage)
      .then(res => res.json())
      .then(data=> {
        const formattedData = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...formattedData]);
        setNextPage(data.next_page);
      });
  }

  return (

    <>
      <Head>
        <title>Home | {'</> '}spacetraveling.</title>
      </Head>
      <main className={commonStyles.home}>
        <section className = {styles.hero}>
          {posts.map(post => (
            <Link  href={`/post/${post.uid}`} key={post.uid}>
                <a >
                    <strong>{post.data.title}</strong>
                    <p>{post.data.subtitle}</p>
                    <div className = {commonStyles.infos}>
                      <time >
                        <FiCalendar/>
                        {format(new Date(post.first_publication_date), 'dd MMM yyy', { locale: ptBR})}
                      </time>
                      <span>
                        <FiUser/>
                        {post.data.author}
                      </span>
                    </div>
                </a>
            </Link>
          ))}

        </section>
        {nextPage && (

          <button onClick={handlePagination} className = {styles.button}>
            <strong>Carregar mais posts</strong>
          </button>
        )}

      </main>
     </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('', {pageSize: 1})
  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results
  }
  return {
    props: {
      postsPagination
    }
  }
};
