export const API = 'http://localhost:3000' //Cambiar por la IP de la máquina donde se ejecute el backend

//Gestión de Casos
// 📌 Internal User Interface (Can be an Admin, Student, etc)
export interface Internal_User {
    Internal_ID: string;
    Internal_Name: string;
    Internal_LastName: string;
    Internal_Email: string;
    Internal_Password?: string;
    Internal_Type: string;
    Internal_Area: string;
    Internal_Phone: string;
    Internal_Status: string;
    Internal_Picture: string;
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
    User_AcademicInstruction: string;
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
    User_HealthDocuments: File | null;
    User_HealthDocumentsName: string | null;
}
// 📌 Initial_Consultation (Manages all the information of the initial consultation)
export interface Initial_Consultation {
    Init_Code: string;
    Internal_ID: string;
    Init_Status: string; //Controlar internamente el caso
    Init_CaseStatus: string; //Estado en el que llega el caso, no importa si cambia
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
    Init_Type: string; 
    Init_SocialWork: boolean;
    Init_MandatorySW: boolean;
    Init_AlertNote: string;
    User_ID: string;
}


export interface Evidence {
    Evidence_ID: number;
    Internal_ID: string;
    Init_Code: string;
    Evidence_Name: string;
    Evidence_Document_Type: string;
    Evidence_Date: Date;
    Evidence_File: File | null; 
}


// 📌 Initial_Consultation (The activities assigned to the student)
export interface Activity {   
    Activity_ID: number;
    Init_Code: string;
    Internal_ID: string;
    Internal_Name: string;
    Activity_Name: string;
    Activity_Start_Date: Date;
    Activity_Start_Time: string;
    Activity_Location: string;
    Activity_Duration: string;
    Activity_Counterparty: string;
    Activity_Judged: string;
    Activity_Judge_Name: string;
    Activity_Reference_File: string;
    Activity_Status: string;
    Activity_OnTime: boolean;
    Activity_Document: File | null;
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
    Internal_ID: string;           // Cédula de identidad o pasaporte
    Internal_Name: string;         // Nombres del usuario
    Internal_LastName: string;     // Apellidos del usuario
    Internal_Email: string;        // Correo institucional
    Internal_Area: string;         // Área o departamento
    Internal_Phone?: string;       // Teléfono (opcional)
    Internal_Huella?: Blob | null; // Huella digital (opcional)
    Internal_Password?: string;    // Contraseña (opcional)
    Internal_Type: string;         // Tipo de usuario (Ej.: Estudiante, Coordinador, etc.)
    Internal_Status: string;   
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
    Internal_ID: string;
    Internal_Name: string;
    Internal_LastName: string;
    Internal_Email: string;
    Internal_Phone: string | null;
    Internal_Type: string | null;
    Internal_Status: string | null;
    Internal_Huella: Blob;
    Internal_Area: string;
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

export interface SeguimientoSemanal {
    Semana_ID: number;
    Semana_Numero: number;
    Semana_Ini: Date;
    Semana_Fin: Date;
    Semana_Horas: number;
    Semana_Feriado: number;
    Semana_Observacion: string;
    Periodo_ID: number;
}

//------------------------------------------------------------------------------------------------------------------//
//Tabla de Parámetros
export interface Vulnerable_Situation{
    Vulnerable_Situation_Id: number;
    Vulnerable_Situation_Name: string;
    Vulnerable_Situation_Status: boolean;
}


export interface Catastrophic_Illness{
    Catastrophic_Illness_Id: number;
    Catastrophic_Illness_Name: string;
    Catastrophic_Illness_Status: boolean;
}   

export interface Disability{
    Disability_Id: number;
    Disability_Name: string;
    Disability_Status: boolean;
}

export interface Protocols{
    Protocol_Id: number;
    Protocol_Name: string;
    Protocol_Status: boolean;
}

export interface Case_Status{
    Case_Status_Id: number;
    Case_Status_Name: string;
    Case_Status_Status: boolean;
}

export interface Type_Of_Attention{
    Type_Of_Attention_Id: number;
    Type_Of_Attention_Name: string;
    Type_Of_Attention_Status: boolean;
}

export interface Schedule{
    Schedule_Id: number;
    Schedule_Limit: string;
    Schedule_Status: boolean;
}

export interface Profiles{
    Profile_Id: number;
    Profile_Name: string;
    Profile_Status: boolean;
}
