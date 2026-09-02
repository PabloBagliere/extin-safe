# Plan Integral de Extin Safe

## 1. Resumen Ejecutivo

**Extin Safe** sera una plataforma web para informar, registrar, ubicar y controlar extintores. Su objetivo es conectar establecimientos con las empresas que realizan su mantenimiento, centralizando el inventario, los vencimientos, la ubicacion fisica y el historial de intervenciones.

La primera version se enfocara en Argentina, en idioma espanol, y se desplegara sobre Cloudflare Workers. El sistema tendra una parte publica educativa y una parte privada con dos tipos principales de cuenta:

- Cliente o establecimiento.
- Empresa de mantenimiento.

La aplicacion permitira saber en todo momento cuantos extintores existen, donde estan, si se encuentran en regla, cuales necesitan revision y que trabajos se realizaron sobre cada uno.

## 2. Objetivos del Producto

### Objetivo principal

Reducir la perdida de control sobre los extintores mediante una fuente unica, accesible y actualizada de informacion operativa y de mantenimiento.

### Objetivos especificos

- Dar a los establecimientos visibilidad sobre el estado de todos sus extintores.
- Permitir a las empresas de mantenimiento organizar clientes, establecimientos y proximos controles.
- Asociar cada extintor con una ubicacion concreta dentro de un plano.
- Mantener una trazabilidad permanente de controles, recargas y reparaciones.
- Alertar antes de los vencimientos mediante dashboard y correo electronico.
- Ofrecer contenido publico claro sobre prevencion, tipos de fuego y uso responsable de extintores.

### Indicadores de exito iniciales

- Un usuario cliente puede registrar un establecimiento y su primer extintor sin ayuda externa.
- Un usuario puede identificar un extintor vencido desde el dashboard en menos de un minuto.
- Una empresa puede consultar los proximos controles de sus clientes desde una sola pantalla.
- Cada mantenimiento registrado actualiza el historial y la proxima fecha de control de forma consistente.
- Un establecimiento puede ubicar cada extintor sobre un plano y consultar su detalle desde el marcador.

## 3. Decisiones Confirmadas

| Tema                    | Decision                                                             |
| ----------------------- | -------------------------------------------------------------------- |
| Pais inicial            | Argentina                                                            |
| Idioma inicial          | Espanol rioplatense                                                  |
| Vinculo cliente-empresa | Ambas partes pueden iniciarlo; requiere aceptacion de la contraparte |
| Alertas iniciales       | Recordatorios automaticos por correo electronico                     |
| Runtime                 | Cloudflare Workers                                                   |
| Base de datos           | Cloudflare D1                                                        |
| Archivos                | Cloudflare R2                                                        |
| Aplicacion actual       | TanStack Start, React, Tailwind, Drizzle, Better Auth, oRPC y Zod    |

## 4. Alcance de la Primera Version

La primera version incluye los modulos definidos en este documento. La prioridad es contar con una plataforma operativa y segura para gestionar extintores, no con un sistema de facturacion ni una herramienta de certificacion oficial.

### Incluido

- Sitio publico educativo.
- Registro, inicio y cierre de sesion.
- Cuentas de cliente y de empresa de mantenimiento.
- Establecimientos y su informacion basica.
- Gestion completa de extintores.
- Estados de cumplimiento y proximos vencimientos.
- Dashboard para clientes y empresas.
- Carga de planos y marcadores de extintores.
- Historial de controles, recargas y reparaciones.
- Vinculo e invitaciones entre clientes y empresas.
- Recordatorios por correo electronico.
- Auditoria basica de acciones relevantes.

### Excluido inicialmente

- Facturacion, cobros y suscripciones.
- Generacion de certificados oficiales o documentos firmados digitalmente.
- Integracion con WhatsApp.
- Aplicacion movil nativa.
- Lectura de QR o codigos de barras desde camara.
- Importacion masiva desde Excel.
- Integraciones con ERPs o sistemas externos.
- Gestion de matafuegos de terceros sin un establecimiento asociado.

Estas capacidades se podran incorporar en una segunda etapa sin alterar el nucleo de datos propuesto.

## 5. Usuarios y Organizaciones

### 5.1 Tipos de organizacion

El sistema modelara organizaciones, no solamente usuarios individuales. Esto permite que varias personas trabajen para un mismo cliente o para una misma empresa de mantenimiento.

| Tipo                     | Descripcion                                                                   |
| ------------------------ | ----------------------------------------------------------------------------- |
| Cliente                  | Empresa, comercio, institucion o titular de uno o mas establecimientos.       |
| Empresa de mantenimiento | Empresa que realiza controles, recargas, reparaciones u otras intervenciones. |

Cada cuenta que se registre debera crear o unirse a una organizacion. Un usuario podra pertenecer a mas de una organizacion si su caso de uso lo requiere, pero sus permisos siempre dependeran de la organizacion activa.

### 5.2 Roles internos

Aunque el producto presenta dos tipos de cuenta, se necesitan permisos internos para no otorgar acceso total a todos los integrantes.

| Rol                      | Organizacion | Capacidades principales                                                             |
| ------------------------ | ------------ | ----------------------------------------------------------------------------------- |
| Administrador de cliente | Cliente      | Administra establecimientos, extintores, planos, integrantes y empresas vinculadas. |
| Operador de cliente      | Cliente      | Consulta y actualiza la informacion habilitada de su organizacion.                  |
| Administrador de empresa | Empresa      | Gestiona clientes, establecimientos autorizados, tecnicos y mantenimientos.         |
| Tecnico                  | Empresa      | Consulta establecimientos autorizados y registra mantenimientos.                    |

La interfaz inicial puede mostrar solo los perfiles necesarios, pero el modelo debe admitir estos cuatro roles desde el comienzo para evitar migraciones de permisos posteriores.

### 5.3 Matriz de permisos

| Accion                  | Cliente administrador | Cliente operador | Empresa administradora | Tecnico               |
| ----------------------- | --------------------- | ---------------- | ---------------------- | --------------------- |
| Crear establecimiento   | Si                    | Segun permiso    | No                     | No                    |
| Editar establecimiento  | Si                    | Segun permiso    | No                     | No                    |
| Crear o editar extintor | Si                    | Segun permiso    | No directamente        | No directamente       |
| Archivar extintor       | Si                    | No               | No                     | No                    |
| Ver plano               | Si                    | Si               | Si, si esta vinculada  | Si, si esta vinculada |
| Editar marcador         | Si                    | Segun permiso    | No                     | No                    |
| Ver historial           | Si                    | Si               | Si, si esta vinculada  | Si, si esta vinculada |
| Registrar mantenimiento | No                    | No               | Si                     | Si                    |
| Invitar empresa         | Si                    | No               | Si                     | No                    |
| Aceptar vinculo         | Si                    | No               | Si                     | No                    |

Todo permiso debe verificarse en operaciones del servidor. Ocultar un boton en la interfaz no es una medida de seguridad suficiente.

## 6. Flujos Principales

### 6.1 Alta de cliente y establecimiento

1. El usuario crea una cuenta con correo y contrasena.
2. Selecciona que representa a un cliente o establecimiento.
3. Crea su organizacion cliente.
4. Registra el primer establecimiento con datos de contacto y direccion.
5. Carga sus extintores o invita a su empresa de mantenimiento.
6. El dashboard muestra el estado inicial del inventario.

### 6.2 Alta de empresa de mantenimiento

1. El usuario crea una cuenta con correo y contrasena.
2. Selecciona que representa a una empresa de mantenimiento.
3. Completa los datos de su empresa.
4. Invita a un cliente por correo o espera una invitacion de un cliente.
5. Al aceptarse el vinculo, puede consultar los establecimientos autorizados.
6. Registra mantenimientos y controla proximos vencimientos.

### 6.3 Vinculacion cliente-empresa

El vinculo puede iniciarlo cualquiera de las dos partes.

1. La parte iniciadora selecciona una organizacion existente o ingresa el correo de contacto.
2. Se crea una invitacion con estado pendiente.
3. La contraparte recibe un correo y una notificacion dentro de la aplicacion.
4. La contraparte acepta o rechaza la invitacion.
5. Al aceptar, se habilita la relacion y se puede asignar la empresa a establecimientos concretos.
6. Un establecimiento conserva la fecha de inicio y finalizacion de cada asignacion para mantener trazabilidad.

### 6.4 Registro de un extintor

1. El cliente selecciona un establecimiento.
2. Completa codigo, tipo, capacidad, marca, numero de serie, ubicacion y fechas.
3. Puede adjuntar una foto.
4. El sistema valida los datos y calcula el estado de cumplimiento.
5. El extintor queda disponible en listado, dashboard, historial y plano.

### 6.5 Registro de mantenimiento

1. Un usuario autorizado de la empresa selecciona un extintor visible para su organizacion.
2. Elige tipo de intervencion: control, recarga, reparacion, instalacion, reemplazo o baja.
3. Registra fecha, observaciones, estado operativo y proxima fecha de control.
4. El sistema crea un evento inmutable en el historial.
5. El sistema actualiza el resumen actual del extintor en la misma transaccion.
6. El dashboard y los recordatorios reflejan la nueva fecha de inmediato.

### 6.6 Ubicacion en plano

1. El cliente carga la imagen de un plano para un establecimiento.
2. Selecciona un extintor existente.
3. Hace clic o toca la posicion correspondiente sobre el plano.
4. El sistema guarda coordenadas relativas, no pixeles absolutos.
5. Al abrir el plano, cada marcador muestra el color de estado actual.
6. Al tocar un marcador se abre una ficha con codigo, tipo, ubicacion, vencimiento y acceso al detalle.

## 7. Modulos Funcionales

### 7.1 Sitio publico

El sitio publico tendra navegacion independiente del area privada, optimizada para lectura, SEO y dispositivos moviles.

| Ruta propuesta              | Contenido                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `/`                         | Presentacion de Extin Safe, beneficios, resumen de estados y llamados a la accion. |
| `/extintores`               | Que es un extintor, por que es importante y conceptos basicos.                     |
| `/tipos-de-fuego`           | Clases de fuego y materiales involucrados.                                         |
| `/tipos-de-extintores`      | Agente extintor, aplicaciones y limitaciones de cada tipo.                         |
| `/partes-del-extintor`      | Componentes ilustrados de un extintor.                                             |
| `/como-funcionan`           | Principios basicos de sofocacion, enfriamiento e inhibicion.                       |
| `/como-usarlos`             | Guia de uso responsable y seguro ante un principio de incendio.                    |
| `/mantenimiento-y-cuidados` | Revisiones visuales, acceso, senalizacion y cuidados.                              |
| `/guia-de-seleccion`        | Matriz de tipo de fuego contra extintor recomendado.                               |
| `/iniciar-sesion`           | Acceso al area privada.                                                            |
| `/registro`                 | Alta de cliente o empresa.                                                         |

El contenido publico debe incluir fuentes y revision por un profesional habilitado antes de presentar reglas regulatorias como definitivas. La aplicacion no debe sugerir que el contenido educativo reemplaza capacitacion, inspecciones o exigencias locales.

### 7.2 Autenticacion

Funciones iniciales:

- Registro con correo y contrasena.
- Inicio de sesion.
- Cierre de sesion.
- Verificacion de correo.
- Recuperacion de contrasena.
- Sesiones persistentes y seguras.
- Redireccion a dashboard segun tipo de organizacion activa.

La autenticacion se implementara con Better Auth persistido en D1. Las sesiones deben usar cookies `HttpOnly`, `Secure` en produccion y una politica `SameSite` adecuada.

### 7.3 Establecimientos

Campos requeridos inicialmente:

- Nombre.
- Direccion.
- Localidad.
- Provincia.
- Codigo postal opcional.
- Persona de contacto.
- Telefono.
- Correo de contacto.
- Empresa de mantenimiento asignada.

Operaciones:

- Crear establecimiento.
- Editar datos basicos.
- Consultar detalle.
- Listar y filtrar establecimientos.
- Archivar establecimiento sin destruir el historial.
- Asignar, reemplazar o finalizar una empresa de mantenimiento.

Un cliente puede tener varios establecimientos. Un establecimiento tendra como maximo una empresa de mantenimiento activa, pero conservara las asignaciones anteriores.

### 7.4 Gestion de extintores

El modulo debe cubrir:

- Alta de extintor.
- Edicion de datos actuales.
- Archivo o eliminacion logica.
- Consulta de ficha individual.
- Carga, reemplazo y visualizacion de foto.
- Busqueda por codigo, serie, marca y ubicacion.
- Filtros por establecimiento, tipo y estado.
- Orden por vencimiento, codigo, ubicacion y fecha de actualizacion.

Campos del formulario:

| Campo                                  | Regla inicial                                                          |
| -------------------------------------- | ---------------------------------------------------------------------- |
| Codigo o ID                            | Obligatorio y unico dentro del establecimiento.                        |
| Tipo                                   | Obligatorio; catalogo controlado.                                      |
| Clases de fuego cubiertas              | Derivadas del tipo, con posibilidad de ajuste autorizado.              |
| Capacidad                              | Obligatoria, valor mayor a cero.                                       |
| Unidad                                 | Kilogramos, litros u otra unidad validada.                             |
| Marca                                  | Opcional pero recomendada.                                             |
| Numero de serie                        | Opcional inicialmente; unico si se informa dentro del establecimiento. |
| Ubicacion                              | Obligatoria; texto claro como "Pasillo planta baja".                   |
| Fecha de ultimo control                | Obligatoria si el equipo ya estaba en servicio.                        |
| Fecha de proximo control o vencimiento | Obligatoria para equipos activos.                                      |
| Estado operativo                       | Activo, requiere atencion o fuera de servicio.                         |
| Observaciones                          | Opcionales.                                                            |
| Foto                                   | Opcional.                                                              |

### 7.5 Estados de cumplimiento

La interfaz mostrara tres estados principales:

| Estado                      | Color visual | Regla                                                                                               |
| --------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| En regla                    | Verde        | El extintor esta activo y su proximo control esta fuera de la ventana de alerta.                    |
| Proximo a revision          | Amarillo     | El proximo control ocurre entre hoy y los siguientes 30 dias.                                       |
| Vencido o requiere atencion | Rojo         | La fecha ya paso, falta una fecha de control, el equipo requiere atencion o esta fuera de servicio. |

Reglas tecnicas:

- Las fechas operativas se evaluaran en la zona horaria `America/Argentina/Buenos_Aires`.
- Las fechas de vencimiento deben persistirse como fecha de calendario, sin hora, para evitar cambios de estado por conversiones UTC.
- El estado visible se calculara al consultar; no se almacenara como unica fuente de verdad.
- El campo `operationalStatus` se almacenara por separado del estado de cumplimiento calculado.
- La ventana de alerta tendra valor inicial de 30 dias y sera configurable a nivel de organizacion en una etapa posterior.
- Un extintor archivado no participa en contadores ni alertas.

### 7.6 Dashboard del cliente

El dashboard debe responder la pregunta: "Que equipos necesitan accion y donde estan?"

Contenido:

- Total de extintores activos.
- Total en regla.
- Total proximos a revision.
- Total vencidos o que requieren atencion.
- Lista de proximos mantenimientos ordenada por fecha.
- Lista de vencidos priorizada.
- Selector de establecimiento cuando el cliente tiene mas de uno.
- Accion para agregar extintor.
- Accion para registrar o abrir un plano.
- Acceso rapido a historiales recientes.

La primera version puede usar tarjetas y listas. Graficos complejos no son necesarios para entregar valor operativo.

### 7.7 Dashboard de empresa

El dashboard de empresa debe mostrar:

- Cantidad de clientes vinculados.
- Cantidad de establecimientos autorizados.
- Cantidad de extintores bajo seguimiento.
- Proximos controles ordenados por fecha.
- Extintores vencidos o con observaciones que requieren atencion.
- Accesos a clientes, mantenimientos y agenda.

La empresa no debe ver establecimientos de un cliente antes de que el vinculo sea aceptado.

### 7.8 Planos y marcadores

Capacidades:

- Cargar uno o mas planos por establecimiento.
- Nombrar cada plano, por ejemplo "Planta baja" o "Deposito".
- Visualizar la imagen en un contenedor con zoom y desplazamiento.
- Crear, mover y eliminar marcadores asociados a extintores.
- Mostrar el color del marcador segun el estado del extintor.
- Abrir una ficha resumida al tocar un marcador.
- Navegar desde el marcador al detalle completo del extintor.

Las posiciones se guardaran como coordenadas normalizadas entre `0` y `1` para `x` e `y`. Asi el marcador conserva su ubicacion relativa aunque el plano se vea en dispositivos de distinto tamano.

### 7.9 Historial

El historial debe preservar el registro de acciones sobre cada extintor.

Eventos iniciales:

- Control.
- Recarga.
- Reparacion.
- Instalacion.
- Reemplazo.
- Baja.

Cada evento debe incluir:

- Fecha de realizacion.
- Tipo de evento.
- Usuario que lo registro.
- Empresa responsable, cuando corresponda.
- Observaciones.
- Estado operativo resultante.
- Proxima fecha de control resultante.
- Fecha tecnica de creacion del registro.

Los eventos de historial no se borraran desde la interfaz operativa. Si se detecta un error, se debe crear una correccion auditable en lugar de modificar silenciosamente el pasado.

### 7.10 Empresa de mantenimiento

Funciones requeridas:

- Ver clientes vinculados.
- Ver establecimientos de cada cliente.
- Ver extintores de establecimientos autorizados.
- Consultar proximos controles.
- Consultar extintores vencidos.
- Filtrar por cliente, establecimiento, estado y rango de fechas.
- Registrar un mantenimiento realizado.
- Ver el historial antes de realizar una nueva intervencion.

En esta primera version, la empresa registra mantenimientos pero no podra eliminar extintores ni modificar datos administrativos del establecimiento.

### 7.11 Notificaciones por correo electronico

Un proceso programado diario evaluara los vencimientos y enviara correos cuando corresponda.

Politica inicial recomendada:

- Primer aviso a 30 dias.
- Segundo aviso a 7 dias.
- Aviso el dia del vencimiento.
- Recordatorio periodico posterior mientras el extintor siga vencido.

Destinatarios iniciales:

- Administradores de la organizacion cliente.
- Contactos habilitados de la empresa de mantenimiento asignada.

Cada intento de envio se almacenara para evitar duplicados. El diseno debe permitir modificar las reglas de aviso por organizacion mas adelante.

## 8. Modelo de Datos Propuesto

### 8.1 Convenciones generales

- Usar identificadores tipo ULID o UUID en texto para entidades de negocio.
- Usar `createdAt` y `updatedAt` en todas las tablas principales.
- Usar borrado logico mediante `archivedAt` cuando exista historial que preservar.
- Guardar fechas de negocio como `YYYY-MM-DD` y timestamps tecnicos en UTC.
- Crear indices sobre claves foraneas, fechas de vencimiento y campos usados en filtros frecuentes.

### 8.2 Tablas de autenticacion

Better Auth administrara las tablas necesarias para:

- Usuarios.
- Sesiones.
- Cuentas.
- Verificacion de correo.
- Recuperacion de contrasena.

El rol de negocio no se debe confiar exclusivamente a un campo global del usuario. Los permisos se resolveran por membresia en cada organizacion.

### 8.3 `organizations`

| Campo          | Tipo           | Notas                             |
| -------------- | -------------- | --------------------------------- |
| `id`           | texto          | Clave primaria.                   |
| `type`         | texto          | `client` o `maintenance_company`. |
| `name`         | texto          | Nombre visible.                   |
| `taxId`        | texto nullable | CUIT opcional.                    |
| `contactEmail` | texto nullable | Correo administrativo.            |
| `contactPhone` | texto nullable | Telefono administrativo.          |
| `address`      | texto nullable | Domicilio general, si aplica.     |
| `isActive`     | entero         | Estado de la organizacion.        |
| `createdAt`    | timestamp      | Auditoria.                        |
| `updatedAt`    | timestamp      | Auditoria.                        |

### 8.4 `organization_members`

| Campo             | Tipo           | Notas                                 |
| ----------------- | -------------- | ------------------------------------- |
| `id`              | texto          | Clave primaria.                       |
| `organizationId`  | texto          | Referencia a organizacion.            |
| `userId`          | texto          | Referencia al usuario de Better Auth. |
| `role`            | texto          | Rol interno.                          |
| `status`          | texto          | `active`, `pending` o `revoked`.      |
| `invitedByUserId` | texto nullable | Quien genero la invitacion.           |
| `createdAt`       | timestamp      | Auditoria.                            |
| `updatedAt`       | timestamp      | Auditoria.                            |

Restriccion: un usuario no debe tener dos membresias activas iguales para la misma organizacion.

### 8.5 `maintenance_relationships`

| Campo                       | Tipo               | Notas                                               |
| --------------------------- | ------------------ | --------------------------------------------------- |
| `id`                        | texto              | Clave primaria.                                     |
| `clientOrganizationId`      | texto              | Debe ser una organizacion cliente.                  |
| `maintenanceOrganizationId` | texto              | Debe ser una empresa de mantenimiento.              |
| `status`                    | texto              | `pending`, `accepted`, `rejected`, `ended`.         |
| `initiatedByOrganizationId` | texto              | Parte que inicio el vinculo.                        |
| `invitationEmail`           | texto nullable     | Correo cuando la otra parte aun no esta registrada. |
| `acceptedAt`                | timestamp nullable | Fecha de aceptacion.                                |
| `endedAt`                   | timestamp nullable | Fecha de finalizacion.                              |
| `createdAt`                 | timestamp          | Auditoria.                                          |
| `updatedAt`                 | timestamp          | Auditoria.                                          |

Restriccion: no deben existir dos relaciones aceptadas activas iguales entre el mismo cliente y empresa.

### 8.6 `establishments`

| Campo                  | Tipo               | Notas                            |
| ---------------------- | ------------------ | -------------------------------- |
| `id`                   | texto              | Clave primaria.                  |
| `clientOrganizationId` | texto              | Propietario del establecimiento. |
| `name`                 | texto              | Nombre obligatorio.              |
| `contactName`          | texto nullable     | Persona de contacto.             |
| `contactEmail`         | texto nullable     | Correo del establecimiento.      |
| `contactPhone`         | texto nullable     | Telefono del establecimiento.    |
| `addressLine`          | texto              | Direccion obligatoria.           |
| `city`                 | texto              | Localidad.                       |
| `province`             | texto              | Provincia.                       |
| `postalCode`           | texto nullable     | Codigo postal.                   |
| `archivedAt`           | timestamp nullable | Borrado logico.                  |
| `createdAt`            | timestamp          | Auditoria.                       |
| `updatedAt`            | timestamp          | Auditoria.                       |

### 8.7 `establishment_maintenance_assignments`

| Campo                       | Tipo           | Notas                     |
| --------------------------- | -------------- | ------------------------- |
| `id`                        | texto          | Clave primaria.           |
| `establishmentId`           | texto          | Establecimiento asignado. |
| `maintenanceRelationshipId` | texto          | Relacion aceptada.        |
| `startsOn`                  | fecha          | Inicio de la asignacion.  |
| `endsOn`                    | fecha nullable | Fin de la asignacion.     |
| `createdAt`                 | timestamp      | Auditoria.                |
| `updatedAt`                 | timestamp      | Auditoria.                |

Restriccion: un establecimiento solo puede tener una asignacion activa a la vez.

### 8.8 `extinguishers`

| Campo                 | Tipo                      | Notas                                             |
| --------------------- | ------------------------- | ------------------------------------------------- |
| `id`                  | texto                     | Clave primaria.                                   |
| `establishmentId`     | texto                     | Propietario fisico.                               |
| `code`                | texto                     | Codigo o ID obligatorio.                          |
| `type`                | texto                     | Tipo de extintor.                                 |
| `fireClasses`         | texto o tabla relacionada | Clases de fuego compatibles.                      |
| `capacityValue`       | numero                    | Capacidad mayor a cero.                           |
| `capacityUnit`        | texto                     | Por ejemplo `kg` o `l`.                           |
| `brand`               | texto nullable            | Marca.                                            |
| `serialNumber`        | texto nullable            | Numero de serie.                                  |
| `locationDescription` | texto                     | Ubicacion fisica obligatoria.                     |
| `lastControlOn`       | fecha nullable            | Ultimo control registrado.                        |
| `nextControlDueOn`    | fecha nullable            | Fecha proxima de control o vencimiento.           |
| `operationalStatus`   | texto                     | `active`, `attention_required`, `out_of_service`. |
| `notes`               | texto nullable            | Observaciones actuales.                           |
| `photoObjectKey`      | texto nullable            | Clave privada en R2.                              |
| `archivedAt`          | timestamp nullable        | Borrado logico.                                   |
| `createdAt`           | timestamp                 | Auditoria.                                        |
| `updatedAt`           | timestamp                 | Auditoria.                                        |

Restricciones e indices:

- `establishmentId` y `code` deben ser unicos en conjunto.
- `establishmentId` y `serialNumber` deben ser unicos cuando el numero de serie exista.
- Crear indice sobre `nextControlDueOn` para dashboard, reportes y Cron.
- Crear indice sobre `establishmentId` y `archivedAt` para listados frecuentes.

### 8.9 `floor_plans`

| Campo              | Tipo               | Notas                                       |
| ------------------ | ------------------ | ------------------------------------------- |
| `id`               | texto              | Clave primaria.                             |
| `establishmentId`  | texto              | Establecimiento propietario.                |
| `name`             | texto              | Nombre del plano o nivel.                   |
| `objectKey`        | texto              | Clave privada de R2.                        |
| `contentType`      | texto              | Tipo validado del archivo.                  |
| `width`            | entero nullable    | Dimensiones de imagen si estan disponibles. |
| `height`           | entero nullable    | Dimensiones de imagen si estan disponibles. |
| `uploadedByUserId` | texto              | Usuario que lo cargo.                       |
| `archivedAt`       | timestamp nullable | Borrado logico.                             |
| `createdAt`        | timestamp          | Auditoria.                                  |
| `updatedAt`        | timestamp          | Auditoria.                                  |

### 8.10 `extinguisher_plan_markers`

| Campo            | Tipo      | Notas                               |
| ---------------- | --------- | ----------------------------------- |
| `id`             | texto     | Clave primaria.                     |
| `floorPlanId`    | texto     | Plano visualizado.                  |
| `extinguisherId` | texto     | Extintor representado.              |
| `x`              | numero    | Coordenada normalizada entre 0 y 1. |
| `y`              | numero    | Coordenada normalizada entre 0 y 1. |
| `createdAt`      | timestamp | Auditoria.                          |
| `updatedAt`      | timestamp | Auditoria.                          |

Restriccion: un extintor puede tener un marcador por plano.

### 8.11 `maintenance_events`

| Campo                        | Tipo           | Notas                            |
| ---------------------------- | -------------- | -------------------------------- |
| `id`                         | texto          | Clave primaria.                  |
| `extinguisherId`             | texto          | Equipo intervenido.              |
| `maintenanceOrganizationId`  | texto nullable | Empresa responsable.             |
| `performedByUserId`          | texto          | Usuario o tecnico que registra.  |
| `eventType`                  | texto          | Tipo de intervencion.            |
| `performedOn`                | fecha          | Fecha efectiva del trabajo.      |
| `resultingOperationalStatus` | texto          | Estado luego de la intervencion. |
| `resultingNextControlDueOn`  | fecha nullable | Nueva fecha de control.          |
| `notes`                      | texto nullable | Detalle u observaciones.         |
| `createdAt`                  | timestamp      | Fecha de carga en el sistema.    |

Los eventos son inmutables para fines de trazabilidad. Una correccion posterior debe quedar registrada como un nuevo evento o anotacion de correccion.

### 8.12 `notification_deliveries`

| Campo               | Tipo               | Notas                              |
| ------------------- | ------------------ | ---------------------------------- |
| `id`                | texto              | Clave primaria.                    |
| `extinguisherId`    | texto              | Equipo evaluado.                   |
| `dueOn`             | fecha              | Vencimiento asociado.              |
| `notificationType`  | texto              | Por ejemplo `due_in_30_days`.      |
| `recipientEmail`    | texto              | Destinatario.                      |
| `status`            | texto              | `sent`, `failed` o `skipped`.      |
| `providerMessageId` | texto nullable     | Identificador del proveedor.       |
| `failureReason`     | texto nullable     | Error tecnico sin datos sensibles. |
| `createdAt`         | timestamp          | Auditoria.                         |
| `sentAt`            | timestamp nullable | Fecha de entrega al proveedor.     |

Restriccion: la combinacion de extintor, vencimiento, tipo de aviso y destinatario debe ser unica para impedir reenvios duplicados.

### 8.13 `audit_log`

| Campo            | Tipo           | Notas                            |
| ---------------- | -------------- | -------------------------------- |
| `id`             | texto          | Clave primaria.                  |
| `organizationId` | texto          | Organizacion involucrada.        |
| `actorUserId`    | texto nullable | Usuario que ejecuto la accion.   |
| `action`         | texto          | Ejemplo: `extinguisher.created`. |
| `entityType`     | texto          | Entidad afectada.                |
| `entityId`       | texto          | Identificador afectado.          |
| `metadata`       | texto nullable | JSON reducido, sin secretos.     |
| `createdAt`      | timestamp      | Auditoria.                       |

## 9. Tipos de Extintor y Clases de Fuego

El catalogo inicial debe ser controlado para mantener datos consistentes, pero extensible para futuros tipos o productos locales.

### Tipos de extintor iniciales

- Agua.
- Espuma.
- Polvo quimico seco.
- Dioxido de carbono.
- Agente limpio.
- Quimico humedo.
- Otro, con descripcion obligatoria.

### Clases de fuego iniciales

- A: materiales solidos combustibles comunes.
- B: liquidos inflamables.
- C: equipos electricos energizados.
- D: metales combustibles.
- K/F: aceites y grasas de cocina, segun terminologia que se presente al usuario.

La guia publica y la configuracion del catalogo deben ser revisadas por especialistas habilitados antes del lanzamiento. Las reglas de negocio no deben codificar una afirmacion normativa inmutable sin confirmacion profesional.

## 10. Rutas Privadas Propuestas

| Ruta                                                | Proposito                                    |
| --------------------------------------------------- | -------------------------------------------- |
| `/app/dashboard`                                    | Dashboard del cliente.                       |
| `/app/establecimientos`                             | Listado de establecimientos.                 |
| `/app/establecimientos/nuevo`                       | Alta de establecimiento.                     |
| `/app/establecimientos/$establishmentId`            | Resumen del establecimiento.                 |
| `/app/establecimientos/$establishmentId/extintores` | Inventario de extintores.                    |
| `/app/establecimientos/$establishmentId/planos`     | Gestion de planos y marcadores.              |
| `/app/extintores/$extinguisherId`                   | Ficha e historial de un extintor.            |
| `/app/historial`                                    | Historial consolidado del cliente.           |
| `/app/empresas`                                     | Empresas vinculadas e invitaciones.          |
| `/app/configuracion`                                | Organizacion, integrantes y preferencias.    |
| `/app/empresa/dashboard`                            | Dashboard de la empresa de mantenimiento.    |
| `/app/empresa/clientes`                             | Clientes vinculados.                         |
| `/app/empresa/clientes/$clientId`                   | Establecimientos y extintores de un cliente. |
| `/app/empresa/mantenimientos`                       | Registro y consulta de intervenciones.       |
| `/app/invitaciones`                                 | Invitaciones pendientes.                     |

Las rutas bajo `/app` usaran un layout autenticado. El layout resolvera sesion y organizacion activa antes de renderizar contenidos privados.

## 11. API y Capa de Servidor

El router oRPC actual contiene ejemplos de tareas y debe reemplazarse por modulos de dominio. Cada operacion validara datos con Zod, resolvera la sesion y verificara permisos en el servidor.

### Modulos oRPC sugeridos

| Modulo           | Operaciones principales                                                 |
| ---------------- | ----------------------------------------------------------------------- |
| `auth`           | Perfil actual, organizaciones disponibles y organizacion activa.        |
| `organizations`  | Crear, editar, invitar integrantes, listar miembros.                    |
| `relationships`  | Crear, aceptar, rechazar y finalizar vinculos.                          |
| `establishments` | Crear, listar, leer, editar, archivar y asignar empresa.                |
| `extinguishers`  | Crear, listar, leer, editar, archivar y consultar estado.               |
| `floorPlans`     | Crear carga, listar, leer archivo, archivar y administrar marcadores.   |
| `maintenance`    | Crear eventos, listar historiales y consultar agenda.                   |
| `dashboards`     | Resumen para cliente y empresa.                                         |
| `uploads`        | Inicio o procesamiento de carga y lectura autorizada de R2.             |
| `notifications`  | Preferencias, historial de envios y ejecucion interna de recordatorios. |

### Reglas de implementacion de API

- No recibir un `organizationId` confiable desde el cliente sin verificar membresia.
- Cargar recursos por identificador y comprobar que pertenecen a la organizacion autorizada antes de devolverlos.
- Ejecutar el alta de un mantenimiento y la actualizacion del extintor dentro de una transaccion D1.
- Devolver errores de dominio claros: no autenticado, sin permiso, no encontrado, conflicto de codigo o datos invalidos.
- No exponer claves internas de R2 sin validar autorizacion.
- Mantener paginacion en listados de extintores e historial desde el inicio.

## 12. Arquitectura Tecnica

### 12.1 Adaptacion del proyecto actual

El proyecto ya incluye TanStack Start, Tailwind, TanStack Query, Better Auth, Drizzle y oRPC. Los cambios de base requeridos son:

- Reemplazar `drizzle-orm/better-sqlite3` por la integracion de Drizzle para D1.
- Eliminar la dependencia de runtime `better-sqlite3`, ya que Workers no ejecuta binarios nativos de Node.js.
- Configurar Better Auth con adaptador compatible con D1.
- Cambiar la base de datos de ejemplo `todos` por el esquema de dominio.
- Reemplazar los procedimientos oRPC de ejemplo por procedimientos de producto.
- Incorporar contexto de request, sesion, bindings de Cloudflare y organizacion activa a las operaciones privadas.

### 12.2 Estructura de codigo sugerida

```text
src/
  components/
    app-shell/
    dashboard/
    extinguishers/
    floor-plans/
    public-site/
    ui/
  db/
    index.ts
    schema/
      auth.ts
      organizations.ts
      establishments.ts
      extinguishers.ts
      maintenance.ts
      notifications.ts
    queries/
  lib/
    auth.ts
    authorization.ts
    cloudflare.ts
    compliance-status.ts
    dates.ts
    storage.ts
  orpc/
    context.ts
    middleware.ts
    router/
      index.ts
      organizations.ts
      relationships.ts
      establishments.ts
      extinguishers.ts
      floor-plans.ts
      maintenance.ts
      dashboards.ts
  routes/
    _public/
    _auth/
    _app/
    api/
  workers/
    scheduled.ts
```

La estructura final puede adaptarse a las convenciones del generador de rutas de TanStack, pero las responsabilidades deben permanecer separadas: interfaz, autorizacion, consultas, dominio y almacenamiento.

### 12.3 Cloudflare Workers

El Worker servira la aplicacion TanStack Start, endpoints oRPC, descargas autorizadas de archivos y el proceso programado de notificaciones.

Configuracion de bindings propuesta:

| Binding   | Servicio | Uso                                      |
| --------- | -------- | ---------------------------------------- |
| `DB`      | D1       | Datos transaccionales y autentificacion. |
| `MEDIA`   | R2       | Fotos de extintores y planos.            |
| `APP_ENV` | Variable | Entorno de ejecucion.                    |
| `APP_URL` | Variable | URL canonica y enlaces de correo.        |

Secrets propuestos:

- `BETTER_AUTH_SECRET`.
- Credencial del proveedor de correo electronico.
- Cualquier secreto adicional del proveedor elegido.

El nombre del Worker debe pasar de `tanstack-start-app` a `extin-safe` antes del primer despliegue productivo.

### 12.4 Cloudflare D1

D1 sera la fuente transaccional de verdad. Las migraciones se generaran con Drizzle y se aplicaran con Wrangler en cada ambiente.

Buenas practicas:

- Separar bases de datos de desarrollo, preproduccion y produccion.
- Versionar las migraciones generadas.
- Nunca editar manualmente una migracion ya aplicada a produccion.
- Aplicar indices antes de habilitar listados de gran volumen.
- Usar consultas agregadas para dashboards en lugar de descargar inventarios completos al cliente.

### 12.5 Cloudflare R2

R2 almacenara archivos privados. Las claves deben incluir organizacion y entidad para facilitar auditoria y limpieza controlada.

Formato sugerido de claves:

```text
organizations/{organizationId}/establishments/{establishmentId}/extinguishers/{extinguisherId}/photo/{fileId}
organizations/{organizationId}/establishments/{establishmentId}/floor-plans/{floorPlanId}/{fileId}
```

Los archivos no deben ser publicos por defecto. La aplicacion entregara una respuesta desde un endpoint autenticado tras comprobar acceso al establecimiento.

### 12.6 Cron y correos

Un Cron diario, por ejemplo a las 08:00 en horario configurado, consultara vencimientos que entren en ventanas de notificacion.

Proceso:

1. Buscar extintores activos con proximo control dentro de las ventanas definidas o ya vencidos.
2. Resolver destinatarios autorizados del cliente y empresa asignada.
3. Verificar en `notification_deliveries` que no exista el mismo aviso enviado.
4. Enviar el correo con el proveedor configurado.
5. Registrar envio exitoso, omision o error.
6. Continuar con los demas equipos sin abortar todo el lote ante un fallo individual.

Para el volumen inicial, un Cron y llamadas HTTP directas al proveedor de correo son suficientes. Cloudflare Queues se evaluara cuando el volumen o la necesidad de reintentos asincronos lo justifique.

## 13. Diseno de Interfaz y Experiencia

### Principios

- Priorizar lectura rapida de estado y vencimientos.
- Usar color junto con texto e iconos; nunca depender solo del color.
- Mantener formularios cortos, agrupados y con validacion inmediata.
- Diseñar primero para movil en acciones frecuentes como consultar un extintor o registrar mantenimiento.
- Mantener la identidad visual existente del proyecto cuando no contradiga la usabilidad del producto.
- Usar terminologia consistente: "proximo control", "vencido", "requiere atencion" y "en regla".

### Componentes reutilizables

- Insignia de cumplimiento.
- Tarjeta de resumen de dashboard.
- Tabla de extintores con filtros.
- Formulario de extintor.
- Selector de establecimiento.
- Selector de empresa de mantenimiento.
- Timeline de historial.
- Cargador de archivos con estado y validacion.
- Visor de plano con marcadores.
- Confirmacion de archivo o baja.
- Estado vacio para inventarios, planos e historiales.

### Accesibilidad

- Navegacion completa por teclado.
- Etiquetas visibles para campos de formulario.
- Mensajes de error asociados a cada campo.
- Contraste suficiente para los estados verde, amarillo y rojo.
- Texto alternativo para imagenes relevantes.
- Marcadores de plano accesibles mediante listado alternativo de extintores ubicados.
- No usar el color como unico medio para comunicar urgencia.

## 14. Archivos y Cargas

### Formatos y limites iniciales

| Recurso          | Formatos       | Limite inicial |
| ---------------- | -------------- | -------------- |
| Foto de extintor | JPG, PNG, WebP | 5 MB           |
| Plano            | JPG, PNG, WebP | 10 MB          |

Los PDF no se incluiran en el primer alcance salvo que se incorpore una conversion segura a imagen. El visor de marcadores necesita una superficie visual con dimensiones conocidas.

### Validaciones

- Validar tipo MIME esperado y extension de archivo.
- Validar tamano antes de almacenar.
- Generar un nombre interno no predecible; no usar directamente el nombre del archivo del usuario.
- Registrar en base de datos el tipo, clave de R2 y entidad propietaria.
- Limpiar objetos de R2 huerfanos si una carga falla antes de completar la operacion.
- Aplicar autorizacion tanto al subir como al visualizar o eliminar un archivo.

## 15. Seguridad, Privacidad y Auditoria

### Seguridad de acceso

- Validar sesion en toda ruta y operacion privada.
- Validar membresia en la organizacion activa.
- Validar relacion aceptada antes de que una empresa vea datos de un cliente.
- Usar identificadores no secuenciales en URLs de recursos privados.
- Rotar sesiones ante cambios sensibles de privilegios.
- Proteger endpoints de autenticacion contra abuso y enumeracion de correos.
- Configurar rate limiting y, si corresponde, Cloudflare Turnstile para registro y recuperacion de contrasena.

### Datos y privacidad

- Guardar solo datos personales necesarios para operar la plataforma.
- No incluir numeros de serie, direcciones ni otros datos sensibles en logs de error sin necesidad.
- Mantener archivos en R2 privado.
- Definir politica de retencion para establecimientos y cuentas archivadas.
- Documentar responsables de tratamiento y terminos antes de operacion comercial.

### Auditoria

Se registraran como minimo:

- Creacion, edicion y archivo de establecimientos.
- Creacion, edicion y archivo de extintores.
- Cambios de fecha de proximo control.
- Registro de mantenimientos.
- Aceptacion o finalizacion de relaciones cliente-empresa.
- Cargas y eliminaciones de planos o fotos.
- Acciones administrativas de miembros e invitaciones.

## 16. Notas sobre Normativa Argentina

La plataforma se preparara inicialmente para el mercado argentino, pero no debe codificar requisitos legales o tecnicos como verdades universales sin validacion profesional.

Antes de publicar contenido regulatorio o automatizar plazos obligatorios se debera confirmar:

- Jurisdiccion o jurisdicciones objetivo.
- Normas nacionales, provinciales o municipales aplicables.
- Periodicidad real de los controles segun tipo de equipo y establecimiento.
- Requisitos de rotulado, certificacion y documentacion.
- Informacion que debe aportar una empresa habilitada.

La primera version permitira registrar la fecha de proximo control definida por el responsable, y aplicara alertas configurables. Esto evita asumir una frecuencia unica incorrecta.

## 17. Dependencias y Herramientas

### Ya disponibles

- TanStack Start y TanStack Router.
- TanStack Query.
- TanStack Form.
- TanStack Table.
- React 19.
- Tailwind CSS.
- Drizzle ORM y Drizzle Kit.
- Better Auth.
- oRPC.
- Zod.
- Cloudflare Vite Plugin y Wrangler.

### Ajustes o dependencias a evaluar

| Necesidad      | Opcion recomendada                                             | Motivo                                     |
| -------------- | -------------------------------------------------------------- | ------------------------------------------ |
| D1             | Driver D1 de Drizzle ya incluido en `drizzle-orm`              | Compatibilidad directa con Workers.        |
| Fechas         | Utilidades nativas o biblioteca pequena compatible con Workers | Evitar errores de zona horaria.            |
| Zoom de planos | Componente pequeno de zoom o implementacion propia             | Mejor experiencia al ubicar marcadores.    |
| Correo         | API HTTP de Resend u otro proveedor                            | Compatible con Workers y simple de operar. |
| Tests          | Vitest y pool de Workers de Cloudflare                         | Pruebas de dominio y bindings.             |
| E2E            | Playwright                                                     | Validar flujos reales en navegador.        |

No se deben agregar librerias por costumbre. Cada dependencia debe justificarse por un caso concreto y ser compatible con el runtime de Cloudflare Workers.

## 18. Fases de Implementacion

### Fase 0: Preparacion tecnica

Objetivo: dejar una base compatible con Cloudflare para construir el producto.

- Ejecutar el relevamiento de skills requerido por `AGENTS.md`.
- Renombrar el Worker a `extin-safe`.
- Crear bindings D1 y R2 en `wrangler.jsonc`.
- Crear bases de datos para desarrollo y produccion.
- Reemplazar `better-sqlite3` por D1.
- Configurar Drizzle para generar y aplicar migraciones D1.
- Configurar Better Auth con persistencia D1.
- Crear `.env.example` sin secretos y documentar variables requeridas.
- Configurar idioma espanol como base de la aplicacion.
- Eliminar los ejemplos de tareas cuando existan procedimientos reales.

Criterio de salida: una cuenta puede persistir sesion en desarrollo con D1 y el proyecto compila para Workers.

### Fase 1: Identidad, organizaciones y autorizacion

Objetivo: crear el modelo multi-organizacion seguro.

- Agregar tablas de organizaciones y membresias.
- Implementar registro con eleccion de tipo de organizacion.
- Implementar onboarding para crear la primera organizacion.
- Resolver la organizacion activa por usuario.
- Crear layout protegido para `/app`.
- Crear middleware o helpers reutilizables de autorizacion.
- Implementar invitaciones entre integrantes de una misma organizacion.
- Implementar invitaciones y aceptacion entre cliente y empresa.

Criterio de salida: un cliente y una empresa pueden crear cuentas, vincularse y solo ver los datos autorizados.

### Fase 2: Establecimientos y extintores

Objetivo: construir el inventario principal.

- Crear migraciones de establecimientos y asignaciones de empresa.
- Implementar CRUD de establecimientos con archivo logico.
- Crear migraciones de extintores.
- Implementar catalogos de tipo, capacidad y clase de fuego.
- Implementar formulario de extintor con Zod.
- Implementar listado con filtros, orden y paginacion.
- Implementar ficha individual y archivo logico.
- Implementar calculo centralizado de estado de cumplimiento.
- Registrar acciones importantes en auditoria.

Criterio de salida: un cliente puede gestionar su inventario y diferenciar equipos en regla, proximos y vencidos.

### Fase 3: Dashboard e historial de mantenimiento

Objetivo: convertir el inventario en control operativo.

- Crear consultas agregadas para dashboard de cliente.
- Crear consultas agregadas para dashboard de empresa.
- Crear tabla de eventos de mantenimiento.
- Implementar formulario de control, recarga y reparacion.
- Actualizar el estado actual del extintor de forma transaccional.
- Crear timeline o listado de historial por extintor.
- Crear historial consolidado por establecimiento.

Criterio de salida: una empresa registra una intervencion y el cliente observa el historial y la nueva fecha de control de inmediato.

### Fase 4: Fotos, planos y marcadores

Objetivo: vincular el inventario con su ubicacion fisica.

- Configurar almacenamiento privado R2.
- Implementar carga y lectura autorizada de fotos.
- Implementar carga de planos.
- Crear visor de plano responsivo con zoom.
- Implementar creacion, movimiento y eliminacion de marcadores.
- Mostrar estado de cada marcador.
- Crear alternativa accesible en lista para los equipos representados en el plano.

Criterio de salida: un usuario puede abrir un plano, ubicar un extintor y acceder a su detalle desde el marcador.

### Fase 5: Alertas y operacion de empresa

Objetivo: automatizar el seguimiento de vencimientos.

- Configurar Cron de Cloudflare.
- Crear consultas de vencimientos por ventana de aviso.
- Integrar proveedor de correo electronico.
- Crear plantillas de correo en espanol.
- Registrar envios, fallos y omisiones.
- Implementar preferencias basicas de destinatarios.
- Verificar deduplicacion de correos.

Criterio de salida: los destinatarios autorizados reciben un correo de prueba por un vencimiento simulado sin duplicados.

### Fase 6: Calidad, despliegue y lanzamiento

Objetivo: preparar la primera version para uso real.

- Completar pruebas unitarias, de integracion y end-to-end.
- Revisar permisos y aislamiento entre organizaciones.
- Revisar accesibilidad y diseno movil.
- Revisar contenido publico con especialista tecnico.
- Configurar ambiente de produccion, secretos y dominio.
- Aplicar migraciones productivas.
- Desplegar Worker.
- Verificar autenticacion, D1, R2, Cron y correo en produccion.
- Crear respaldo operativo, monitoreo y procedimiento de incidencias.

Criterio de salida: la aplicacion supera la lista de pruebas criticas y funciona sobre la infraestructura final.

## 19. Estrategia de Pruebas

### Pruebas unitarias

- Calculo de estado de cumplimiento para fechas limite.
- Conversion y comparacion de fechas en zona horaria argentina.
- Validacion de formularios Zod.
- Reglas de permisos por rol y organizacion.
- Reglas de deduplicacion de notificaciones.
- Normalizacion de coordenadas de marcadores.

### Pruebas de integracion

- Operaciones Drizzle sobre D1.
- Creacion de organizacion y membresia.
- Vinculo cliente-empresa y restricciones de acceso.
- Creacion de extintor y consulta filtrada.
- Registro de mantenimiento y actualizacion del resumen.
- Carga y recuperacion autorizada de un objeto R2.
- Ejecucion del proceso de alertas con datos simulados.

### Pruebas end-to-end

- Registro de cliente y alta de establecimiento.
- Registro de empresa y aceptacion de vinculo.
- Alta, edicion y archivo de extintor.
- Visualizacion de estado en dashboard.
- Carga de foto y plano.
- Creacion de marcador sobre plano.
- Registro de control por empresa.
- Consulta de historial por cliente.
- Restriccion de acceso entre organizaciones distintas.

### Casos criticos de aceptacion

- Un cliente nunca puede consultar datos de otro cliente.
- Una empresa no puede ver un establecimiento sin relacion aceptada.
- Un tecnico no puede borrar historial de mantenimiento.
- Un extintor vencido se muestra en rojo al cambiar de dia en Argentina.
- Un extintor marcado como requiere atencion se muestra en rojo aunque su fecha no este proxima.
- Un mantenimiento agrega un evento y actualiza la proxima fecha en una unica operacion.
- Un archivo R2 no se entrega a usuarios no autorizados.
- Un marcador conserva posicion al redimensionar el plano.
- El Cron no envia dos veces la misma alerta al mismo destinatario.
- Las tareas principales son utilizables desde movil y escritorio.

## 20. Despliegue y Operacion

### Ambientes

| Ambiente      | Proposito                                                        |
| ------------- | ---------------------------------------------------------------- |
| Local         | Desarrollo diario con bindings locales.                          |
| Preproduccion | Pruebas integradas con un Worker y recursos aislados.            |
| Produccion    | Operacion real con D1, R2, Cron, dominio y secretos definitivos. |

Cada ambiente debe tener su propia base D1, bucket R2 cuando corresponda, credenciales de correo y URL publica.

### Proceso de despliegue

1. Ejecutar comprobaciones de formato, lint y build.
2. Ejecutar pruebas automatizadas.
3. Generar y revisar migraciones Drizzle.
4. Aplicar migraciones D1 en el ambiente objetivo.
5. Configurar o verificar secretos de Worker.
6. Desplegar con Wrangler.
7. Ejecutar pruebas de humo: inicio de sesion, listado, carga autorizada y correo de prueba.
8. Verificar ejecucion de Cron y registros de notificacion.

### Observabilidad

- Registrar errores de servidor con contexto tecnico limitado.
- Consultar logs de Worker para errores de request, R2 y proveedor de correo.
- Monitorear errores de Cron y cantidad de notificaciones fallidas.
- Crear alertas operativas cuando fallen repetidamente los envios de correo.
- No registrar contrasenas, tokens, cookies ni contenido sensible en logs.

## 21. Riesgos y Mitigaciones

| Riesgo                            | Mitigacion                                                    |
| --------------------------------- | ------------------------------------------------------------- |
| Reglas regulatorias incorrectas   | Validacion por profesional habilitado y fechas configurables. |
| Fuga de datos entre clientes      | Autorizacion de servidor por organizacion en cada operacion.  |
| Correos duplicados                | Restriccion unica y registro de entregas.                     |
| Archivos publicos accidentalmente | Bucket privado y endpoint autorizado.                         |
| Datos historicos borrados         | Archivo logico e historial inmutable.                         |
| Diferencias de fecha por UTC      | Fechas de negocio sin hora y zona horaria argentina.          |
| Crecimiento de listados           | Paginacion, filtros de servidor e indices D1.                 |
| Carga de archivos no validos      | Limites de tamano, MIME y autorizacion previa.                |

## 22. Decisiones Pendientes Antes de Produccion

- Confirmar proveedor de correo transaccional y dominio remitente.
- Confirmar normativa exacta y jurisdicciones argentinas que se comunicaran publicamente.
- Definir si el cliente puede desactivar correos o cambiar las ventanas de aviso.
- Definir si las empresas deben poder adjuntar certificados o comprobantes a un mantenimiento.
- Definir politica de eliminacion definitiva y retencion de datos para organizaciones cerradas.
- Definir si se incorporara un panel de administracion global para soporte interno.
- Definir identidad visual, nombre comercial final y dominio de produccion.

## 23. Resultado Esperado del MVP

Al finalizar este plan, un establecimiento podra:

- Crear su cuenta y registrar sus sedes.
- Cargar y administrar sus extintores.
- Conocer inmediatamente cuales estan en regla, proximos a revision o vencidos.
- Ubicar los equipos sobre un plano.
- Consultar el historial de intervenciones.
- Vincularse con una empresa de mantenimiento.
- Recibir recordatorios antes de los vencimientos.

Una empresa de mantenimiento podra:

- Vincularse con sus clientes de forma segura.
- Consultar establecimientos y equipos autorizados.
- Identificar proximos controles y vencidos.
- Registrar mantenimientos con trazabilidad.
- Mantener actualizada la informacion operativa de cada extintor.

El resultado sera una base solida para evolucionar Extin Safe hacia funciones futuras como QR, certificados, importacion masiva, reportes y automatizaciones comerciales.
