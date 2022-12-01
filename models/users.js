import mongoose from 'mongoose';

export const UsuariosSchema = new mongoose.Schema({
    username: {type: String, require:true, max:20},
    password: {type: String, require:true, max:30},
    phone: {type: Number, require:true},
    age: {type: Number, require:true},
    address: {type: String, require:true, max:30},
    email: {type: String, require:true, max:50},
    image: {type: String, require:true, max:40}
});