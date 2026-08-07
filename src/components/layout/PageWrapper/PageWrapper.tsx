import type { ReactNode } from 'react'
import { Sidebar } from '../Sidebar/Sidebar'
import { Header } from '../Header/Header'
import { BottomNav } from '../BottomNav/BottomNav'
import styles from './PageWrapper.module.css'

interface PageWrapperProps {
  children: ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className={styles.wrapper}>
      <Sidebar />

      <div className={styles.content}>
        <Header />
        <BottomNav />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}