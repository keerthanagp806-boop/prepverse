import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { CourseDetail } from './pages/CourseDetail';
import { LessonViewer } from './pages/LessonViewer';
import { Assessments } from './pages/Assessments';
import { AssessmentInstructions } from './pages/AssessmentInstructions';
import { AssessmentInterface } from './pages/AssessmentInterface';
import { AssessmentResult } from './pages/AssessmentResult';
import { OnlineCompiler } from './pages/OnlineCompiler';
import { Companies } from './pages/Companies';
import { CompanyDetail } from './pages/CompanyDetail';
import { Progress } from './pages/Progress';
import { InstructorPortal } from './pages/InstructorPortal';
import { AdminPortal } from './pages/AdminPortal';
import { AdminCourseManagement } from './pages/AdminCourseManagement';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="courses/:id/lessons/:lessonId" element={<LessonViewer />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="assessments/:id/instructions" element={<AssessmentInstructions />} />
            <Route path="assessments/take/:attemptId" element={<AssessmentInterface />} />
            <Route path="assessments/attempts/:attemptId/result" element={<AssessmentResult />} />
            <Route path="compiler" element={<OnlineCompiler />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="progress" element={<Progress />} />
            <Route path="instructor" element={<InstructorPortal />} />
            <Route path="admin" element={<AdminPortal />} />
            <Route path="admin/courses" element={<AdminCourseManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
