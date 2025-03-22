export const API = 'http://localhost:3000'; // Cambiar por la IP de la máquina donde se ejecute el backend

// 📌 Interface de Periodo
export interface Periodo {
    Periodo_ID: number;
    PeriodoNombre: string;
    PeriodoTipo: string;
    Periodo_Inicio: Date;
    Periodo_Fin: Date;
    Periodo_Total_Horas: number;
    Periodo_IsDeleted: boolean;
}

// 📌 Interface de Usuario (sin `UsuarioXPeriodo_ID`)
export interface Usuario {
    Usuario_Cedula: string;
    Usuario_Nombres: string;
    Usuario_Apellidos: string;
    Usuario_Area: string;
    Usuario_Correo: string;
    Usuario_Huella: Blob;
    Usuario_contrasenia: string;
    Usuario_Activo: boolean;
    Usuario_Tipo: string;
    Usuario_IsDeleted: boolean;
}

// 📌 Interface de UsuarioXPeriodo (con `UsuarioXPeriodo_ID`)
export interface UsuarioXPeriodo {
    UsuarioXPeriodo_ID: number;
    Periodo_ID: number;
    Usuario_Cedula: string;
    UsuarioXPeriodo_IsDeleted: boolean;
}

// 📌 Interface de UsuarioXPeriodoDVM (Usado en la tabla para mostrar datos combinados)
export interface UsuarioXPeriodoDVM {
    Usuario_Cedula: string;
    Usuario_Nombres: string;
    Usuario_Apellidos: string;
    Usuario_Correo: string;
    Usuario_Huella: Blob;
    Usuario_Area: string;
    Periodo_ID: number;
    PeriodoNombre: string;
}

// 📌 Interface de Horarios (basado en tu esquema de la base de datos)
export interface Horario {
    Horario_ID: number;
    UsuarioXPeriodo_ID: number;
    Horario_Dia_Lunes?: number | null;
    Horario_Dia_Martes?: number | null;
    Horario_Dia_Miercoles?: number | null;
    Horario_Dia_Jueves?: number | null;
    Horario_Dia_Viernes?: number | null;
    Horario_Modalidad: string;
    Horario_IsDeleted: boolean;
}

/*
export const Parametro_Horario = sequelize.define('Parametro_Horario', {
    Parametro_Horario_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Parametro_Horario_Hora_Entrada: {
        type: DataTypes.TIME,
        allowNull: false
    },
    Parametro_Horario_Hora_Salida: {
        type: DataTypes.TIME,
        allowNull: false
    },
    Parametro_Horario_Tipo: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    Parametro_Horario_IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});
*/

// 📌 Interface de Parametro_Horario
export interface Parametro_Horario {
    Parametro_Horario_ID: number;
    Parametro_Horario_Hora_Entrada: string;
    Parametro_Horario_Hora_Salida: string;
    Parametro_Horario_Tipo: string;
    Parametro_Horario_IsDeleted: boolean;
}