import './App.css'
import Map from "./components/map";
import Clarity from '@microsoft/clarity';

const clarityProjectId = import.meta.env.VITE_MICROSOFT_CLARITY_PROJECT_ID;
Clarity.init(clarityProjectId);

function App() {

  return (
    <>
      <Map />
    </>
  )
}

export default App
