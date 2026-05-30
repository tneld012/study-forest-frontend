import { Route, Routes } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import PasswordResetRequestPage from "../pages/PasswordResetRequestPage.jsx";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
import MyPage from "../pages/MyPage.jsx";
import StudyDetailPage from "../pages/StudyDetailPage.jsx";
import CreateStudyPage from "../pages/CreateStudyPage.jsx";
import EditStudyPage from "../pages/EditStudyPage.jsx";
import HabitsPage from "../pages/HabitsPage.jsx";
import FocusPage from "../pages/FocusPage.jsx";
import CommunityPage from "../pages/CommunityPage.jsx";
import CreatePostPage from "../pages/CreatePostPage.jsx";
import PostDetailPage from "../pages/PostDetailPage.jsx";


export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/password-reset" element={<PasswordResetRequestPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/studies/:studyId" element={<StudyDetailPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/:postId" element={<PostDetailPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/studies/new" element={<CreateStudyPage />} />
          <Route path="/studies/:studyId/edit" element={<EditStudyPage />} />
          <Route path="/studies/:studyId/habits" element={<HabitsPage />} />
          <Route path="/studies/:studyId/focus" element={<FocusPage />} />
          <Route path="/community/new" element={<CreatePostPage />} />
        </Route>
      </Route>
    </Routes>
  );
}