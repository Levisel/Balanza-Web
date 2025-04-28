# ⚖️ Balanza Web

Aplicación frontend para el sistema Balanza Web, desarrollada con **Vue 3**, **Vite** y **TypeScript**.

---

## 📁 Estructura del Proyecto

```
Balanza-Web/
│
├── node_modules/
├── public/
├── src/
│   ├── ApiRoute.ts
│   ├── App.vue
│   ├── main.ts
│   ├── shims-vue.d.ts
│   ├── useSubjects.ts
│   ├── assets/
│   │   ├── flags.css
│   │   ├── main.css
│   │   └── Font/
│   ├── components/
│   │   ├── CuadriculaHorario.vue
│   │   ├── EditStudentsModal.vue
│   │   ├── SideBar.vue
│   │   ├── ThemeSwitcher.ts
│   │   ├── icons/
│   │   └── layouts/
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   └── auth.ts
│   └── views/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🛠️ Requisitos Previos

- [Node.js](https://nodejs.org/) (recomendado: v18.x o superior)
- [npm](https://www.npmjs.com/) (incluido con Node.js)
- [Visual Studio Code](https://code.visualstudio.com/) (sugerencia)

---

## 📦 Instalación de Dependencias

1. **Abrir una terminal** en la carpeta raíz del proyecto.
2. Ejecutar el siguiente comando para instalar todas las dependencias necesarias (según `package.json`):

    ```sh
    npm install
    ```

    Esto instalará, automaticamente todas las dependencias necesarias del programa, las siguientes dependencias son las principales:
    - `vue`, `@vue/compiler-sfc`
    - `vite`
    - `vue-tsc`
    - `primevue`, `primeicons` (Biblioteca de componentes U.I, usando la versión 4.2.5)
    - `pinia` (Manejo de estados, incluyendo la sesión activa del usuario)
    - `vue-router`
    - `xlsx`, `file-saver` (para exportación/importación de Excel)
    - Otras dependencias utilitarias y de desarrollo

    Si alguna dependencia específica falta, se puede instalar con:

    ```sh
    npm install <nombre-del-paquete>
    ```

---

## 🔗 Configuración de la Ruta del Backend (API)

Es necesario indicar la URL donde se encuentra el backend para que la aplicación funcione correctamente.

1. Abrir el archivo [`src/ApiRoute.ts`](src/ApiRoute.ts).
2. Buscar la línea donde se define la constante `API`:

    ```ts
    export const API = 'http://TU_BACKEND:PUERTO' // <--- Cambia esta URL
    ```

3. Modificar la URL para que apunte al servidor backend correspondiente (por ejemplo, `http://localhost:3000` o la IP de la máquina backend).

---

## 🏃‍♂️ Ejecución del Proyecto

### Modo Desarrollo (con recarga en caliente)

```sh
npm run dev
```
- La terminal mostrará la URL local (por defecto: [http://localhost:5173](http://localhost:5173)).

### 🏗️ Compilación y Minificación para Producción

```sh
npm run build
```
- El resultado se genera en la carpeta `/dist`.

---

## 🧑‍💻 Soporte para TypeScript en `.vue`

- Se utiliza `vue-tsc` para el chequeo de tipos en archivos `.vue`.
---

## ⚙️ Personalización y Configuración

- La configuración de Vite puede personalizarse en [`vite.config.ts`](vite.config.ts).
- Las rutas de la aplicación están definidas en [`src/router/index.ts`](src/router/index.ts).

---

## 📚 Recursos Adicionales Usados

- [Documentación de Vite](https://vite.dev/config/)
- [Documentación de Vue 3](https://vuejs.org/)
- [PrimeVue](https://primevue.org/)

---

