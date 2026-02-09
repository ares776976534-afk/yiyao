import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import MainLayout from '../layouts/MainLayout';
import { ROUTES, routeConfig } from './routes';

const Fallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 360 }}>
    <Spin size="large" />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.DRUGS} replace /> },
      ...routeConfig
        .filter(r => r.path !== ROUTES.HOME)
        .map(({ path, component: Component }) => ({
          path: path.slice(1),
          element: (
            <Suspense fallback={<Fallback />}>
              <Component />
            </Suspense>
          )
        }))
    ]
  }
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
