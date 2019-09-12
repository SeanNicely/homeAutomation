import React, { Component } from 'react';
import App from "../App";

class NewDateForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            address: "",
            durationShort: false,
            durationMedium: false,
            durationLong: false,
            event: false,
            neighborhood: "",
            priceRangeFree: false,
            priceRangeLow: false,
            priceRangeMedium: false,
            priceRangeHigh: false,
            romanticism: 0,
            tags: [],
            day: false,
            night: false,
            weatherDependent: false
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
                <legend class="m-b-1 text-xs-center">Add Date Idea</legend>
                <div class="form-group input-group">
                    <span class="has-float-label">
                        <input name="name" value={this.state.name} className="form-control" type="text" placeholder="" onChange={this.handleInputChange}/>
                        <label for="name">Name</label>
                    </span>
                    <span class="has-float-label">
                        <input name="address" value={this.state.address} className="form-control" type="text" placeholder="" onChange={this.handleInputChange}/>
                        <label for="address">Address</label>
                    </span>
                    <span class="has-float-label">
                        <input name="neighborhood" value={this.state.neighborhood} className="form-control" type="text" placeholder="" onChange={this.handleInputChange}/>
                        <label for="neighborhood">Neighborhood</label>
                    </span>
                    <span class="has-float-label">
                        <input name="tags" value={this.state.tags} className="form-control" type="text" placeholder="" onChange={this.handleInputChange}/>
                        <label for="tags">Tags (separate with commas)</label>
                    </span>
                    <span class="has-float-label">
                        <input name="event" checked={this.state.event} className="form-control" type="checkbox" onChange={this.handleInputChange}/>
                        <label for="event">Event</label>
                    </span>
                    <span class="has-float-label">
                        <input name="weatherDependent" checked={this.state.weatherDependent} className="form-control" type="checkbox" onChange={this.handleInputChange}/>
                        <label for="weatherDependent">Weather Dependent</label>
                    </span>
                    <span class="has-float-label">
                        Duration
                        <input name="durationShort" checked={this.state.durationShort} className="form-control" type="checkbox" onChange={this.handleInputChange}/>
                        <label for="durationShort">Short</label>
                        <input name="durationMedium" checked={this.state.durationMedium} className="form-control" type="checkbox" onChange={this.handleInputChange}/>
                        <label for="durationMedium">Medium</label>
                        <input name="durationLong" checked={this.state.durationLong} className="form-control" type="checkbox" onChange={this.handleInputChange}/>
                        <label for="durationLong">Long</label>
                    </span>
                    <span class="has-float-label">
                        Time
                        <input name="day" checked={this.state.day} className="form-control" type="checkbox" onChange={this.handleInputChange}/>
                        <label for="day">Day</label>
                        <input name="night" checked={this.state.night} className="form-control" type="checkbox" onChange={this.handleInputChange}/>
                        <label for="night">Night</label>
                    </span>
                    <span class="has-float-label">
                        Price Range
                        <input name="priceRangeFree" checked={this.state.priceRangeFree} className="form-control" type="checkbox" onChange={this.handleInputChange}/>
                        <label for="priceRangeFree">Free</label>
                        <input name="priceRangeLow" checked={this.state.priceRangeLow} className="form-control" type="checkbox" onChange={this.handleInputChange}/>
                        <label for="priceRangeLow">$</label>
                        <input name="priceRangeMedium" checked={this.state.priceRangeMedium} className="form-control" type="checkbox" onChange={this.handleInputChange}/>
                        <label for="priceRangeMedium">$$</label>
                        <input name="priceRangeHigh" checked={this.state.priceRangeHigh} className="form-control" type="checkbox" onChange={this.handleInputChange}/>
                        <label for="priceRangeHigh">$$$</label>
                    </span>
                    <span class="has-float-label">
                        Romanticism
                        <input name="romanticismLow" checked={this.state.romanticism === 0} value=0 className="form-control" type="radio" onChange={this.handleInputChange}/>
                        <label for="romanticismLow">Low</label>
		                <input name="romanticismMedium" checked={this.state.romanticism === 1} value=1 className="form-control" type="radio" onChange={this.handleInputChange}/>
                        <label for="romanticismMedium">Medium</label>
                        <input name="romanticismHigh" checked={this.state.romanticism === 2} value=2 className="form-control" type="radio" onChange={this.handleInputChange}/>
                        <label for="romanticismHigh">High</label>
                    </span>
                </div>
            </form>
        );
    }
}

export default NewDateForm;
