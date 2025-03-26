export const API = 'http://localhost:3000' //Cambiar por la IP de la máquina donde se ejecute el backend

//Gestión de Casos
// 📌 Internal User Interface (Can be an Admin, Student, etc)
export interface Internal_User {
    Internal_ID: string;
    Internal_Name: string;
    Internal_LastName: string;
    Internal_Email: string;
    Internal_Password: string;
    Internal_Type: string;
    Internal_Area: string;
    Internal_Phone: string;
    Interal_Huella: Blob;
    Internal_Status: string;
}
// 📌 Internal User (The external user that requires the consultation service)
export interface User {
    //DATOS PERSONALES
    User_ID: string;
    User_ID_Type: string;
    User_Age: number;
    User_FirstName: string;
    User_LastName: string;
    User_Gender: string;
    User_BirthDate: Date;
    User_Nationality: string;
    User_Ethnicity: string;
    User_Province: string;
    User_City: string;

    //CONTACTO
    User_Phone: string;
    User_Email: string;
    User_Address: string;
    User_Sector: string;
    User_Zone: string;
    User_ReferenceRelationship: string;
    User_ReferenceName: string;
    User_ReferencePhone: string;

    //DATOS DEMOGRÁFICOS
    User_SocialBenefit: boolean;
    User_EconomicDependence: boolean;
    User_Academic_Instruction: string;
    User_Profession: string;
    User_MaritalStatus: string;
    User_Dependents: number;
    User_IncomeLevel: string;
    User_FamilyIncome: string;
    User_FamilyGroup: string;
    User_EconomicActivePeople: number;

    //DATOS SOCIOECONÓMICOS Y DE SALUD
    User_OwnAssets: string;
    User_HousingType: string;
    User_Pensioner: string;
    User_HealthInsurance: string;
    User_VulnerableSituation: string;
    User_SupportingDocuments: string;
    User_Disability: string;
    User_DisabilityPercentage: number;
    User_CatastrophicIllness: string;
    User_HealthDocuments: Blob;
}
// 📌 Initial_Consultation (Manages all the information of the initial consultation)
export interface Initial_Consultation {
    Init_Code: string;
    Internal_ID: string;
    Init_Status: boolean;
    Init_Office: string;
    Init_Date: Date;
    Init_EndDate: Date;
    Init_ClientType: string;
    Init_Subject: string;
    Init_Topic: string;
    Init_Service: string; //Tipo de atención
    Init_Complexity: string; //Baja, Media, Alta
    Init_Lawyer: string;
    Init_Referral: string;
    Init_Notes: string;
    Init_Type: string; //Nuevo o Asignado
    Init_SocialWork: boolean;
    User_ID: string;
}
// 📌 Initial_Consultation (The activities assigned to the student)
export interface Activity {
    Activity_ID: string;
    Init_Code: string;
    Internal_ID: string;
    Last_Activity: string;
    Activity_Date: Date;
    Activity_Type: string;
    Location: string;
    Time: string;
    Duration: string;
    Counterparty: string;
    Judge_Name: string;
    Reference_File: string;
    Status: string;
    Documents: Blob;
}

//------------------------------------------------------------------------------------------------------------------//
//Control de Ingreso
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
    Usuario_Huella: Blob | undefined;
    Usuario_contrasenia?: string; //campo opcional
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

// 📌 Interface de Parametro_Horario
export interface Parametro_Horario {
    Parametro_Horario_ID: number;
    Parametro_Horario_Hora_Entrada: string;
    Parametro_Horario_Hora_Salida: string;
    Parametro_Horario_Tipo: string;
    Parametro_Horario_IsDeleted: boolean;
}