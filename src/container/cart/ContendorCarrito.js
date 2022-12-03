import ContendorMongoDB from '../ContenedorMongoDB.js'
import fs from 'fs/promises';

export class CarritosDaoMongoDB extends ContendorMongoDB {

    constructor() {
        super('carritos', {
            productos: {type: [], required: true}
        })
    }

    async updateCart(obj, id) {
        try {
            await this.coleccion.updateOne({"_id": id}, {$set: {id: id, ...obj}})
        } catch (error) {
            console.log(error)
        }
    }

    async deleteProductById (carrito, producto) {
        try{
            const toDelete = await this.coleccion.findById({"_id": carrito.id})
            if (toDelete.id !== undefined) {
                for (let i = 0; i <= carrito.productos.length; i++) {
                    if (carrito.productos[i].producto == producto.producto) {
                        carrito.productos.splice(i, 1)
                        await this.updateCart(carrito, carrito.id)
                        return true
                    }
                }
            } else {
                throw new Error (`No se ha encontrado ningun producto en el carrito designado con ese id`)
            }         
        } catch(error) {
            console.log(error)
            return false
        }
    }
}