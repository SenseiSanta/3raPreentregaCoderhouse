import knex from 'knex';
import { configMaria, configSQLite } from '../utils/config.js'

const knexCliMaria = knex(configMaria.db);
const knexCliSQLite = knex(configSQLite.db);

knexCliMaria.schema.dropTableIfExists('mensajes')
    .then(()=>{
        knexCliMaria.schema.createTable('mensajes', table => {
            table.increments('id').primary()
            table.string('author', 50).notNullable();
            table.string('text', 100).notNullable();
            table.string('date', 50).notNullable();
        })
            .then(()=> console.log("Tabla Mensajes Creada"))
            .catch(err=>{
                console.log(err);
                throw err;
            })
            .finally(()=>{
                knexCliMaria.destroy()
            })
    })

knexCliSQLite.schema.dropTableIfExists('productos')
    .then(()=>{
        knexCliSQLite.schema.createTable('productos', table => {
            table.increments('id').primary()
            table.string('producto', 50).notNullable();
            table.integer('precio', 30).notNullable();
            table.string('img', 100).notNullable();
        })
            .then(()=> console.log("Tabla Productos Creada"))
            .catch(err=>{
                console.log(err);
                throw err;
            })
            .finally(()=>{
                knexCliSQLite.destroy()
            })
    })