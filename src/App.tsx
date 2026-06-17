import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import ItemLibrary from '@/pages/ItemLibrary';
import Compilation from '@/pages/Compilation';
import ItemEdit from '@/pages/Compilation/ItemEdit';
import Review from '@/pages/Review';
import ReviewDetail from '@/pages/Review/ReviewDetail';
import VersionRelease from '@/pages/VersionRelease';
import KnowledgeRules from '@/pages/KnowledgeRules';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/item-library" element={<ItemLibrary />} />
          <Route path="/compilation" element={<Compilation />} />
          <Route path="/compilation/edit/:id" element={<ItemEdit />} />
          <Route path="/review" element={<Review />} />
          <Route path="/review/:id" element={<ReviewDetail />} />
          <Route path="/version" element={<VersionRelease />} />
          <Route path="/knowledge" element={<KnowledgeRules />} />
        </Routes>
      </Layout>
    </Router>
  );
}
