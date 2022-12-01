import knex from 'knex'
import { configSQLite } from '../utils/config.js'

export class ContenedorSQLite {
    constructor(tableName){
        this.knexCli = knex(configSQLite.db);
        this.tableName = tableName;
    }

    async listarAll(){
        try {
            return await this.knexCli.from(this.tableName).select('*')
        } catch (error) {
            throw error
        }
    }

    async listar(id){
        try {
            return await this.knexCli.from(this.tableName).select('*').where({id: id})
        } catch (error) {
            throw error
        }
    }

    async actualizar(id, obj){
        try {
            return await this.knexCli.from(this.tableName).where({id: id}).update(obj);
        } catch (error) {
            throw error
        }
    }

    async insertar(obj){
        return await this.knexCli(this.tableName).insert(obj)
    }

    async eliminar(id){
        try {
            return await this.knexCli.from(this.tableName).where({id: id}).del();
        } catch (error) {
            throw error
        }
    }

    async cerrarConexion() {
        this.knexCli.destroy();
    }

}