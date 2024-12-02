import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import 'react-router-dom'
import Dashboard from './page/Dashboard';
import Home from './page/Home';
import Pool from './page/Pool';
import Test from './page/Test';
import ChainRestrictor from './restrictor/ChainRestrictor';
function App() {
  return (
  <>
 <BrowserRouter>
<Routes>
<Route path='/' element= {<ChainRestrictor><Home /></ChainRestrictor>}/>
<Route path='/dashboard' element={<ChainRestrictor><Dashboard /></ChainRestrictor>}/>
<Route path='/pool/:contractAddress' element={<ChainRestrictor><Pool /></ChainRestrictor>}/>
<Route path='/test' element={<Test />}/>
</Routes>
 </BrowserRouter>
  </>
  );
}

export default App;
