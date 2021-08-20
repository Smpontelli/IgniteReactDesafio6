import styles from './header.module.scss'

export default function Header() {
  return (
    <header className={styles.header} >
      <div className={styles.maxSize}>
        <img className={styles.imageStile} src="/logo.svg" alt="logo"/>
      </div>
    </header>
  )
}
