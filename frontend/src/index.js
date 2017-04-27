/*jshint esversion: 6 */
// eslint-disable-next-line to ignore the next line.
/* eslint-disable */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import classnames from 'classnames';


class TextInput extends React.Component {
    render() {
        return (
            <div>
                <label>{this.props.label}</label>
                <input type="text" className="form-control" value={this.props.name} onChange={this.props.onChange}/>
            </div>
        )
    }
}

class RadioOption extends React.Component {
    render() {
        return(
            <div className="radio">
                <label><input type="radio" value={this.props.value} name="favorite" checked={this.props.favorite === this.props.value} onChange={this.props.onChange}/>{this.props.label}</label>
            </div>
        )
    }
}

class EachContact extends React.Component {
    render() {
        return (
            <div className="each-contact">
                <h4>{this.props.name} - {this.props.type}</h4>
                <p>{this.props.phone}</p>
                <p>{this.props.email}</p>
                <button className="btn btn-success" type="submit" onClick={this.props.editContact}>Edit</button>
                <button className="btn btn-danger" type="submit" onClick={this.props.deleteContact}>Delete</button>
                <div className="line"></div>
            </div>
        )
    }
}

class MyContacts extends React.Component {
    constructor() {
        super();
        this.state = {
            contacts: [],
            name: '',
            phone: '',
            email: '',
            type: '',
            favorite: 'no',
            show_favorites: false
        }
    }

    // backend queries database for all contacts, when they are recieved update the state with those contacts. This will set the inital display of contacts.
    componentDidMount() {
        $.get('http://localhost:5000/api/contacts')
            .then(contacts => {
                this.setState({
                    contacts: contacts
                })
            });
    }

    addContact() {
        // Grab contact information from the form
        var contact = {
            name: this.state.name,
            phone: this.state.phone,
            email: this.state.email,
            type: this.state.type,
            favorite: this.state.favorite
        }
        // Send this over to the backend to add the contact to the database
        $.ajax({
            method: 'POST',
            url: 'http://localhost:5000/api/contacts',
            data: JSON.stringify(contact),
            contentType: 'application/json'
        })
        // After the database adds the contact it will return a JSON object representation of that contact, update the contacts state by adding that contact object. This will in turn update the DOM.
        .then((result) => {
            console.log(result.name + ' added to the database.');
            this.state.contacts.push(result);
            this.setState({
                contacts: this.state.contacts,
                name: '',
                phone: '',
                email: '',
                type: '',
                favorite: 'no'
            })
        })

    }

    deleteContact(id) {
        // Grab the id of the item to delete. This is sent over from render.
        var del_id = {"id" : id}
        // Send that ID over to the server to delete it form the database.
        $.ajax({
            method: 'POST',
            url: 'http://localhost:5000/api/delete',
            data: JSON.stringify(del_id),
            contentType: 'application/json'
        })
        // If that's successful, delete it from the state as well which will in turn update the DOM
        .then((result) => {
            console.log('Contact at ID ' + result.id + ' deleted from database.');
            this.state.contacts = this.state.contacts.filter(function(contact) {
                return contact.id !== result.id;
            });
            this.setState({
                contacts: this.state.contacts
            })
        })
    }

    editContact(index) {
        console.log('Do something!');
    }

    changeState(stateName, event) {
        this.setState({
            [stateName]: event.target.value
        });
    }

    toggleFavorites() {
        this.setState({
            show_favorites: !this.state.show_favorites
        })
    }

    render() {
        console.log(this.state.contacts)
        return(
            <div className="main">
                <h2 className="heading">My Contacts</h2>

                <div className="my-contacts">
                    <button type="button" className="btn btn-info btn-md add-button" data-toggle="modal" data-target="#myModal">Add New Contact</button>
                    <div className="modal fade" id="myModal" role="dialog">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close" data-dismiss="modal">&times;</button>
                                    <h4 className="modal-title">Add New Contact</h4>
                                </div>

                                <div className="modal-body form-group contact-form">


                                    <TextInput label="Name:" value={this.state.name} onChange={event=> this.changeState('name', event)}/>

                                    <TextInput label="Phone Number:" value={this.state.phone} onChange={event=> this.changeState('phone', event)}/>

                                    <TextInput label="Email:" value={this.state.email} onChange={event=> this.changeState('email', event)}/>

                                    <label>Type: </label>
                                    <select
                                    className="form-control"
                                    value={this.state.type}
                                    onChange={event=> this.changeState('type', event)}>
                                    <option>Select One</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Family">Family</option>
                                    <option value="Colleague">Colleague</option>
                                    </select>

                                    <label>Favorite? </label>
                                    <RadioOption label="No" value="no" favorite={this.state.favorite} onChange={event=> this.changeState('favorite', event)}/>
                                    <RadioOption label="Yes" value="yes" favorite={this.state.favorite} onChange={event=> this.changeState('favorite', event)}/>

                                </div>
                                <div className="modal-footer">
                                    <button  className="btn btn-primary" type="submit" onClick={() => this.addContact()}>Submit</button>
                                </div>
                            </div>
                        </div>
                    </div>


                    <button className="btn btn-info" onClick={() => this.toggleFavorites()}>{this.state.show_favorites ? 'Show All' : 'Only Show Favorites' }</button>

                    {this.state.contacts.map((contact, index) => {
                        if (this.state.show_favorites && contact.favorite === 'yes') {
                            return (
                            <EachContact key={contact.id} index={index} name={contact.name} type={contact.type} phone={contact.phone} email={contact.email} editContact={event=> this.editContact(index)}
                            deleteContact={event=> this.deleteContact(contact.id)}/>)
                        } else if (!this.state.show_favorites) {
                            return (
                            <EachContact key={contact.id} index={index} name={contact.name} type={contact.type} phone={contact.phone} email={contact.email}
                            editContact={event=> this.editContact(index)}
                            deleteContact={event=> this.deleteContact(contact.id)}/>)
                        }
                    })}
                    <div>
                    {this.state.name},
                    {this.state.phone},
                    {this.state.email},
                    {this.state.type},
                    {this.state.favorite},
                    </div>
                </div>

            </div>
        )
    }
}

ReactDOM.render(<MyContacts/>, document.getElementById('root'));
