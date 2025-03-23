import './App.css'
import MolStarViewer from './components/MolStarViewer'

function App() {
 
  fetch("DB/fdsfs")

  return (
    <>
      <div className="app">
      <header>
        <h1>Mol* Molecular Viewer</h1>
        <p>Upload a PDB file or use the example button to load a structure</p>
      </header>
      <main>
        
        <MolStarViewer width={800} height={600}   />
      </main>
    </div>
    </>
  )
}

export default App


/*
  id --- name     ----  filepath      --- type
  1 ---- randomvirus    /folder/aad   ---- 



*/