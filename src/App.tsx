import './App.css'
import { PageWrapper } from './components/layout/PageWrapper/PageWrapper'
import { ToastContainer } from './components/ui/Toast/ToastContainer'
import { AppRoutes } from './routes'

function App() {
  return (
    <>
      <PageWrapper>
        <AppRoutes />
      </PageWrapper>
      <ToastContainer />
    </>
  )
}

export default App
