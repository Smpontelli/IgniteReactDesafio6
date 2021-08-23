import styles from './header.module.scss'
import Link from 'next/link'
export default function Header() {
  return (
    <header className={styles.header} >
      <div className={styles.maxSize}>
        <nav>
          <Link href="/">
            <a>
              <img className={styles.imageStile} src="/logo.svg" alt="logo"/>
            </a>
          </Link>

        </nav>
      </div>
    </header>
  )
}
