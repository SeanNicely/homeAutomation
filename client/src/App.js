import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';

class App extends Component {
    state = {
        ideas: null
    };

    componentDidMount() {
        // Call our fetch function below once the component mounts
        this.getDateList()
            .then(res => {
                console.log("Res: " + JSON.stringify(res));
                this.setState({ ideas: res });
            })
            .catch(err => console.log(err));
    }
    // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
    getDateList = async () => {
        const response = await fetch('/mary');
        const body = await response.json();
        console.log("Body: ", body);
        if (response.status !== 200) {
            throw Error(body.message)
        }
        return body.map(idea =>
            <li key={idea.name}>
                {JSON.stringify(idea)}
            </li>
        );
    };

    render() {
        return (
            <div className="App">
                {/*<header className="App-header">*/}
                {/*    <img src={logo} className="App-logo" alt="logo" />*/}
                {/*    <h1 className="App-title">Welcome to React</h1>*/}
                {/*</header>*/}
                <ul className="App-intro">{this.state.ideas}</ul>
            </div>
        );
    }
}

export default App;