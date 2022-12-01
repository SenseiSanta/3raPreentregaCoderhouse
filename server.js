/*=================== MODULOS ===================*/
import express from "express";
import exphbs from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import morgan from "morgan";
import minimist from "minimist";
import os from 'os';
import cluster from 'cluster';
import multer from "multer";
import util from "util";
import { ContenedorSQLite } from "./src/container/ContenedorSQLite.js";
import { ContenedorFirebase } from "./src/container/ContenedorFirebase.js";
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { logger } from "./src/utils/logger.js";
import * as dotenv from 'dotenv'
dotenv.config();

/*=== Instancia de Server, contenedor y rutas ===*/
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);
const cajaMensajes = new ContenedorFirebase("mensajes");
const cajaProducto = new ContenedorSQLite("productos");
import routerProductos from "./src/routes/productos.routes.js";
import routerInitial from "./src/routes/initial.routes.js";
import routerProductosTest from "./src/routes/productosTest.routes.js";

/*================ Multer Setup ================*/
const storage = multer.diskStorage({
  destination: path.join('public/img/userImg'),
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
export const upload = multer({
  storage,
  dest: 'public/img/userImg'
})

/*================= Middlewears =================*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(compression());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')))
app.use(multer({
  storage,
  dest: 'public/img/userImg'
}).single('image'))

/*================ Session Setup ================*/
import connectMongo from 'connect-mongo'
const MongoStore = connectMongo.create({
  mongoUrl: process.env.MONGO_URL,
  ttl: 600,
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
})

app.use(session({
  store: MongoStore,
  secret: process.env.SECRET_KEY,
  resave: true,
  saveUninitialized: true
}))

/*============= Motor de plantillas =============*/
app.engine(
  "hbs",
  exphbs.engine({
    defaulyLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: "hbs",
  })
);
app.set("views", path.join("views"));
app.set("view engine", "hbs");

/*==================== Rutas ====================*/
app.use("/", routerInitial);
app.use("/api/productos", routerProductos);
app.use("/api/productos-test", routerProductosTest);
app.use("*", (req, res) => {
  const { method, url } = req
  logger.warn(`Ruta ${method} en ${url} no implementada`)
  res.send(`Ruta ${method} en ${url} no implementada`);
});

app.get('/datos', (req, res) => {
  res.status(200).send(`Servidor escuchando en puerto ${puerto}, proceso N ${process.pid}`)
})

/*================== Servidor ==================*/
const minimistOptions = {default: {p: process.env.PORT, m: 'FORK'}}
const proceso = minimist(process.argv, minimistOptions)

//nodemon server.js -p 8081
//nodemon server.js -p 8081 -m CLUSTER
//forever start server.js -p 8082
//forever list
//tasklist
//pm2 start server.js --name="Server 1" --watch -- 8080
//pm2 start server.js --name="Server Cluster" --watch -i max -- 8081
//pm2 list
//forever stop 0
//pm2 delete all

export const PORT = process.argv[2] || proceso.p;
const SERVER_MODE = proceso.m;
const CPU_CORES = os.cpus().length;

if (cluster.isPrimary && SERVER_MODE == 'CLUSTER') {
  logger.info('Cantidad de cores: ', CPU_CORES)

  for (let i = 0; i < CPU_CORES; i++) {
    cluster.fork()
  }

  cluster.on('exit', worker => {
    logger.info(`Worker ${process.pid}, ${worker.id} finaliza ${new Date().toLocaleDateString()}`);
    cluster.fork()
  })
} else {
  const server = httpServer.listen(PORT, () => {
    logger.info(`Servidor escuchando en puerto ${PORT} -- proceso: ${process.pid}`);
  });
  server.on("error", (error) => logger.error(`${new Date().toLocaleDateString()}: Inconveniente en el servidor -> ${error}`));
}


/*============= Conexion Socket.io =============*/
io.on("connection", async (socket) => {
  const DB_MENSAJES = await listarMensajesNormalizados();
  const DB_PRODUCTOS = await cajaProducto.listarAll();
  logger.info(`Nuevo cliente conectado -> ID: ${socket.id}`);
  io.sockets.emit("from-server-message", DB_MENSAJES);
  io.sockets.emit("from-server-product", DB_PRODUCTOS);

  socket.on("from-client-message", async (mensaje) => {
    await cajaMensajes.save(mensaje);
    const MENSAJES = await listarMensajesNormalizados();
    io.sockets.emit("from-server-message", MENSAJES);
  });

  socket.on("from-client-product", async (product) => {
    await cajaProducto.insertar(product);
    const PRODUCTOS = await cajaProducto.listarAll();
    io.sockets.emit("from-server-product", PRODUCTOS);
  });

});

/*=============== Normalizacion de datos ===============*/
import { normalize, schema, denormalize } from "normalizr";
import session from "express-session";
import compression from "compression";

const schemaAuthors = new schema.Entity("author", {}, { idAttribute: "email" });
const schemaMensaje = new schema.Entity(
  "post",
  { author: schemaAuthors },
  { idAttribute: "id" }
);
const schemaMensajes = new schema.Entity(
  "posts",
  { mensajes: [schemaMensaje] },
  { idAttribute: "id" }
);

const normalizarMensajes = (mensajesConId) =>
  normalize(mensajesConId, schemaMensajes);

async function listarMensajesNormalizados() {
  const mensajes = await cajaMensajes.getAll();
  /*logger.info(
    `Los mensajes sin normalizar: ${JSON.stringify(mensajes).length}`
  );*/
  const normalizados = normalizarMensajes({ id: "mensajes", mensajes });
  return normalizados;
}

/* function print(obj) {
    console.log(util.inspect(obj, false, 12, true))
} */