import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PresentationViewer from './viewer/PresentationViewer';
import PresentationEditor from './editor/PresentationEditor';
import Dashboard from './components/Dashboard';
import NotFound from './components/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* View-only presentation */}
        <Route path="/view/:slug" element={<PresentationViewer mode="view" />} />

        {/* Editable presentation */}
        <Route path="/edit/:slug" element={<PresentationEditor />} />

        {/* Fallback */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
