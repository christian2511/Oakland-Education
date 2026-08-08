import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { LessonRunner } from './LessonRunner';
import { lessonById } from '@/data/lessons';
import { useApp } from '@/store/AppState';

export function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { recordLesson } = useApp();

  const lesson = lessonId ? lessonById(lessonId) : undefined;
  if (!lesson) return <Navigate to="/home" replace />;

  return (
    <LessonRunner
      lesson={lesson}
      onExit={() => navigate('/home')}
      onFinish={(result) => {
        recordLesson(result);
        navigate('/home');
      }}
    />
  );
}
