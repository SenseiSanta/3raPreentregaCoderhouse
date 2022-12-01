import mongoose from 'mongoose';
import { configMongoDB } from '../utils/config.js'

let connection = await mongoose.connect(configMongoDB.db.cnxString)

export class ContenedorMongoDB {
    
    constructor(nombreColeccion, esquema) {
        this.coleccion = mongoose.model(nombreColeccion, esquema)
    }

    async getAll() {
        try {
            const docs = await this.coleccion.find()
            return docs
        }
        catch(error) {
            console.log(error)
        }
    }

    async getByUser(user) {
        try {
            const doc = await this.coleccion.find({username: user})
            if (doc == '') {
                return undefined
            } else {
                return doc
            }
        }
        catch(error) {
            console.log(error)
        }
    }

    async save(obj) {
        try {
            let doc = await this.coleccion.create(obj);
            return {status: 'Objeto agregado', doc: doc}
        } catch (error) {
            console.log(error)
            return {error: 'El objeto no se ha guardado. Intenta con otro nombre'}
        }
    }

    async update(user, pass){
        try {
            let doc = await this.coleccion.updateOne({username: user}, {password: pass});
            return {status: 'Objeto actualizado con exito', doc: doc}
        } catch (error) {
            console.log(error)
            return {error: 'El objeto no se ha actualizado'}
        }
    }

    async deleteByUsername(user) {
        try {
            let doc = await this.coleccion.deleteOne({username: user});
            return {status: 'Objeto eliminado con exito', doc: doc}
        } catch (error) {
            console.log(error)
            return {error: 'El objeto no se ha eliminado'}
        }
    }

    async deleteAll() {
        try {
            let doc = await this.coleccion.deleteMany({});
            return {status: 'Todo ha sido eliminado', doc: doc}
        } catch (error) {
            console.log(error)
            return {error: 'No se ha eliminado nada'}
        }
    }
}