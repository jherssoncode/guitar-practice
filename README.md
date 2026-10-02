# 🎸 Guitar Practice V5.1.2

**Aplicación web para organizar, medir y mejorar tus sesiones de práctica de guitarra eléctrica.**

Guitar Practice es una herramienta diseñada para ayudarte a mantener la constancia, trabajar tus ejercicios musicales y registrar tu progreso. Incluye metrónomo, cronómetro de práctica, biblioteca de ejercicios, rutinas personalizadas e historial de sesiones.

🌐 **Aplicación en línea:** [Abrir Guitar Practice](https://jherssoncode.github.io/guitar-practice/)

---

## 📋 Índice

* [Características principales](#-características-principales)
* [1. Dashboard](#1--dashboard)
* [2. Metrónomo](#2--metrónomo)
* [3. Sesiones de práctica](#3--sesiones-de-práctica)
* [4. Biblioteca de ejercicios](#4--biblioteca-de-ejercicios)
* [5. Rutinas de práctica](#5--rutinas-de-práctica)
* [6. Historial de sesiones](#6--historial-de-sesiones)
* [7. Exportación e importación de datos](#7--exportación-e-importación-de-datos)
* [8. Modo oscuro](#8--modo-oscuro)
* [9. Pantalla activa durante la práctica](#9--pantalla-activa-durante-la-práctica)
* [10. Instalación en el teléfono](#10--instalación-en-el-teléfono)
* [11. Funcionamiento sin conexión](#11--funcionamiento-sin-conexión)
* [12. Recomendaciones de uso](#12--recomendaciones-de-uso)
* [Tecnologías utilizadas](#-tecnologías-utilizadas)

---

## ✨ Características principales

| Función                 | Descripción                                                      |
| ----------------------- | ---------------------------------------------------------------- |
| 📊 Dashboard            | Consulta estadísticas y tu actividad reciente.                   |
| 🥁 Metrónomo            | Practica con un pulso ajustable y diferentes subdivisiones.      |
| ⏱️ Cronómetro           | Controla el tiempo de tus sesiones de práctica.                  |
| ⏸️ Pausa y reanudación  | Descansa sin tener que finalizar la sesión.                      |
| 🎸 Ejercicios           | Organiza ejercicios por nombre, categoría y dificultad.          |
| 📋 Rutinas              | Agrupa ejercicios para estructurar tus sesiones.                 |
| 🕘 Historial            | Revisa y consulta tus sesiones anteriores.                       |
| 📦 Copias de seguridad  | Exporta e importa tus registros en formato JSON.                 |
| 🌙 Modo oscuro          | Cambia entre una interfaz clara y una oscura.                    |
| 📱 Pantalla activa      | Solicita mantener la pantalla encendida durante la práctica.     |
| 💾 Almacenamiento local | Guarda tus datos en el navegador, sin una base de datos externa. |

---

## 1. 📊 Dashboard

El Dashboard es la pantalla principal de la aplicación. Desde aquí puedes consultar un resumen de tu actividad musical.

Entre los datos disponibles se encuentran:

* **Tiempo total:** tiempo acumulado de práctica.
* **Sesiones:** cantidad de sesiones registradas.
* **Tiempo de hoy:** duración de las prácticas del día.
* **Tiempo semanal:** resumen del tiempo practicado durante la semana.
* **Ejercicios:** cantidad de ejercicios registrados en la biblioteca.
* **Racha de práctica:** indicador de continuidad de tus prácticas.
* **Objetivo diario:** establece una meta de práctica y consulta tu avance.
* **Actividad reciente:** revisa tus últimas sesiones y ejercicios.

**Consejo:** establece un objetivo diario realista y revisa tus estadísticas para mantener una rutina constante.

## 2. 🥁 Metrónomo

El metrónomo te ayuda a desarrollar precisión rítmica y mantener un tempo constante.

### Cómo utilizarlo

1. Entra en la sección **Practicar**.
2. Ajusta los BPM (pulsaciones por minuto) con los botones de incremento y reducción.
3. También puedes utilizar la función de tempo por pulsaciones, si quieres ajustar el metrónomo marcando un ritmo.
4. Selecciona la subdivisión disponible:

   * **1:** un pulso por tiempo.
   * **2:** dos subdivisiones por tiempo.
   * **4:** cuatro subdivisiones por tiempo.
5. Pulsa **Iniciar** para comenzar.
6. Utiliza **Detener** cuando quieras apagarlo.

Los indicadores visuales te ayudan a seguir los tiempos del compás.

### Ejemplo de práctica

Para comenzar un ejercicio de coordinación:

* Tempo inicial: 60 BPM.
* Subdivisión: 1.
* Duración: 5 minutos.
* Objetivo: tocar cada nota de forma limpia y sincronizada.

Cuando puedas tocar con precisión, aumenta gradualmente el tempo.

## 3. ⏱️ Sesiones de práctica

La aplicación permite registrar sesiones y trabajar distintos ejercicios dentro de una misma sesión.

### Cómo iniciar una sesión

1. Abre la sección **Practicar**.
2. Selecciona el ejercicio que vas a realizar.
3. Ajusta los BPM del ejercicio, si corresponde.
4. Añade notas u observaciones para recordar qué debes mejorar.
5. Pulsa **Iniciar**.

El cronómetro comenzará a registrar el tiempo de práctica.

### Pausar y continuar

Si necesitas descansar:

1. Pulsa **Pausar**.
2. Tómate el descanso necesario.
3. Pulsa **Continuar** para retomar la sesión.

El tiempo de pausa no debe confundirse con el tiempo de práctica efectiva.

### Cambiar de ejercicio

Puedes pasar a otro ejercicio durante la misma sesión. La aplicación permite registrar segmentos con sus respectivos ejercicios, tiempos, BPM y observaciones.

Esto resulta útil para organizar una sesión como la siguiente:

| Ejercicio               | Tiempo |  Tempo |
| ----------------------- | -----: | -----: |
| Calentamiento cromático |  5 min | 60 BPM |
| Alternate picking       | 10 min | 80 BPM |
| Cambios de acordes      | 10 min | 70 BPM |
| Escalas pentatónicas    | 10 min | 75 BPM |

Los datos de la tabla son un ejemplo de planificación, no valores predefinidos de la aplicación.

Cuando termines, pulsa **Finalizar** para guardar la sesión.

## 4. 📚 Biblioteca de ejercicios

La biblioteca permite crear y organizar los ejercicios que utilizas habitualmente.

### Crear un ejercicio

1. Entra en **Ejercicios**.
2. Pulsa **Nuevo ejercicio**.
3. Introduce el nombre del ejercicio.
4. Selecciona su categoría.
5. Define la dificultad.
6. Si lo necesitas, establece un BPM inicial y un BPM objetivo.
7. Añade observaciones.
8. Marca el ejercicio como favorito si quieres identificarlo fácilmente.
9. Guarda el ejercicio.

### Organizar tus ejercicios

Puedes utilizar las herramientas disponibles para:

* Buscar ejercicios por nombre.
* Filtrar por categoría.
* Mostrar favoritos.
* Consultar la información de cada ejercicio.
* Editar ejercicios existentes.
* Eliminar ejercicios que ya no necesites.

### Ejemplos de categorías

* Técnica.
* Ritmo.
* Escalas.
* Acordes.
* Improvisación.
* Repertorio.
* Teoría musical.

Puedes adaptar las categorías a tu propio método de estudio.

## 5. 📋 Rutinas de práctica

Las rutinas te permiten agrupar ejercicios para seguir una estructura de entrenamiento.

### Crear una rutina

1. Entra en **Rutinas**.
2. Pulsa **Nueva rutina**.
3. Asigna un nombre.
4. Escribe una descripción opcional.
5. Añade los ejercicios que formarán parte de ella.
6. Guarda la rutina.

Puedes organizar, por ejemplo, una rutina diaria con calentamiento, técnica, escalas y repertorio.

### Ejecutar una rutina

Selecciona la rutina que quieras practicar y utiliza la opción para iniciarla. Sigue los ejercicios de la rutina y controla el avance desde la interfaz de práctica.

**Ejemplo:** una rutina de 30 minutos puede dividirse en 5 minutos de calentamiento, 10 de técnica, 10 de escalas y 5 de repertorio.

## 6. 🕘 Historial de sesiones

El historial reúne las sesiones que has guardado.

Puedes utilizarlo para:

* Consultar las fechas de práctica.
* Revisar la duración de las sesiones.
* Recordar qué ejercicios trabajaste.
* Consultar los BPM y las observaciones registradas.
* Examinar los detalles de una sesión.
* Eliminar registros individuales.
* Limpiar el historial cuando sea necesario.

**Recomendación:** revisa el historial semanalmente para identificar los ejercicios que practicas con frecuencia y aquellos a los que necesitas dedicar más tiempo.

## 7. 📦 Exportación e importación de datos

La aplicación permite crear copias de seguridad en formato JSON.

### Exportar tus datos

1. Pulsa **Exportar** en la parte superior de la aplicación.
2. Guarda el archivo JSON que se descargue.
3. Conserva una copia en un lugar seguro.

Haz una exportación periódica, especialmente después de acumular varias semanas de práctica.

### Importar tus datos

1. Abre Guitar Practice en el dispositivo de destino.
2. Pulsa **Importar**.
3. Selecciona el archivo JSON que guardaste.
4. Elige la modalidad disponible:

   * **Combinar:** incorpora los registros importados a los que ya existen.
   * **Reemplazar:** sustituye los datos actuales por los datos importados.

**Importante:** antes de reemplazar los datos, exporta una copia de seguridad de los registros actuales. Comprueba también que has seleccionado el archivo correcto.

La exportación e importación sirven para transferir los datos, pero no sincronizan automáticamente los dispositivos.

## 8. 🌙 Modo oscuro

Guitar Practice incorpora una interfaz clara y una interfaz oscura.

Para cambiar de apariencia:

1. Localiza el botón de tema en la parte superior.
2. Pulsa **Oscuro** para activar el modo oscuro.
3. Pulsa **Claro** para regresar al modo claro.

La aplicación guarda la preferencia del tema en el navegador. Si todavía no existe una preferencia guardada, puede utilizar la configuración de apariencia del dispositivo.

## 9. 📱 Pantalla activa durante la práctica

En los dispositivos y navegadores compatibles, la aplicación solicita mantener la pantalla encendida mientras el metrónomo o una sesión de práctica están activos.

Esto permite consultar el tempo y el cronómetro sin que la pantalla se apague automáticamente durante la práctica.

La función depende de la compatibilidad del navegador y de las restricciones del sistema operativo. Si el dispositivo no la admite, debes ajustar el tiempo de apagado de pantalla desde sus propios ajustes.

## 10. 📲 Instalación en el teléfono

Si la versión publicada incluye los archivos PWA necesarios y el navegador la reconoce como instalable, puedes añadirla a la pantalla de inicio.

### En Android

1. Abre la aplicación en Chrome.
2. Entra en el menú del navegador.
3. Busca **Instalar aplicación** o **Añadir a pantalla de inicio**.
4. Confirma la instalación si aparece la opción.

El texto exacto puede variar según la versión de Chrome y el dispositivo.

### En iPhone

1. Abre la aplicación en Safari.
2. Pulsa el botón de compartir.
3. Selecciona **Añadir a pantalla de inicio**.
4. Confirma.

La disponibilidad de algunas funciones puede variar entre navegadores.

## 11. 🔌 Funcionamiento sin conexión

Guitar Practice está diseñada para trabajar localmente y no necesita una base de datos externa.

Si la versión publicada tiene correctamente configurado el *service worker* y se ha cargado al menos una vez con conexión, podrá utilizar los archivos almacenados en caché para abrir la aplicación sin conexión.

Ten en cuenta lo siguiente:

* La primera visita requiere conexión para descargar los archivos.
* Los datos se guardan en el almacenamiento local del navegador.
* Borrar los datos del sitio o desinstalar el navegador puede ocasionar la pérdida de los registros.
* Abrir la aplicación en otro dispositivo no transfiere automáticamente tus datos.
* Utiliza la exportación JSON para conservar y transferir tus registros.

## 12. ✅ Recomendaciones de uso

Para aprovechar mejor la aplicación:

1. Define un objetivo diario que puedas cumplir.
2. Comienza cada sesión con un calentamiento.
3. Utiliza el metrónomo para trabajar la precisión.
4. Prioriza la limpieza y la coordinación antes de aumentar la velocidad.
5. Registra observaciones concretas después de practicar.
6. Utiliza rutinas para mantener una estructura.
7. Revisa tus estadísticas y tu historial cada semana.
8. Exporta regularmente una copia de seguridad.

La aplicación es una herramienta de seguimiento: los resultados dependen de la constancia, la calidad de la práctica y los objetivos que establezcas.

---

## 🛠️ Tecnologías utilizadas

* **HTML5:** estructura de la aplicación.
* **CSS3:** estilos, diseño adaptable y modo oscuro.
* **JavaScript:** lógica de la aplicación, cronómetro, metrónomo y gestión de datos.
* **LocalStorage:** almacenamiento de información en el navegador.
* **Web Audio API:** generación del sonido del metrónomo.
* **Screen Wake Lock API:** solicitud para mantener la pantalla encendida en navegadores compatibles.
* **Progressive Web App (PWA):** instalación y funcionamiento sin conexión, cuando se han configurado el manifiesto y el *service worker*.

## 🔒 Privacidad y almacenamiento

Los registros de práctica se almacenan localmente en el navegador. La aplicación no necesita una cuenta de usuario ni una base de datos remota para las funciones descritas.

Sin embargo, los datos locales no constituyen una copia de seguridad. Es responsabilidad del usuario exportarlos y conservarlos si desea evitar perder su progreso.

## 🚀 Acceso al proyecto

**Abrir la aplicación:** [Guitar Practice](https://jherssoncode.github.io/guitar-practice/)

**Repositorio:** [Código fuente en GitHub](https://github.com/jherssoncode/guitar-practice)

---

*Guitar Practice — practica con constancia, registra tu progreso y mejora paso a paso.*
