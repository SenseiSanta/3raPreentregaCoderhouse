import admin from 'firebase-admin'
import { createRequire } from "module";
const require = createRequire(import.meta.url); // construct the require method
const serviceAccount = require("../../DB/crt/desafioclase20-firebase-adminsdk-hhz23-0a02b3cd01.json")

//Conecta
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export class ContenedorFirebase {
    constructor(coleccion) {
        const db = admin.firestore()
        this.coleccion = db.collection(coleccion);
    }

    async getAll () {
        try {
            let response = await this.coleccion.get();
            let users = [];
            response.forEach(doc =>{
                users.push({...doc.data() })
            })
            return users
        }
        catch(error) {
            console.log(error)
        }
    }

    async getById(id) {
        try {
            const doc = await this.coleccion.doc(id).get();
            if (!doc.exists) {
                throw new Error('El id solicitado no existe')
            } else {
                const data = doc.data();
                return {...data, id}
            }
        } catch (error) {
            console.log(error)
            return {error: 'Objeto no encontrado'}
        }
    }

    async save(obj) {
        try {
            let doc = this.coleccion.doc();
            await doc.create({...obj,id: doc.id});
        } catch (error) {
            console.log(error)
            return {error: 'El objeto no se ha guardado'}
        }
    }


    async deleteById(id) {
        try {
            const toDelete = await this.coleccion.doc(id).get()
            const doc = this.coleccion.doc(id);
            if (toDelete.exists) {
                await doc.delete()
                return `Usuario con id ${id} eliminado`
            } else {
                return `El usuario con id ${id} no existe. Nada se ha eliminado`
            }
        }
        catch (error) {
            console.log(error)
            return false
        }
    }

    async updateById(id, obj) {
        try {
            const toUpdate = await this.coleccion.doc(id).get()
            const doc = this.coleccion.doc(id);
            if (toUpdate.exists) {
                await doc.update(obj)
                return `Usuario con id ${id} actualizado`
            } else {
                return `El usuario con id ${id} no existe. Nada se ha actualizado`
            }
        }
        catch (error) {
            console.log(error)
            return false
        }
    }

    async deleteAll() {
        try {
            const doc = this.coleccion.doc();
            await doc.delete()
            return 'Base de datos reiniciada'
        } catch (error) {
            return 'Error: No se pudo eliminar'
        }
    }
}