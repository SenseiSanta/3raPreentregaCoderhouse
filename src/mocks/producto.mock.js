import { Contenedor } from "../container/Contenedor.js";
import { generarProducto } from "../utils/generateProduct.js";

export class productoMock extends Contenedor {
    
    constructor() {
        super()
    }

    generarDatos(cant = 5) {
        let listaDatos = []
        for (let i = 0; i < cant; i++) {
            listaDatos.push(generarProducto())
        }
        return listaDatos
    }
}