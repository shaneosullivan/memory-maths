'use client';

import { useApp } from '@/contexts/AppContext';
import ProfileSelector from '@/components/ProfileSelector';
import Header from '@/components/Header';
import LearningPhase from '@/components/LearningPhase';
import PracticePhase from '@/components/PracticePhase';
import TestPhase from '@/components/TestPhase';
import styles from './page.module.css';

export default function Home() {
  const { state } = useApp();

  if (!state.currentProfile) {
    return <ProfileSelector />;
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        {state.phase === 'learning' && <LearningPhase />}
        {state.phase === 'practice' && <PracticePhase />}
        {state.phase === 'test' && <TestPhase />}
      </main>
    </div>
  );
}