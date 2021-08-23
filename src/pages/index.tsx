import { GetStaticProps } from 'next';
import {FiCalendar, FiUser} from 'react-icons/fi'
import Head from 'next/head'
import Link from 'next/link'

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

export default function Home ({postsPagination}: HomeProps) {
  return (

    <>
      <Head>
        <title>Home | {'</> '}spacetraveling.</title>
      </Head>
      <main className={commonStyles.home}>
        <section className = {styles.hero}>
          {postsPagination.results.map(post => (
            <Link  href={`/post/${post.uid}`}>
                <a key={post.uid}>
                    <strong>{post.data.title}</strong>
                    <p>{post.data.subtitle}</p>
                    <div className = {styles.infos}>
                      <time >
                        <FiCalendar/>
                        {new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        })}
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

        <button className = {styles.button}> <strong>Carregar mais posts</strong></button>

      </main>
     </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('', {pageSize: 2})
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
