import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProgressProvider } from "./context/ProgressContext";
import { AppShell } from "./components/layout/AppShell";
import { HomePage } from "./routes/HomePage";
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
    <BrowserRouter>
      <ProgressProvider>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<HomePage />} />
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
