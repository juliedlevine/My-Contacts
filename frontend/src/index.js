/*jshint esversion: 6 */
// eslint-disable-next-line to ignore the next line.
/* eslint-disable */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import classnames from 'classnames';

// Input fields
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

// Radio button options
class RadioOption extends React.Component {
    render() {
        return(
            <div className="radio">
                <label><input type="radio" value={this.props.value} name="favorite" checked={this.props.favorite === this.props.value} onChange={this.props.onChange}/>{this.props.label}</label>
            </div>
        )
    }
}

// Contacts list
class EachContact extends React.Component {
    render() {
        return (
            <div className="each-contact">
                <h4>{this.props.name} - {this.props.type} <img className={this.props.heart} src="/heart.png"/></h4>
                <p>{this.props.phone}</p>
                <p>{this.props.email}</p>
                <button data-toggle="modal" data-target="#myModal" className="btn btn-success" type="submit" onClick={this.props.editMode}>Edit</button>
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
            id: '',
            name: '',
            phone: '',
            email: '',
            type: '',
            favorite: 'no',
            show_favorites: false,
            mode: null,
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
            // Cheat to clear form fields in bootstrap form (state already reflects cleared fields).
            $('form').get(0).reset();
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
        // Send ID as a param over to the server to delete it form the database.
        $.ajax({
            method: 'DELETE',
            url: 'http://localhost:5000/api/contact/' + id,
            contentType: 'application/json'
        })
        // If that's successful, delete it from the state as well which will in turn update the DOM
        .then((result) => {
            console.log('Contact at ID ' + result.id + ' deleted from database.');
            this.state.contacts = this.state.contacts.filter(function(contact) {
                return contact.id !== result.id;
            });
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

    editContact() {
        this.setState({mode: 'edit'});
        var edit_contact = {
            id: this.state.id,
            name: this.state.name,
            phone: this.state.phone,
            email: this.state.email,
            type: this.state.type,
            favorite: this.state.favorite
        }
        // Remove old contact from contacts state array, but dont set state yet.
        this.state.contacts = this.state.contacts.filter(function(contact) {
            return contact.id !== edit_contact.id;
        });
        // Send ID as a param over to the server to update it in the database.
        $.ajax({
            method: 'PUT',
            url: 'http://localhost:5000/api/contact/' + this.state.id,
            data: JSON.stringify(edit_contact),
            contentType: 'application/json'
        })
        // If that's successful, add the newly updated contact to the contacts state array which will update the DOM
        .then((result) => {
            $('form').get(0).reset();
            console.log('Contact at ID ' + result.id + ' updated in database.');
            this.state.contacts.push(result);
            this.setState({
                contacts: this.state.contacts
            })
        })
    }

    // Allow form inputs to reflect state
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

    addMode() {
        this.setState({
            mode: "add"
        })
    }

    editMode(index) {
        // Code to update form inputs with data of person i clicked on - doesn't work though.
        this.setState({
            mode: "edit",
            id: this.state.contacts[index].id,
            name: this.state.contacts[index].name,
            phone: this.state.contacts[index].phone,
            email: this.state.contacts[index].email,
            type: this.state.contacts[index].type,
            favorite: this.state.contacts[index].favorite
        })
    }

    render() {
        console.log('Mode: ' + this.state.mode);
        console.log(this.state.name);
        return(
            <div className="main">
                <h2 className="heading">My Contacts</h2>

                {/* Add/Show Favorites Buttons */}
                <div className="my-contacts">
                    <button type="button" className="btn btn-info btn-md add-button" data-toggle="modal" data-target="#myModal" onClick={() => this.addMode()}>Add New Contact</button>
                    <button className="btn btn-info" onClick={() => this.toggleFavorites()}>{this.state.show_favorites ? 'Show All' : 'Only Show Favorites' }</button>

                    {/* Each Contact List */}
                    {this.state.contacts.map((contact, index) => {
                        if (contact.favorite === 'yes') {
                            return (
                            <EachContact key={contact.id} index={index} name={contact.name} type={contact.type} phone={contact.phone} email={contact.email}
                            editMode={event=> this.editMode(index)}
                            deleteContact={event=> this.deleteContact(contact.id)}
                            heart={'heart_show'} />)
                        } else if (!this.state.show_favorites) {
                            return (
                            <EachContact key={contact.id} index={index} name={contact.name} type={contact.type} phone={contact.phone} email={contact.email}
                            editMode={event=> this.editMode(index)}
                            heart={'heart_hide'}
                            deleteContact={event=> this.deleteContact(contact.id)}/>)
                        }
                    })}
                </div>

                {/* Modal Pop up Form */}
                <div className="modal" id="myModal" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal">&times;</button>
                                <h4 className="modal-title">{this.state.mode === 'edit' ? "Edit Contact" : "Add New Contact"}</h4>
                            </div>
                            <div className="modal-body form-group contact-form">
                                <form>
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
                                </form>
                            </div>

                            <div className="modal-footer">
                                <button data-dismiss="modal" className="btn btn-primary" type="submit" onClick={this.state.mode === 'add' ? () => this.addContact() : () => this.editContact()}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

ReactDOM.render(<MyContacts/>, document.getElementById('root'));
