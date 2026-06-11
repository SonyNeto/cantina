import { Routes, Route } from 'react-router';
import ROUTES from './constants/routes';
import { Layout } from './components/Layout';
import { Menu } from './pages/menu/Menu';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={ROUTES.HOME} element={<Menu />} />
      </Route>
    </Routes>
  );
}

export default App;
