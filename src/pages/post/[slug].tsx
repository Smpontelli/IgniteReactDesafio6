import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { ptBR } from 'date-fns/locale';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { getPrismicClient } from '../../services/prismic';
import UtterancesComments from '../../components/UtterancesComments';
import ButtonPreview from '../../components/ButtonPreview';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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

interface NeighborhoodPost {
  title: string;
  uid: string;
}

interface PostProps {
  post: Post;
  preview: boolean;
  nextPost: NeighborhoodPost;
  previousPost: NeighborhoodPost;
}

export default function Post({
  post,
  preview,
  nextPost,
  previousPost,
}: PostProps) {
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
    const counter = textToRead.split(/\s+/);
    const calc = Math.ceil(counter.length / 200);
    return acc + calc;
  }, 0);

  return (
    <>
      <Head>
        <title>{`${post.data.title} | </> spacetraveling.`}</title>
      </Head>

      <main className={commonStyles.home}>
        <article className={styles.article}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.infos}>
            <time>
              <FiCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM yyy', {
                locale: ptBR,
              })}
            </time>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <span>
              <FiClock />
              {timeToRead} min
            </span>
          </div>

          <span>
            {format(
              parseISO(post.last_publication_date),
              "'*editado em' dd MMM yyyy', às' HH:mm",
              {
                locale: ptBR,
              }
            )}
          </span>
          <section>
            {post.data.content.map(item => (
              <div key={item.heading}>
                <h2>{item.heading}</h2>
                <div
                  className={styles.bodyText}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(item.body),
                  }}
                />
              </div>
            ))}
          </section>
        </article>

        <hr />

        <aside className={styles.footer}>
          <div>
            {previousPost && (
              <>
                <p>{previousPost.title}</p>
                <Link href={`/post/${previousPost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </>
            )}
          </div>

          <div>
            {nextPost && (
              <>
                <p>{nextPost.title}</p>
                <Link href={`/post/${nextPost.uid}`}>
                  <a>Próximo post</a>
                </Link>
              </>
            )}
          </div>
        </aside>

        <UtterancesComments />

        {preview && <ButtonPreview />}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

function existNeighborhoodPost(post, slug): NeighborhoodPost | null {
  return slug === post.results[0].uid
    ? null
    : {
        title: post.results[0]?.data?.title,
        uid: post.results[0]?.uid,
      };
}

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  // console.log(JSON.stringify(response, null, 2))
  // console.log(response);

  const responsePreviousPost = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: slug,
      orderings: '[document.first_publication_date desc]',
    }
  );

  const responseNextPost = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize: 1, after: slug, orderings: '[document.first_publication_date]' }
  );

  const nextPost = existNeighborhoodPost(responseNextPost, slug);

  const previousPost = existNeighborhoodPost(responsePreviousPost, slug);

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
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
      post,
      preview,
      nextPost,
      previousPost,
    },
    revalidate: 60 * 30,
  };
};
