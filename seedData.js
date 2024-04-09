// const mongoose = require('mongoose');
import mongoose from 'mongoose';

const equipesSchema = new mongoose.Schema({
    
    id: Number,
    username: String,
    password: String,
    email: String
});
export const UserModel = mongoose.model('equipes', equipesSchema);



export const equipes = [
    
    {id: 1 ,username: "pipas",password: "xxxxx",email: "pipas@gmail.com"},
    {id: 2 ,username: "poly" ,password: "xxxxx",email: "poly@gmail.com"},
    {id: 3 ,username: "purple" ,password: "xxxxx",email: "purple@gmail.com"}
    // Add more users as needed
];
