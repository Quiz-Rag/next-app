'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Database, BrainCircuit, Network, GraduationCap } from 'lucide-react';
import styles from './Navigation.module.css';

const navItems = [
  { path: '/train-db', label: 'Train DB', icon: Database },
  { path: '/quiz', label: 'Quiz', icon: BrainCircuit },
  { path: '/wireshark', label: 'Wireshark', icon: Network },
  { path: '/tutor', label: 'Tutor', icon: GraduationCap },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎮</span>
          <span className={styles.logoText}>NetSec Arcade</span>
        </Link>

        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <li key={item.path} className={styles.navItem}>
                <Link
                  href={item.path}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      className={styles.activeIndicator}
                      layoutId="activeTab"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
