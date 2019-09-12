import React, { Component } from 'react';
import App from "../App";

class NewDateForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isGoing: true,
            numberOfGuests: 2
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange = (event)=> {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }

    render() {
        return (
            <form>
                <label>
                    Is going:
                    <input
                        name="isGoing"
                        type="checkbox"
                        checked={this.state.isGoing}
                        onChange={this.handleInputChange} />
                </label>
                <br />
                <label>
                    Number of guests:
                    <input
                        name="numberOfGuests"
                        type="number"
                        value={this.state.numberOfGuests}
                        onChange={this.handleInputChange} />
                </label>
            </form>
        );
    }
}

export default NewDateForm;