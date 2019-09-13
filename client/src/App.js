import React, { Component } from 'react';
//import logo from './logo.svg';
import Modal from 'react-bootstrap4-modal';
import NewDateForm from './components/NewDateForm';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ideas: null,
            addDateModal: false,
        };
    }

    componentDidMount() {
        // Call our fetch function below once the component mounts
        this.getDateList()
            .then(res => {
                //console.log("Res: " + JSON.stringify(res));
                this.setState({ ideas: res });
            })
            .catch(err => console.log(err));
    }

    getDateList = async () => {
        const response = await fetch('/dateIdeas');
        const body = await response.json();
        console.log("Body: ", body);
        if (response.status !== 200) {
            throw Error(body.message)
        }

        return body.map(idea =>
            <div className="col-lg-3 col-md-3 col-sm-3 col-xs-12 card" key={idea.name}>
                <div className="card-body">
                    <h5 className="card-title">{idea.name}</h5>
                    <p className="card-text">{idea.address}</p>
                </div>
            </div>
        );
    };

    toggleModal = ()=> {
        this.setState({addDateModal: !this.state.addDateModal,});
    }

    render() {
        return (<div className="App">
            <div className="container">
                <div className="row">
                        <div className="col-lg">
                            <button type="button" className="btn btn-primary" onClick={this.toggleModal}>Add New Idea</button>
                            {
                                this.state.addDateModal ?
                                    <Modal
                                        visible={this.state.addDateModal}
                                        onClickBackdrop={this.toggleModal}
                                    >
                                        <div className="modal-header">
                                            <h5 className="modal-title">Add Date Idea</h5>
                                        </div>
                                        <div className="modal-body">
                                            <NewDateForm/>
                                        </div>
                                    </Modal>
                                    :
                                    <div></div>
                            }
                        <div className="App-intro">{this.state.ideas}</div>
                    </div>
                </div>
            </div>
        </div>);
    }
}

export default App;