import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head'
import {FiCalendar, FiUser, FiClock} from 'react-icons/fi'
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
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

export default function Post({post}: PostProps) {

  const router = useRouter();
  if (router.isFallback) {
    return (
      <div className={styles.loading}>
        <h1>Carregando...</h1>

      </div>
    );
  }

  const timeToRead = post.data.content.reduce((acc, content) => {
    const textToRead = RichText.asText(content.body);
    const counter = textToRead.split(/\s+/)
    const calc = Math.ceil(counter.length / 200)
    return acc+ calc
  }, 0)

  return (
    <>
      <Head>
        <title>{`${post.data.title} | </> spacetraveling.`}</title>
      </Head>

      <main className={commonStyles.home}>
        <article className={styles.article}>
          <h1>{post.data.title}</h1>
          <div className = {commonStyles.infos}>
            <time >
              <FiCalendar/>
              {format(new Date(post.first_publication_date), 'dd MMM yyy', { locale: ptBR})}
            </time>
            <span>
              <FiUser/>
              {post.data.author}
            </span>
            <span>
              <FiClock/>
              {timeToRead} min
            </span>
          </div>
          <section>
            {post.data.content.map(item => (
              <div key={item.heading}>
                <h2>{item.heading}</h2>
                <div className={styles.bodyText} dangerouslySetInnerHTML={{ __html: RichText.asHtml(item.body) }}/>
              </div>
            ))}
          </section>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ])

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  // console.log(JSON.stringify(response, null, 2))
  // console.log(response);
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(item => {
        return {
          heading: item.heading,
          body: item.body,
        };
      }),
    },
  };

  return {
    props: {
      post
    },
    revalidate: 60*30
  };
};
