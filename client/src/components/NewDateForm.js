import React, { Component } from 'react';

class NewDateForm extends Component {
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

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange = (event)=> {
        let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        const romanticism = "romanticism"
        if (event.target.name.includes(romanticism)) {
            value = parseInt(value);
            event.target.name = romanticism;
        }

        // console.log("name: ", event.target.name);
        // console.log("value: ", event.target.value);
        this.setState({
            [event.target.name]: value
        });
        // console.log("state: ", this.state);
    }

    handleSubmit = (event)=> {
        event.preventDefault();
        let submission = {};
        submission.name = this.state.name;
        submission.address = this.state.address;
        submission.neighborhood = this.state.neighborhood;
        submission.tags = (this.state.tags !== "") ? this.state.tags.split(",").map(tag => tag.trim()) : "";
        submission.event = this.state.event;
        submission.weatherDependent = this.state.weatherDependent;
        submission.durations = [];
        if (this.state.durationShort) submission.durations.push("short");
        if (this.state.durationMedium) submission.durations.push("medium");
        if (this.state.durationLong) submission.durations.push("long");
        submission.times = [];
        if (this.state.day) submission.times.push("day");
        if (this.state.night) submission.times.push("night");
        submission.priceRanges = [];
        if (this.state.priceRangeFree) submission.priceRanges.push("free");
        if (this.state.priceRangeLow) submission.priceRanges.push("low");
        if (this.state.priceRangeMedium) submission.priceRanges.push("medium");
        if (this.state.priceRangeHigh) submission.priceRanges.push("high");
        switch (this.state.romanticism) {
            case 1:
                submission.romanticism = "medium";
                break;
            case 2:
                submission.romanticism = "high";
                break;
            default:
                submission.romanticism = "low";
        }
        console.log(submission);

        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/dateIdeas', false);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(submission));
    }

    render() {
        return (
            <form className="bg-faded">
                <div className="form-group input-group">
                    <span className="has-float-label">
                        <input name="name" value={this.state.name} className="form-control" type="text" placeholder="" onChange={this.handleInputChange}/>
                        <label htmlFor="name">Name</label>
                    </span>
                </div>

                <div className="form-group input-group">
                    <span className="has-float-label">
                        <input name="address" value={this.state.address} className="form-control" type="text" placeholder="" onChange={this.handleInputChange}/>
                        <label htmlFor="address">Address</label>
                    </span>
                </div>

                <div className="form-group input-group">
                    <span className="has-float-label">
                        <input name="neighborhood" value={this.state.neighborhood} className="form-control" type="text" placeholder="" onChange={this.handleInputChange}/>
                        <label htmlFor="neighborhood">Neighborhood</label>
                    </span>
                </div>

                <div className="form-group input-group">
                    <span className="has-float-label">
                        <input name="tags" value={this.state.tags} className="form-control" type="text" placeholder="" onChange={this.handleInputChange}/>
                        <label htmlFor="tags">Tags (separate with commas)</label>
                    </span>
                </div>

                <div className="form-group input-group">
                    <label>Event: </label>
                    <div className="form-check form-check-inline">
                        <input name="event" checked={this.state.event} className="form-check-input" type="checkbox" onChange={this.handleInputChange}/>
                    </div>
                </div>

                <div className="form-group input-group">
                    <label>Weather Dependent: </label>
                    <div className="form-check form-check-inline">
                        <input name="weatherDependent" checked={this.state.weatherDependent} className="form-check-input" type="checkbox" onChange={this.handleInputChange}/>
                    </div>
                </div>

                <div className="form-group input-group">
                    <label>Duration: </label>
                    <div className="form-check form-check-inline">
                        <input name="durationShort" checked={this.state.durationShort} className="form-check-input" type="checkbox" onChange={this.handleInputChange}/>
                        <label htmlFor="durationShort" className="form-check-label">Short</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input name="durationMedium" checked={this.state.durationMedium} className="form-check-input" type="checkbox" onChange={this.handleInputChange}/>
                        <label htmlFor="durationMedium" className="form-check-label">Medium</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input name="durationLong" checked={this.state.durationLong} className="form-check-input" type="checkbox" onChange={this.handleInputChange}/>
                        <label htmlFor="durationLong" className="form-check-label">Long</label>
                    </div>
                </div>

                <div className="form-group input-group">
                    <label>Time: </label>
                    <div className="form-check form-check-inline">
                        <input name="day" checked={this.state.day} className="form-check-input" type="checkbox" onChange={this.handleInputChange}/>
                        <label htmlFor="day" className="form-check-label">Day</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input name="night" checked={this.state.night} className="form-check-input" type="checkbox" onChange={this.handleInputChange}/>
                        <label htmlFor="night" className="form-check-label">Night</label>
                    </div>
                </div>

                <div className="form-group input-group">
                    <div className="form-check form-check-inline">
                        <label>Price Range: </label>
                        <input name="priceRangeFree" checked={this.state.priceRangeFree} className="form-check-input" type="checkbox" onChange={this.handleInputChange}/>
                        <label htmlFor="priceRangeFree" className="form-check-label">Free</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input name="priceRangeLow" checked={this.state.priceRangeLow} className="form-check-input" type="checkbox" onChange={this.handleInputChange}/>
                        <label htmlFor="priceRangeLow" className="form-check-label">$</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input name="priceRangeMedium" checked={this.state.priceRangeMedium} className="form-check-input" type="checkbox" onChange={this.handleInputChange}/>
                        <label htmlFor="priceRangeMedium" className="form-check-label">$$</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input name="priceRangeHigh" checked={this.state.priceRangeHigh} className="form-check-input" type="checkbox" onChange={this.handleInputChange}/>
                        <label htmlFor="priceRangeHigh" className="form-check-label">$$$</label>
                    </div>
                </div>

                <div className="form-group input-group">
                    <label>Romanticism: </label>
                    <div className="form-check form-check-inline">
                        <input name="romanticismLow" checked={this.state.romanticism === 0} value={0} className="form-check-input"  type="radio" onChange={this.handleInputChange}/>
                        <label htmlFor="romanticismLow" className="form-check-label">Low</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input name="romanticismMedium" checked={this.state.romanticism === 1} value={1} className="form-check-input" type="radio" onChange={this.handleInputChange}/>
                        <label htmlFor="romanticismMedium"className="form-check-label">Medium</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input name="romanticismHigh" checked={this.state.romanticism === 2} value={2} className="form-check-input" type="radio" onChange={this.handleInputChange}/>
                        <label htmlFor="romanticismHigh"className="form-check-label">High</label>
                    </div>
                </div>
                <button className="btn btn-primary" type="submit" onClick={this.handleSubmit}>Submit</button>
            </form>
        );
    }
}

export default NewDateForm;
