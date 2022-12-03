import { createTransport } from "nodemailer";
import * as dotenv from 'dotenv'
dotenv.config({path:'../../.env'})

/* Configuracion de mail y proceso de envio */
export async function registerEmailConfirmation(user){

    /* Configuracion de quien envia */
    const transporter = createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS
    }
});
    
    const regConfirm_MailOptions = {
        from: 'CoderHouse - App Olivera <noreply@myapp.com>',
        to: process.env.ADMIN_EMAIL,
        subject: 'Nuevo registro en la base de datos',
        text: 'Contenido del mensaje',
        html: `<p style="font-size: 20px"> <strong> El usuario ${user.username} se ha registrado con exito </strong> </p> <p> Datos del usuario: </p> </br> <p> Telefono: ${user.phone} </p> </br> <p> Edad: ${user.age}</p> </br> <p> Email:  ${user.email}</p> </br> <p> Direccion:  ${user.address}</p>`
    }
    
    try {
        const info = await transporter.sendMail(regConfirm_MailOptions)
        console.log(info)
    } catch (error) {
        console.log(error)
    }
}


