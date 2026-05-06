import { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { FixedHeader } from './components/FixedHeader'
import { AnimatePresence, motion } from 'framer-motion'
import { ExplorePage } from './pages/Explore'
import { SpotsPage } from './pages/Spots'
import { PlannerPage } from './pages/Planner'
import { FoodShoppingPage } from './pages/Food'
import { EmergencyPage } from './pages/Emergency'

function App() {
  const [activeTab, setActiveTab] = useState('explore')

  const renderContent = () => {
    switch (activeTab) {
      case 'explore': return <ExplorePage />
      case 'spots': return <SpotsPage />
      case 'planner': return <PlannerPage onGoExplore={() => setActiveTab('explore')} />
      case 'food': return <FoodShoppingPage />
      case 'emergency': return <EmergencyPage />
      default: return <ExplorePage />
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex justify-center bg-navy transition-colors">
        <div className="w-full max-w-[375px] bg-navy relative shadow-2xl min-h-screen">
          <FixedHeader activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main className="pt-[200px] pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
