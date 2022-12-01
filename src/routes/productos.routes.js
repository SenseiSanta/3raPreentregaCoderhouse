/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
const routerProductos = express.Router();
import { Contenedor } from '../container/Contenedor.js'
import { logger } from '../utils/logger.js';

/* ============ Creacion de objeto ============ */
const caja = new Contenedor('DB/products.json');

/* ============= Routing y metodos ============= */
routerProductos.get('/', async (req, res) => {
    res.status(200).send(await caja.getAll());
})

routerProductos.get('/:id', async (req, res) => {
    const id = parseInt(req.params['id']);
    res.status(200).send(await caja.getById(id));
}) 

routerProductos.put('/:id', async (req, res) => {
    const id = parseInt(req.params['id']);
    let { producto, precio, img } = req.body;
    const actualizado = await caja.updateById(id, producto, precio, img)
    if (actualizado) {
        res.status(201).json({msg: 'Actualizado con exito', data: req.body});
    } else {
        res.status(400).json({error: 'No se actualizo nada: Producto no encontrado'})
    }
})

routerProductos.post('/', async (req, res) => {
    logger.info(await caja.save(req.body)) 
    res.status(201).json({msg: 'Agregado', data: req.body})
})

routerProductos.delete('/:id', async (req, res) => {
    const id = parseInt(req.params['id']);
    const eliminado = await caja.deleteById(id)
    if (eliminado) {
        logger.info('Eliminado con exito')
        res.status(200).json({msg: 'Eliminado con exito'});
    } else {
        logger.error('Error al eliminar el objeto')
        res.status(400).json({error: 'No se elimino nada: Producto no encontrado'})
    }
})

/* =========== Exportacion de modulo =========== */
export default routerProductos;