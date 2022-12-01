/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
const routerInitial = express.Router();
import { fork } from 'child_process';
import os from 'os';
import { PORT } from '../../server.js'
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { logger } from '../utils/logger.js';
import { upload } from '../../server.js';

/* ============ Creacion de objeto ============ */
import { ContenedorSQLite } from '../container/ContenedorSQLite.js';
import { ContenedorFirebase } from "../container/ContenedorFirebase.js";
import { ContenedorMongoDB } from '../container/ContenedorMongoDB.js';
import { UsuariosSchema } from '../../models/users.js';

const cajaMensajes = new ContenedorFirebase('mensajes');
const cajaProducto = new ContenedorSQLite('productos');
const cajaUsuario = new ContenedorMongoDB('usuarios', UsuariosSchema)
const cajaImagenes = new Contenedor('./public/img/userImg')

/* ================== Mocks ================== */
import { productoMock } from '../mocks/producto.mock.js';

/* ============= Creacion de fork ============ */
const forkProcess = fork('./src/utils/apiRandomNumber.js')

/* =============== Encriptacion =============== */
import bcrypt from 'bcrypt'

async function hashPassGenerator (password) {
    const hashPassword = await bcrypt.hash(password, 10)
    return hashPassword
}

async function verifyPassword(user, pass) {
    const match = await bcrypt.compare(pass, user.password);
    return match
}

/* =============== Passport =============== */
import passport from 'passport';
import { Strategy } from 'passport-local'
import path, { dirname } from 'path';
const LocalStrategy = Strategy;

passport.use(new LocalStrategy(
async function(username, password, done) {
    let usuario = await cajaUsuario.getAll()
    let existeUsuario = usuario.find(usuario => usuario.username == username)

        if (!existeUsuario) {
            return done(null, false)
        } else {
            const match = await verifyPassword(existeUsuario, password)
            if (!match) {
                return done(null, false)
            }
            return done(null, existeUsuario)
        }
    }
));

passport.serializeUser((usuario, done)=>{
    done(null, usuario.username)
})

passport.deserializeUser(async (username, done)=> {
    let usuarios = await cajaUsuario.getAll()
    let existeUsuario = usuarios.find(usuario => usuario.username == username)
    done(null, existeUsuario)
})

routerInitial.use(passport.initialize());
routerInitial.use(passport.session());

/* ============= Middlewares ============= */
import compression from 'compression';
import { Contenedor } from '../container/Contenedor.js';

    /*---- Autenticacion ----*/
function auth (req, res, next) {
    if (req.isAuthenticated()) {
      next()
    } else {
      res.status(401).redirect('/login')
    }
};

/* ============= Routing y metodos ============= */
routerInitial.get('/prueba', (req, res) => {
    res.render('prueba')
})

routerInitial.post('/prueba', (req, res) => {
    res.send('uploaded')
})

routerInitial.get('/', compression(), auth, async (req, res) => {
    const username = req.user.username;
    const phone = req.user.phone;
    const age = req.user.age;
    const image = req.user.image;
    const email = req.user.email;
    const address = req.user.address;
    const DB_PRODUCTOS = await cajaProducto.listarAll()
    const DB_MENSAJES = await cajaMensajes.getAll()
    res.render('vista', {DB_PRODUCTOS, DB_MENSAJES, username, phone, age, image, email, address})
})

routerInitial.get('/login', async (req, res) => {
    res.status(200).render('login')
})

routerInitial.get('/login-error', async (req, res) => {
    res.status(200).render('login-error')
})

routerInitial.get('/register', async (req, res) => {
    res.status(200).render('register')
})

routerInitial.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login-error'}));

routerInitial.post('/register', async (req, res) => {
    console.log(req.file.filename)
    const { usuario, password, phone, age, address, email, image } = req.body;
    let infoUser = {
        username: usuario,
        password: await hashPassGenerator(password),
        phone: phone,
        age: age,
        address: address,
        email: email,
        image: req.file.filename
    }
    if (usuario || password) {
        let user = await cajaUsuario.getByUser(usuario)
        if (user == undefined) {
            let guardarDatos = await cajaUsuario.save(infoUser)
            logger.info(`${infoUser.username} registrado con exito`)
            res.redirect('/login')
        } else {
            const errorRegister = 'El usuario que intenta registar ya existe, intente con otro nombre'
            res.render('register', {errorRegister})
        }
    } else {
        res.status(200).render('register')
    }
})

routerInitial.get('/logout', async (req, res) => {
    req.session.destroy((error) => {
     if (error) {
        logger.error(error)
        res.status(402).json(error);
     } else {
        logger.info('logout ok');
        res.status(200).redirect('/login');
     }
    });
   });

routerInitial.get('/api/productos-test', auth, async (req, res) => {
    const cajaRandom = new productoMock();
    let productos = cajaRandom.generarDatos()
    res.status(200).render('productos-test', {productos})
})

routerInitial.get('/info', compression(), async (req, res) => {
    const processArgs = process.argv.slice(2);
    const processMemory = process.memoryUsage().rss
    const processDirectory = process.cwd()
    const CPU_CORES = os.cpus().length;
    const puerto = PORT;
    res.status(200).render('info', {process, processArgs, processMemory, processDirectory, CPU_CORES, puerto})
})

routerInitial.get('/infosin', async (req, res) => {
    const processArgs = process.argv.slice(2);
    const processMemory = process.memoryUsage().rss
    const processDirectory = process.cwd()
    const CPU_CORES = os.cpus().length;
    const puerto = PORT;
    res.status(200).render('info', {process, processArgs, processMemory, processDirectory, CPU_CORES, puerto})
})

routerInitial.get('/api/randoms', async (req, res) => {
    const { cantidad } = req.query

    forkProcess.send(cantidad)
/*     forkProcess.on("message", msg =>{
        console.log(msg)
    }) */
    res.status(200).render('apiRandoms')
})


/* =========== Exportacion de modulo =========== */
export default routerInitial;