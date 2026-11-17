# Sistema ERP Internacional para Red Hat OpenShift

Este paquete consolida toda la arquitectura trabajada: **Frontend en React**, **Backend en Node.js + Express**, **Base de Datos PostgreSQL** y **Manifiestos YAML listos para Red Hat OpenShift**.

## Estructura del Proyecto

- `frontend/`: Aplicación React multi-región (LATAM, NA, EU) con soporte de monedas e integración con Red Hat SSO (Keycloak) y Red Hat 3scale API Management, más su `Containerfile` basado en Red Hat UBI 9.
- `backend/`: API REST en Node.js + Express con conexión a PostgreSQL, soporte de cabeceras regionales (`X-ERP-Region`) y `Containerfile` UBI 9.
- `database/`: Script `init.sql` con la tabla `regional_metrics` y datos iniciales por región.
- `openshift/erp-completo-openshift.yaml`: Manifiesto todo-en-uno corregido para evitar errores de permisos de Namespace (`forbidden`) y errores de nombres de imagen (`InvalidImageName`).

## Recomendaciones Clave para Desplegar en OpenShift Web Console

1. **Desactiva el traductor del navegador:** Antes de pegar o editar YAML en la consola de OpenShift, asegúrate de que la página esté en su idioma original (inglés) para evitar que el traductor modifique palabras clave o corte enlaces de imágenes.
2. **Despliegue directo desde la terminal web (`>_`):**
   ```bash
   oc apply -f openshift/erp-completo-openshift.yaml
   oc get pods
   ```
3. **Compilar tu código React y Backend reales en OpenShift (S2I / Docker Build):**
   ```bash
   # Compilar Backend
   oc new-build --name=erp-backend-api --binary --strategy=docker
   oc start-build erp-backend-api --from-dir=./backend --follow

   # Compilar Frontend
   oc new-build --name=erp-v2-frontend --binary --strategy=docker
   oc start-build erp-v2-frontend --from-dir=./frontend --follow
   ```
