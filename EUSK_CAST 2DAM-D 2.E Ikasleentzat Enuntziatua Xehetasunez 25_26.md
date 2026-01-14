

| 2.ERRONKA Hezkuntza Framework-a |
| :---: |

**Aurkibidea**

[**Kronograma	2**](#kronograma)

[**Erronka adierazpena	2**](#erronka-adierazpena)

[**Alderdi teknikoak	2**](#alderdi-teknikoak)

[Zerbitzaria (ElorServ)	2](#zerbitzaria-\(elorserv\))

[Web-aplikazioa (ElorAdmin)	4](#web-aplikazioa-\(eloradmin\))

[Alderdi bisuala	5](#alderdi-bisuala)

[Mahaigaineko aplikazioa (ElorES)	6](#mahaigaineko-aplikazioa-\(elores\))

[Interactibitatea eta erabiltzailearkin feedback	6](#heading=)

[Erabiltzaileen Profilak	6](#heading=)

[Caso de Uso: CU01-Login	7](#heading=)

[Caso de Uso: CU02-Menu	7](#heading=)

[Caso de Uso: CU03-Consultar Perfil	8](#heading=)

[Caso de Uso: CU04-Consultar Alumnos	8](#heading=)

[Caso de Uso: CU05-Consultar horario	9](#heading=)

[Caso de Uso: CU06-Consulta otros Horarios	10](#heading=)

[Caso de Uso: CU07-Gestionar Reuniones	10](#heading=)

[Detalles técnicos de la implementación	11](#detalles-técnicos-de-la-implementación)

[App mugikorra (ElorMov)	13](#app-mugikorra-\(elormov\))

[Interactividad y feedback con el usuario	13](#interactividad-y-feedback-con-el-usuario)

[Perfiles de usuarios	13](#perfiles-de-usuarios)

[Caso de Uso: CU01-Login	14](#heading=)

[Caso de Uso: CU02-Perfil	15](#caso-de-uso:-cu02-perfil)

[Caso de Uso: CU03-Página principal, Profesor	16](#caso-de-uso:-cu03-página-principal,-profesor)

[Caso de Uso: CU04-Página principal, Alumno	17](#caso-de-uso:-cu04-página-principal,-alumno)

[Caso de Uso: CU05-Consulta Alumnos	17](#caso-de-uso:-cu05-consulta-alumnos)

[Caso de Uso: CU06-Consulta Horarios Profesor	17](#caso-de-uso:-cu06-consulta-horarios-profesor)

[Caso de Uso: CU07-Reuniones, Profesor	18](#caso-de-uso:-cu07-reuniones,-profesor)

[Caso de Uso: CU08-Reuniones, Alumno	20](#caso-de-uso:-cu08-reuniones,-alumno)

[Detalles técnicos de la implementación	21](#detalles-técnicos-de-la-implementación-1)

[Sprints	22](#sprints)

[Sistema informatikoak	23](#sistema-informatikoak)

[MAUI Aplikazioa (ElorMAUI)	24](#maui-aplikazioa-\(elormaui\))

[**Denboralizazioa	25**](#denboralizazioa)

[**Entregagarriak	25**](#entregagarriak)

| Kronograma |  |
| :---- | :---- |
| **Hasiera data:** 2025/01/13 | **Guztira:** 149 ordu |
| **Moduloak (*orduak*)**  | Acceso a datos (4 horas) Programación de servicios y procesos (3 horas) PMDM \+ OPT (5 horas) Desarrollo de interfaces (5 horas) SGE (3 horas) Sistemas informáticos (5 horas) |

| Erronka adierazpena |
| :---- |

| Alderdi teknikoak |
| :---- |

## **Zerbitzaria (ElorServ)** {#zerbitzaria-(elorserv)}

Zerbitzari zentral bat sortu behar da, MySQL datu-base bat izango duena; bai diseinua, bai datuak eman egingo dira.

Zerbitzari honetan Angular-ekin egindako web-aplikazioa (**ElorAdmin**) ostatatuko da, administrazio-interfaze bat izango duena. Web-aplikazio honek datu-baserako sarbide zuzena izango du.

Gainera, zerbitzari honek socket-etan oinarritutako funtzionaltasun bat izango du, sare berean egongo diren ikastetxeko ordenagailu guztiei zerbitzua emateko. Irakasleen ordenagailu horiek mahaigaineko aplikazio bat instalatuta izango dute (**ElorES**).

Halaber, zerbitzari honek mugikorrerako aplikazioari (**ElorMov**) eta MAUI aplikazioari (**ElorMAUI**) zerbitzua emango die **REST web-zerbitzu** baten bidez.

ORM erabiliko da klaseak sortzeko eta behar ditugun datu-baseko datuak kudeatzeko.

Azpimarratu behar da ikastetxeei buruzko informazioa ez dela datu-basean egongo; beraz, datuak JSON bidez kontsultatu beharko dira.

## **Web-aplikazioa (ElorAdmin)** {#web-aplikazioa-(eloradmin)}

ElorAdmin web-aplikazioak **erabiltzaile** eta **bileren** datuen alta/baja/aldaketa egiteko aukera ematen du web administrazioko panel baten bidez.

Aplikazioak ondorengo **erabiltzaile** motak izango ditu:

* **God**: Administratzaile nagusia da. Edozein kudeaketa egiteko baimena du. Ezin du bere burua ezabatu. Beste erabiltzaileek ezingo dute GOD baimena duen erabiltzaile bat ezabatu.  
* **Administratzaileak** (idazkaritzako langileak): Aplikatiboaren administratzaileak dira. Erabiltzaileak sortu, kontsultatu, aldatu eta ezabatu ditzakete eta bilerak kontsultatu.

  God eta administratzaileen *home* orrian ondorengo datuak agertuko dira: ikasle-kopurua, irakasle kopurua eta gaurko eguneko bilera kopurua.

  Oharra: Erabiltzaile bakoitzaren argazkia ez da web-aplikazioaren bidez gehitzen.

* **Irakasleak**: Bere datuak eta ordutegia ikusi dezakete, baita bere bilerak kontsultatu ere. Ikasleen datuak kontsultatu ditzakete eta irizpide ezberdinen arabera bilatu.  
* **Ikasleak**: Bere *home* orrira bakarrik sar daitezke, zeinetan bere datu pertsonalak, ordutegia eta bilerak agertuko zaizkien.

Irakasleen ordutegia honako honen antzekoa izango da:

|  | ASTELEHENA | ASTEARTEA | ASTEAZKENA | OSTEGUNA | OSTIRALA |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1\. ordua | Ikasgaia 1 |  |  | Ikasgaia 1 |  |
| 2\. ordua | Ikasgaia 1 |  | Ikasgaia 2 | Ikasgaia 1 |  |
| 3\. ordua |  | Tutoretza | Ikasgaia 2 | Ikasgaia 1 | Zaintza |
| 4\. ordua | Ikasgaia 2 |  | Zaintza |  | Ikasgaia 3 |
| 5\. ordua | Ikasgaia 2 |  |  |  | Ikasgaia 3 |
| 6\. ordua | Ikasgaia 2 |  |  |  |  |

Ikasleen ordutegia antzekoa izango da, baina logikoki zaintza eta tutoretza barik.

Bilerak Euskadiko edozein ikastetxetan egin daitezke, baina balio lehenetsia Elorrieta \- Erreka Mari izango da. Ikastetxeen informazioa kontsultatzeko OpenDatako Euskadiko Unibertsitatez kanpoko ikastetxeen datuak dituen JSON zerbitzaria erabiliko da. Erabiltzeko prest dagoen JSON fitxategia ematen zaizue, jatorrizkoa ez baitago JSON formatuan eta koordenadak UTM formatuan zehazten baititu Lat/Lon erabili ordez. Hala ere, UTMtik Lat/Lon formatura bihurtzeko irtenbide bat aurkitzea positiboki baloratuko da. Bilera bakoitzeko, datu basikoez gain, ikastetxearen izena eta helbidea erakutsiko dira mapa batean markatuta Mapboxeko APIa erabiliz.

Erabiltzaileen argazkiak *“public”* karpetan gordeko ditugu, \+ '.jpg' erabiltzailearen izenaren izen berarekin. Hori guztia eskuz.

'Pepito' izeneko erabiltzaile bati alta ematen badiogu, erabiltzaile-argazki ezezagun hau lehenetsiko dugu, eta, gero, eskuz, aldatu egingo da.  
![][image1]

### **Alderdi bisuala** {#alderdi-bisuala}

Web-aplikazioak itxura profesionala izan behar du eta horretarako CSS framework bat eta ikono-liburutegi bat erabiliko dira, itxura homogeneoa izaten laguntzeko.

Ikastetxearen logotipoa erabiliko da eta ikastetxearen koloreak eta identitate bisuala hartuko dira kontuan atalak edo eta izenburuak sortzean.

Web-interfazeak ondorengo bete behar du:

* Erantzungarria izatea eta pantaila txikietan (formatu mugikorrean) behar bezala funtzionatzen duela bermatzea *{ responsive }*.

* Webgunearen goiburuan Elorrieta-ErrekaMariren logotipoa agertzea. Logotipoa sakatzean, logeatuta badago dagokion erabiltzailearen *home*\-ra eramango du. Logeatuta ez badago login orrira eramango du eta hori izango da lehenetsitako orria erabiltzailea logeatuta ez dagoenean.

* Nazioartekotzeko eskakizunak **(i18n)** betetzea eta euskaraz eta gaztelaniaz ikusi ahal izatea.

## **Mahaigaineko aplikazioa (ElorES)** {#mahaigaineko-aplikazioa-(elores)}

**Mahaigaineko aplikaziorako (ElorES)**, baldintza hauek definitzen dira.

### **Interactibitatea eta erabiltzailearkin feedback**

**Mahaigaineko app-ak** Elorrieta-Errekamari LHIKren kolore korporatiboak, ikonoak, logoak eta abar erabiliko ditu. Ebazpen guztietan, etab.

### **Erabiltzaileen Profilak**

**Mahaigaineko apparekin** lan egiteko gai den erabiltzaile-profil bakarra dago. Profil horren arabera, hainbat aukera eskainiko dira:

- **Irakaslearen profila:**  
  - Ikasleei eta beren buruari buruzko informazioa kontsultatzea.  
  - Bere ordutegia eta beste irakasleena kontsultatzea.  
  - Bilerak kontsultatu, sortu, onartu edo bertan behera utzi.

### **Caso de Uso: CU01-Login** 

**Actor**: Profesor

**Precondiciones**: No

**Flujo**: 

Se muestra el **logo** de CIFP Elorrieta-Errekamari LHII y el de la empresa del grupo. El usuario dispondrá de dos campos para introducir el login y el password. Se comprobará contra la base de datos remota (ORM **ElorBase**) que las credenciales son correctas. Si lo son, se accede a la **app** **de escritorio**.

**Postcondiciones**:

- El usuario queda autenticado y accede a la página principal de la aplicación


### **Caso de Uso: CU02-Menu**

**Actor**: Profesor

**Precondiciones**: Usuario logueado

**Flujo**: 

Se muestra la ventana principal de la **app** **de escritorio**.

Se le ofrece al profesor las siguientes opciones:

- Consultar su perfil  
- Consultar sus alumnos  
- Consultar horario   
- Consultar otros horarios  
- Gestionar reuniones   
- Salir (del programa)

**Postcondiciones**:

- El Profesor escoge la opción que prefiera y ésta se ejecuta. 

### **Caso de Uso: CU03-Consultar Perfil**

**Actor**: Profesor

**Precondiciones**: Usuario logueado

**Flujo**: 

Se muestra la información relevante al perfil del profesor, lo que incluye la foto del perfil, caso de que exista en la base de datos remota (ORM **ElorBase**).

**Postcondiciones**:

- El Profesor consulta su perfil, y vuelve a la página principal.

 

### **Caso de Uso: CU04-Consultar Alumnos**

**Actor**: Profesor

**Precondiciones**: Usuario logueado

**Flujo**: 

Un Profesor puede consultar la información relevante de sus alumnos. Se mostrará un listado con todos los alumnos, que se podrán filtrar por ciclo y curso. Al seleccionar un Alumno se podrá ver su nombre, sus apellidos y su foto.

**Postcondiciones**:

- El Profesor consulta el perfil del alumno, y vuelve a la página principal.

### **Caso de Uso: CU05-Consultar horario**

**Actor**: Profesor

**Precondiciones**: Usuario logueado

**Flujo**: 

Se mostrará el horario del Profesor. Se supone que el profesor tiene el mismo horario semanal durante todo el año. Dicho horario se divide en cinco días y 6 horas lectivas. En cada hora, puede haber una clase, una tutoría o una guardia (o nada). Si se trata de una clase, se mostrará curso, ciclo y el módulo correspondiente. La información referente al horario se obtiene de la base de datos remota (ORM **ElorBase**).

Nótese que se muestran también las reuniones. 

A modo de ejemplo: 

|  | LUNES | MARTES | MIERCOLES | JUEVES | VIERNES |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Hora 1 | Asignatura 1 | Reunión 2 |  | Asignatura 1 |  |
| Hora 2 | Asignatura 1 |  | Asignatura 2 | Asignatura 1 | Reunión 4 |
| Hora 3 |  | Tutoría | Asignatura 2 | Asignatura 1 | Guardia |
| Hora 4 | Asignatura 2 |  | Guardia |  | Asignatura 3 |
| Hora 5 | Asignatura 2 |  | Reunión 3 |  | Asignatura 3 |
| Hora 6 | As2 / Reunión1 |  |  |  |  |

Código de colores:

* Gris: Conflicto

* Verde: Aceptado

* Rojo: Cancelado

* Amarillo/Naranja: Pendiente

**Postcondiciones**:

- El usuario consulta el horario y permanece en la página 

### **Caso de Uso: CU06-Consulta otros Horarios**

**Actor**: Profesor

**Precondiciones**: Usuario logueado

**Flujo**: 

Un Profesor puede consultar el horario de cualquier profesor, independientemente de su curso, etc., tal y como se muestra en el **Caso de Uso: CU05-Consultar horario**. Dispondrá de un filtro por nombre y apellidos. 

**Postcondiciones**:

- El Alumno consulta los horarios y retorna a la página principal 

### **Caso de Uso: CU07-Gestionar Reuniones**

**Actor**: Profesor

**Precondiciones**: Usuario logueado

**Flujo**: 

Un Profesor puede crear reuniones nuevas. El Alumno convocado a la reunión y el Profesor reciben la notificación a través de correo electrónico. Una vez creada la reunión, aparecerá inmediatamente en el horario de todos los implicados. Las nuevas reuniones siempre aparecen marcadas como Pendiente para todo el mundo, a menos que coincida con otra asignatura, reunión, tutoría, etc. en cuyo caso a esa persona en concreto le aparecerá como Conflicto. 

La información necesaria a suministrar para generar una reunión es la siguiente:

* Estado: Que puede ser Pendiente, Conflicto, Aceptada o Cancelada.  
* Título: El propósito de la reunión.  
* Tema: Breve descripción de los asuntos a tratar.  
* Día y hora.  
* Aula.  
* Ubicación: Las reuniones pueden realizarse en cualquier centro educativo del País Vasco, pero el valor predeterminado será CIFP Elorrieta-Errekamari LHII. La información de los centros se encuentra en un fichero **EuskadiLatLon.json** (ver **ElorAdmin**).   
* Miembros de la reunión: Profesor y Estudiante.

Obviamente, se debe poder consultar la información de una reunión del horario. Al consultar una reunión, nos mostrará toda la información de la misma. 

Un Profesor puede cambiar el estado de la reunión, Aceptándolas o Cancelándolas. Esto implica un envío de un correo electrónico informativo a todas las partes.

### **Detalles técnicos de la implementación** {#detalles-técnicos-de-la-implementación}

Es imprescindible considerar los siguientes aspectos técnicos:

- **Comunicación**: La comunicación contra la base de datos remota (Servidor **ElorBase**) se realizará mediante Sockets TCP.   
    
- **Mensajes**: Los mensajes enviados y recibidos por TCP son JSON. Otros diseños son posibles (aprobación del profesor).  
    
- **Seguridad**: Como mínimo, el password del usuario se pasará al servidor cifrado mediante Clave Pública. Nunca debe de viajar en claro por la red. Los requisitos adicionales (generación del par de claves, etc.) DEBEN incluirse en el propio código del proyecto.   
    
- **Mail**: Toda referencia a ‘se envía un correo’ o similar hace referencia a una actividad exclusiva del Servidor **ElorServ**.   
    
- **Persistencia**: Toda la información relevante debe estar almacenada en la base de datos remota (ORM **ElorBase**), a excepción de las indicadas explícitamente en el texto.

- 

## 

## **App mugikorra (ElorMov)** {#app-mugikorra-(elormov)}

Para el **cliente móvil** se definen los siguientes requisitos. 

Toda conexión con la BBDD se realiza a través de consultas a la API y devolucion de JSON.

### **Interactividad y feedback con el usuario** {#interactividad-y-feedback-con-el-usuario}

La aplicación debe ser **multilingüe**. El idioma predeterminado será el castellano. El usuario tendrá la opción de establecer el idioma que prefiera dentro de la configuracion de su perfil. Esta configuración deberá guardarse en el propio dispositivo móvil. El **cliente móvil** se presentará en el idioma seleccionado por el usuario (de conocerse) o por el idioma por defecto.

Se diseñarán por completo dos **temas** diferentes. El tema predeterminado será el Claro. El usuario tendrá la opción de establecer el que prefiera dentro de su perfil. Esta configuración deberá guardarse en el propio dispositivo móvil. El **cliente móvil** se presentará en el tema seleccionado por el usuario (de conocerse) o por el tema por defecto.

La aplicación, pensada para móvil y tabletas, deben de operar con **el mínimo** de interacciones necesarias por parte del usuario. 

Se dispondrá de un ‘Remember me’ para facilitar el acceso a la app. Se recordará automáticamente al último usuario logueado con éxito: no será necesario un checkbox que habilite o deshabilite la opción.

### **Perfiles de usuarios** {#perfiles-de-usuarios}

Existen dos perfiles de usuarios diferentes capaces de operar con la **app móvil**. Según el perfil, se ofrecerán diferentes opciones:

- **Perfil Profesor:**   
  - Consultar información sobre sus estudiantes y sobre sí mismo.   
  - Consultar su propio horario.  
  - Consultar, crear, aceptar o cancelar reuniones.  
      
- **Perfil Alumnos**   
  - Consultar información sobre sí mismo.  
  - Consultar sus propios horarios y los horarios de los profesores.  
  - Consultar y solicitar reuniones.

**Indice casos de uso:**

Profesor:

- CU1- Login  
- CU2- Perfil  
- CU3- Horario  
- CU5- Consulta de alumnos  
- CU7- Reuniones

Alumno:

- CU1- Login  
- CU2- Perfil  
- CU4- Horario  
- CU6- Consulta horario profesor  
- CU8- Reuniones

### **Caso de Uso: CU01-Login** 

**Actor**: Profesor, Alumno

**Precondiciones**: No

**Flujo**: 

Se muestra el **logo animado** de CIFP Elorrieta-Errekamari LHII y el de la empresa del grupo. El usuario dispondrá de dos campos para introducir el login y el password. Se comprobará que las credenciales son correctas con tra la base remota (ORM **ElorBase**) . Si lo son, se accede al **cliente móvil**.

**Postcondiciones**:

- El usuario queda autenticado y accede a la página principal de la aplicación según su perfil.

 

### **Caso de Uso: CU02-Perfil** {#caso-de-uso:-cu02-perfil}

**Actor**: Profesor, Alumno

**Precondiciones**: Usuario logueado

**Flujo**: 

Aunque los usuarios no pueden registrarse libremente desde la **app móvil,** si pueden consultar la información de su perfil. Adicionalmente, podrán subir una foto tomada directamente desde el dispositivo móvil a su perfil. Esta información, se almacenaria en el servidor y  en la base de datos remota (ORM **ElorBase**) junto al resto del perfil.

Nótese que la información mostrada dependerá de si el usuario es un Profesor o un Alumno. Por ejemplo, de un Alumno se mostrará el ciclo que están cursando, el curso, si están en modalidad DUAL, etc.

El alumno y el profesor podrá cambiar el tema y el idioma desde aquí.

**Postcondiciones**:

- El usuario consulta su perfil y regresa a la página principal de la aplicación

### **Caso de Uso: CU03-Página principal, Profesor** {#caso-de-uso:-cu03-página-principal,-profesor}

**Actor**: Profesor

**Precondiciones**: Usuario logueado

**Flujo**: 

Se mostrará el horario del Profesor. Se supone que el profesor tiene el mismo horario semanal durante todo el año. Dicho horario se divide en cinco días y 6 horas lectivas. En cada hora, puede haber una clase, una tutoría o una guardia (o nada). Si se trata de una clase, se mostrará curso, ciclo y el módulo correspondiente. La información referente al horario se obtiene de la base de datos remota (ORM **ElorBase**).

A modo de ejemplo: 

|  | LUNES | MARTES | MIERCOLES | JUEVES | VIERNES |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Hora 1 | Asignatura 1 |  |  | Asignatura 1 |  |
| Hora 2 | Asignatura 1 |  | Asignatura 2 | Asignatura 1 |  |
| Hora 3 |  | Tutoría | Asignatura 2 | Asignatura 1 | Guardia |
| Hora 4 | Asignatura 2 |  | Guardia |  | Asignatura 3 |
| Hora 5 | Asignatura 2 |  |  |  | Asignatura 3 |
| Hora 6 | Asignatura 2 |  |  |  |  |

**Postcondiciones**:

- El usuario consulta el horario y permanece en la página 

### **Caso de Uso: CU04-Página principal, Alumno** {#caso-de-uso:-cu04-página-principal,-alumno}

**Actor**: Alumno

**Precondiciones**: Usuario logueado

**Flujo**: 

Se mostrará el horario del Alumno. El horario será similar al de los profesores, pero sin tutorías ni guardias. Los horarios de los estudiantes NO están almacenados en la base de datos remota (Servidor **ElorBase**), sino que se crearán dinámicamente a partir del grupo al que pertenece dicho alumno. 

**Postcondiciones**:

- El usuario consulta el horario y permanece en la página 

### **Caso de Uso: CU05-Consulta Alumnos** {#caso-de-uso:-cu05-consulta-alumnos}

**Actor**: Profesor

**Precondiciones**: Usuario logueado

**Flujo**: 

Un Profesor puede consultar la información relevante de sus alumnos. Se mostrará un listado con todos los alumnos, que se podrán filtrar por ciclo y curso. Al seleccionar un Alumno se podrá ver su nombre, sus apellidos y su foto (subida de antemano al servidor y guardad la url en la BBDD).

**Postcondiciones**:

- El Profesor consulta sus Alumnos y retorna a la página principal 

### **Caso de Uso: CU06-Consulta Horarios Profesor** {#caso-de-uso:-cu06-consulta-horarios-profesor}

**Actor**: Alumno

**Precondiciones**: Usuario logueado

**Flujo**: 

Un Alumno puede consultar el horario de cualquier profesor, independientemente de si le da clase o no, se listaran todos los profesores y al seleccionar uno se mostrara el detalle de su horario, tal y como se muestra en el **Caso de Uso: CU03-Página Principal, Profesor**. Dispondrá de un filtro por nombre y apellidos. 

**Postcondiciones**:

- El Alumno consulta los horarios y retorna a la página principal 

### **Caso de Uso: CU07-Reuniones, Profesor** {#caso-de-uso:-cu07-reuniones,-profesor}

**Actor**: Profesor

**Precondiciones**: Usuario logueado

**Flujo**: 

Un Profesor consulta la información relevante a las reuniones. Dicha información aparecerá en el horario del profesor mencionado en el **Caso de Uso: CU03-Página principal, Profesor**.

A modo de ejemplo: 

|  | LUNES | MARTES | MIERCOLES | JUEVES | VIERNES |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Hora 1 | Asignatura 1 | Reunión 2 |  | Asignatura 1 |  |
| Hora 2 | Asignatura 1 |  | Asignatura 2 | Asignatura 1 | Reunión 4 |
| Hora 3 |  | Tutoría | Asignatura 2 | Asignatura 1 | Guardia |
| Hora 4 | Asignatura 2 |  | Guardia |  | Asignatura 3 |
| Hora 5 | Asignatura 2 |  | Reunión 3 |  | Asignatura 3 |
| Hora 6 | As2 / Reunión1 |  |  |  |  |

Código de colores:

* Gris: Conflicto  
* Verde: Aceptado  
* Rojo: Cancelado  
* Amarillo/Naranja: Pendiente

Un Profesor puede crear reuniones nuevas.

Una vez creada la reunión, aparecerá inmediatamente en el horario de todos los implicados. Las nuevas reuniones siempre aparecen marcadas como Pendiente para todo el mundo, a menos que coincida con otra asignatura, reunión, tutoría, etc. en cuyo caso a esa persona en concreto le aparecerá como Conflicto. 

El diseño exacto del sistema de colores, etc. del horario es cosa vuestra.

La información necesaria a suministrar para generar una reunión es la siguiente:

* Título: El propósito de la reunión.  
* Asunto: Breve descripción de los asuntos a tratar.  
* Día y hora.  
* Aula.  
* Ubicación: Las reuniones pueden realizarse en cualquier centro educativo del País Vasco, pero el valor predeterminado será CIFP Elorrieta-Errekamari LHII.  
* Miembros de la reunión: Profesor y Estudiante.

* Internamente: Estado: Que puede ser Pendiente, Conflicto, Aceptada o Cancelada.

Obviamente, se debe poder consultar la información de una reunión del horario. Al consultar una reunión, nos mostrará toda la información de la misma y la ubicación de la reunión en un mapa con un pin. 

Adicionalmente, el Profesor podrá acceder a la información del alumno con el que se reúne, tal y como se muestra en el **Caso de Uso: CU05-Consulta Alumnos**. 

Un Profesor puede cambiar el estado de la reunión, Aceptándolas o Cancelándolas. 

Aclaraciones: 

* Se sobreentiende que, una vez convocada una reunión, quienes formen parte de la misma usarán el correo electrónico para ponerse de acuerdo, cambiar la hora etc. Esto es ajeno al sistema.

* Se da por supuesto que, si el profesor Acepta una reunión, es porque puede asistir, independientemente de lo que diga el horario y el resto de los alumnos. 

* Lo mismo ocurre si las Cancela. 

* Opcionalmente, se puede añadir un estado adicional Borrada a las reuniones para que no aparezca en los horarios.  

**Postcondiciones**:

- El Profesor gestiona las reuniones y retorna a la página principal 

### **Caso de Uso: CU08-Reuniones, Alumno** {#caso-de-uso:-cu08-reuniones,-alumno}

**Actor**: Alumno

**Precondiciones**: Usuario logueado

**Flujo**: 

Este caso es idéntico en lógica y funcionamiento al **Caso de Uso: CU07-Reuniones, Profesor** en los siguientes aspectos: 

* Ven las reuniones en los horarios de la misma forma.

* Pueden consultar la información de las reuniones.

* Pueden crear nuevas reuniones con un profesor. 

No obstante, es diferente en los siguientes aspectos:

* Un Alumno NO cambiar el estado de la reunión.

**Postcondiciones**:

- El Profesor gestiona las reuniones y retorna a la página principal

### **Detalles técnicos de la implementación** {#detalles-técnicos-de-la-implementación-1}

Es imprescindible considerar los siguientes aspectos técnicos:

- **Comunicación**: La comunicación contra la base de datos remota (ORM **ElorBase**) se realizará mediante Retrofit (Api REST). 


- La navegación entre las distintas actividades/Fragments se realizara mediante **Navigation Component** y grafo de navegacion.

- El paso entre las diferentes vistas de la aplicación se realizara mediante **Safe Args**.

- Se usara la inyección de dependencias mediante **Dagger Hilt**.

- **Seguridad**: Como mínimo, el password del usuario se pasará al servidor cifrado mediante Clave Pública. Nunca debe de viajar en claro por la red. Los requisitos adicionales (generación del par de claves, etc.) DEBEN incluirse en el propio código del proyecto. 

- **Persistencia**: Toda la información relevante debe estar almacenada en la base de datos remota (ORM **ElorBase**), a excepción de las indicadas explícitamente en el texto.

### **Sprints** {#sprints}

En las siguientes fechas se pasaran las rubricas asociadas a los casos de usos nombrados a continuación.

Sprint 1 – Por asignaturas:

- PMDM \+ OPT: CU01 a CU05 (**Fecha límite: 26/01/26**)

Sprint 2 – Por asignaturas:

- PMDM \+ OPT: Funcionalidad completa (**Fecha límite: 5/02/26**)

## 

## 

## **Sistema informatikoak** {#sistema-informatikoak}

Proiektuaren arrakasta ez da soilik aplikazioen garapenean oinarritzen; azpiegitura sendo eta segmentatua behar da. Sare-segmentazioa funtsezkoa da trafikoa isolatzeko, errendimendua hobetzeko eta segurtasun-arriskuak murrizteko. Horregatik, honako konfigurazio-lanak egin beharko dira:

* Bi VLAN sortzea:  
  * VLAN bat zerbitzarientzat. (10 zerbitzari)  
  * VLAN bat erabiltzaileentzat. (50 erabiltzaile)

* VLAN bakoitzari IP helbideak esleitzeko, sare nagusi bat bi azpisaretan bihurtu beharko da, VLAN bakoitzaren ekipuen kopurua kontuan hartuta.

* Datu-basearen zerbitzaria VLAN zerbitzarietan kokatu beharko da, eta aplikazioek sarearen bidez konektatu beharko dute datu-base horretara.

* Babeskopia-sistema ezarri beharko da, datu-basearen segurtasuna bermatzeko eta berreskurapen-plana barne hartzeko.

## 

## **MAUI Aplikazioa (ElorMAUI)** {#maui-aplikazioa-(elormaui)}

Ikastetxeak beste aplikazio bat behar du komunitatearen barruko ikastetxeak mapa batean kokatu eta ikusi ahal izateko.

Horretarako, **MAUI** aplikazio bat garatu behar duzue, **ElorMAUI** izenekoa, ikastetxeak kontsultatzeko. Ikastetxe hauek JSON batetik lortuko ditugu ***EuskadiLatLon.json***.

Lehenik eta behin login egin beharko da REST zerbitzu baten bitartez, aplikazioa soilik zentruko erabiltzaileak erabili ahal izateko.

Aplikazioak hautatzaile kateatuak *{selectores encadenados}* izango ditu DTITUCerako (zentro-mota), DTERRErako (lurraldea-ikastetxe-motaren barruan) eta DMUNICerako (udalerria-lurraldearen barruan), balio desberdinak erakutsiz eta egindako hautaketaren arabera ordenatuta. Horretarako, **LINQ** erabiliko dugu.

Iragazitako zentroak taula batean bistaratuko dira, emaitzen guztizko kopurua adieraziz eta esteka edo botoi baten bidez xehetasun-osagai batera *{ componente detalle }* sartzeko aukera emanez.

Xehetasunezko ikuspegian, zentroaren datuak erakutsiko dira, markatzailea duen mapa bat, eta, sakatzean, zentroaren gainerako informazioa, zentroaren eremuko egungo tenperatura eta datozen egunetako eguraldiaren aurreikuspena erakutsiko ditu.

Alderdi bisuala, responsive egokitzapena, dokumentazio egokia eta bestelako edozein ekarpen baloratuko dira.

| Denboralizazioa |
| :---- |

## 

| Entregagarriak |
| :---- |

* Zerbitzaria  
* Mahaigaineko aplikazioa  
* App mugikorra  
* Web aplikazioa

[image1]: <data:image/png;base64,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>