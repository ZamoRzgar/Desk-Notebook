import { AppProvider } from './store/AppContext';
import { HeaderBar } from './components/HeaderBar';
import { BookView } from './components/BookView';
import { PrintView } from './components/PrintView';

export default function App() {
  return (
    <AppProvider>
      <div className="screen-root desk-bg flex h-screen flex-col overflow-hidden font-sans text-stone-800 transition-colors duration-300 dark:text-stone-200">
        <HeaderBar />
        <BookView />
      </div>
      <PrintView />
    </AppProvider>
  );
}
