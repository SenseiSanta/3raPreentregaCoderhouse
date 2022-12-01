import { faker } from '@faker-js/faker/locale/es'

export function generarProducto() {
    return{
        name: faker.commerce.product(),
        price : `$${faker.commerce.price()}`,
        img: faker.image.avatar()
    }
}