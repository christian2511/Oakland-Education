import { useLocalSearchParams, useRouter } from 'expo-router';
import { Redirect } from 'expo-router';
import { LessonRunner } from '@/components/LessonRunner';
import { lessonById } from '@/data/lessons';
import { useApp } from '@/state/AppState';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const { recordLesson } = useApp();
  const lesson = lessonId ? lessonById(lessonId) : undefined;
  if (!lesson) return <Redirect href="/(tabs)/home" />;
  return (
    <LessonRunner
      lesson={lesson}
      onExit={() => router.replace('/(tabs)/home')}
      onFinish={(r) => { recordLesson(r); router.replace('/(tabs)/home'); }}
    />
  );
}
