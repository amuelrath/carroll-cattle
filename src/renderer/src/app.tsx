import React from 'react'
import { Shell } from './components/layout'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/home'
import { SettingsPage } from './pages/settings'
import { HistoryPage } from './pages/history'
import { ProcessPage } from './pages/process/home'
import { ROUTES } from '@shared/routes'

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Shell>
        <Routes>
          <Route index element={<Navigate to={ROUTES.home} replace />} />
          <Route index path={ROUTES.home} element={<HomePage />} />
          <Route index path={ROUTES.process.home} element={<ProcessPage />} />
          <Route path={ROUTES.history} element={<HistoryPage />} />
          <Route path={ROUTES.settings} element={<SettingsPage />} />
        </Routes>
      </Shell>
    </HashRouter>
  )
}

export default App
