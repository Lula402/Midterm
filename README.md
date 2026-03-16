# Midterm
Luisa García Gallego

### **Guía de Instalación y Ejecución del Sistema**

Este proyecto utiliza una arquitectura de red local para comunicar el dispositivo móvil con la visualización de escritorio. Siga estos pasos para poner en marcha la instalación:

#### **1. Requisitos Previos**
*   Tener instalado **Node.js** en el computador.
*   Asegurarse de que tanto el computador como el dispositivo móvil (smartphone) estén conectados a la **misma red Wi-Fi**.

#### **2. Preparación del Entorno**
1.  Descargue o copie la carpeta del proyecto en su computador.
2.  Abra una terminal o consola de comandos (CMD o Terminal) dentro de la carpeta del proyecto.
3.  Instale las dependencias necesarias ejecutando el siguiente comando:
    ```bash
    npm install express socket.io
    ```

#### **3. Puesta en Marcha del Servidor**
1.  En la misma terminal, inicie el servidor de Node.js:
    ```bash
    node server.js
    ```
2.  La terminal debería mostrar el mensaje: `Server is listening on http://localhost:3000`.

#### **4. Conexión de los Clientes**
*   **Cliente de Visuales (PC):** Abra el navegador en el computador y acceda a: `http://localhost:3000`. (Asegúrese de permitir el acceso a la cámara si el navegador lo solicita).
*   **Cliente de Joystick (Smartphone):** 
    1.  Identifique la **IP local** de su computador (ej. `192.168.1.15`).
    2.  Desde el navegador de su teléfono, acceda a: `http://[TU-IP-LOCAL]:3000`.
    3.  Al tocar y arrastrar en la pantalla del móvil, los colores de la silueta en el PC deberían cambiar en tiempo real.

---

### **Instrucciones de Calibración Técnica**

Debido a que los sistemas de visión artificial son sensibles a las condiciones de iluminación del entorno (salón de clase, laboratorio, etc.), el sistema permite ajustes rápidos en el código de `Desktop.js`:

#### **A. Ajuste de Sensibilidad (Thresholding)**
Si nota que aparecen puntos de Voronoi en zonas vacías de la habitación (ruido visual), localice la siguiente variable en `Desktop.js`:
*   `umbral = 15;` 
*   **Acción:** Aumente el valor (ej. a `25` o `30`) si hay mucha interferencia de luz. Disminúyalo si el sistema no detecta bien a la persona.

#### **B. Estabilización de Fondo (Buffer Size)**
Si el fondo de la habitación cambia (ej. gente pasando por detrás), puede ajustar el buffer de memoria:
*   `bufferSize = 15;`
*   **Acción:** Aumentar este valor hará que el sistema sea más lento en adaptarse a cambios de fondo pero hará la silueta mucho más estable y limpia.

#### **C. Densidad de la Geometría**
Si el computador del profesor tiene pocos recursos gráficos y nota lentitud:
*   Localice el ciclo `for` en `setup()` que crea `misPuntos`.
*   **Acción:** Reduzca el valor de `1000` puntos a `500` para aligerar la carga del procesador y aumentar los FPS.
