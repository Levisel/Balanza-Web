export const API = 'http://localhost:3000' //Cambiar por la IP de la máquina donde se ejecute el backend

export interface IUsuario_Interno {
    Interno_Cedula: string;
    Interno_Nombre: string;
    Interno_Apellido: string;
    Interno_Correo: string;
    Interno_Password: string;
    Interno_Tipo: string;
    Interno_Area: string;
    Interno_Telefono: string;
}

