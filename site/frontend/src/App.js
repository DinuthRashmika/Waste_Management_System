import logo from './logo.svg';
import './App.css';
import Login from './components/login';

function App() {
  return (
    <div className="App">
      <Login/>
      <div className='form-container'>
        <form className='  '>
         <div className='form-group'> 
          <label>Username:</label>
          <input type = 'text' placeholder='username '></input><br/>
          <label>password:</label>
          <input type = 'text' placeholder = 'password'></input>
</div>
        </form>
      </div>
    </div>
  );
}

export default App;
