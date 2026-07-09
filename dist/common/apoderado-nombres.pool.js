"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APODERADO_NOMBRES_POOL = void 0;
exports.emailDesdeNombreApoderado = emailDesdeNombreApoderado;
exports.esNombreApoderadoGenerico = esNombreApoderadoGenerico;
exports.esEmailApoderadoGenerico = esEmailApoderadoGenerico;
exports.APODERADO_NOMBRES_POOL = [
    'María Ramos',
    'Marcos Saavedra',
    'Alejandra González',
    'Carlos Díaz',
    'Patricia Mora',
    'Roberto Rojas',
    'Fernanda Castro',
    'Jorge Reyes',
    'Carmen Vargas',
    'Ricardo Ortiz',
    'Claudia Campos',
    'Andrés Ramírez',
    'Verónica Sánchez',
    'Felipe Herrera',
    'Daniela Paredes',
    'Hugo Mendez',
    'Silvia Morales',
    'Eduardo Delgado',
    'Rosa Molina',
    'Pablo Gómez',
    'Lucía Peña',
    'Miguel Medina',
    'Antonia Guerrero',
    'Francisco Cortés',
    'Isabel Navarro',
    'Tomás Iglesias',
    'Gabriela Fuentes',
    'Sebastián Silva',
    'Valentina Torres',
    'Nicolás Fernández',
    'Camila Herrera',
    'Diego Paredes',
    'Javiera Morales',
    'Matías Castro',
    'Constanza López',
    'Benjamín Ruiz',
    'Catalina Vega',
    'Maximiliano Soto',
    'Amanda Riquelme',
    'Leonardo Bravo',
    'Esperanza Contreras',
    'Alonso Sepúlveda',
    'Paloma Araya',
    'Thiago Valdés',
    'Trinidad Espinoza',
    'Samuel Núñez',
    'Josefa Tapia',
    'Bruno Carrasco',
    'Florencia Jara',
    'Cristóbal Muñoz',
    'Maite Salazar',
    'Rafael Orellana',
    'Daniela Pino',
    'Dante Figueroa',
    'Noelia Aravena',
    'Lucas Bustos',
    'Isidora Cáceres',
    'Héctor Villalobos',
    'Paulina Aguilera',
    'René Donoso',
    'Ximena Palma',
    'Óscar Leiva',
    'Sandra Inostroza',
];
function emailDesdeNombreApoderado(nombre, usados) {
    const base = nombre
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .join('.');
    let email = `${base}@gmail.com`;
    let n = 2;
    while (usados.has(email)) {
        email = `${base}${n}@gmail.com`;
        n++;
    }
    usados.add(email);
    return email;
}
function esNombreApoderadoGenerico(nombre) {
    if (!nombre?.trim())
        return true;
    return /^apoderado de /i.test(nombre.trim());
}
function esEmailApoderadoGenerico(email) {
    if (!email?.trim())
        return true;
    const e = email.trim().toLowerCase();
    return /^apoderado\.\d+@reservas\.local$/i.test(e) || /@email\.com$/i.test(e);
}
//# sourceMappingURL=apoderado-nombres.pool.js.map