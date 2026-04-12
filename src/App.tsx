import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProgressProvider } from "./context/ProgressContext";
import { AppShell } from "./components/layout/AppShell";
import { DailyPage } from "./routes/DailyPage";
import { LearnPage } from "./routes/LearnPage";
import { DailyDrawPage } from "./routes/DailyDrawPage";
import { BodyMindSpiritPage } from "./routes/BodyMindSpiritPage";
import { GazingPage } from "./routes/GazingPage";
import { LibraryPage } from "./routes/LibraryPage";
import { CardDetailPage } from "./routes/CardDetailPage";
import { QuizPage } from "./routes/QuizPage";
import { ProgressPage } from "./routes/ProgressPage";
import { SpreadPage } from "./routes/SpreadPage";
import { SpreadPracticePage } from "./routes/SpreadPracticePage";
import { SystemPage } from "./routes/SystemPage";
import { JournalPage } from "./routes/JournalPage";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ProgressProvider>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/daily" replace />} />
            <Route path="daily" element={<DailyPage />} />
            <Route path="daily/learn" element={<LearnPage />} />
            <Route path="daily/draw" element={<DailyDrawPage />} />
            <Route path="daily/body-mind-spirit" element={<BodyMindSpiritPage />} />
            <Route path="daily/gazing" element={<GazingPage />} />
            <Route path="daily/imagination" element={<GazingPage imagination />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="library/:cardId" element={<CardDetailPage />} />
            <Route path="quiz" element={<QuizPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="spreads" element={<SpreadPage />} />
            <Route path="spreads/:spreadId" element={<SpreadPracticePage />} />
            <Route path="system" element={<SystemPage />} />
            <Route path="journal" element={<JournalPage />} />
          </Route>
        </Routes>
      </ProgressProvider>
    </BrowserRouter>
  );
}

export default App;
