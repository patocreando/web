# CRO local — Web Esencial

Preparado el 18/10/2026. Rama `cro/oferta-local-50k` sobre el commit `1f81e48393c44b3bdf13e4becaaef31ada18cd27` del PR #11. No modifica main ni publica.

## Cambio comercial

- Web Esencial reemplaza la oferta de entrada Web Express: ARS 50.000 por diseño y desarrollo, hasta cinco secciones, información del cliente, CTA a WhatsApp/redes y una ronda de ajustes.
- Web Pro (ARS 75.000) y Premium (desde ARS 150.000) conservan precios; Esencial toma la prioridad visual.
- Condiciones propuestas para aprobación: publicación en destino acordado; dominio, alojamiento, mantenimiento y cambios posteriores aparte cuando correspondan. Sin panel de edición ni promesas de plazo, ventas o resultados.
- Se mantienen los cinco enlaces comerciales de Instagram y su parámetro ManyChat. No se inventa un WhatsApp personal. El WhatsApp incluido en el servicio es el del cliente.

## Recorrido

Hero con precio y alcance → Ver una demo → cafetería ficticia navegable → consulta simulada → volver a planes → consulta por Instagram.

La demostración no usa una marca prospectada ni activos generados. Es HTML/CSS/JS; los datos son ilustrativos, lleva noindex y no realiza pedidos ni solicitudes externas al simular contacto. Mantiene navegación y contenido sin JavaScript; la simulación requiere soporte de dialog.

## Pruebas

- Smoke de precio, destinos, activos y alcance, más sintaxis JS y diff sin errores de espacio: ejecutados localmente.
- Pruebas de navegador existentes actualizadas para la nueva oferta y el recorrido de demo. GitHub Actions verifica 375, 390, 768, 1366 y 1920 px, teclado, FAQ, planes, movimiento reducido, simulación sin red externa y regreso a la oferta.
- La aprobación visual y el estado final de Actions se consultan en el PR. No se declara mejora de conversión medida: aún no hay tráfico piloto.

## Publicación y rollback

1. Revisar el PR #11 y este PR como una secuencia; este PR apunta a la rama de #11 para mostrar solo el cambio de oferta.
2. Aprobar las condiciones comerciales propuestas y revisar capturas de Actions.
3. Una vez integrado #11, actualizar la base de este PR a main y repetir el gate necesario sobre el resultado.
4. Publicar solo después de autorización. El workflow Pages se activa en push a main; no se ejecuta manualmente aquí.
5. Antes de publicar, descartar esta rama restaura el estado previo sin afectar producción. Después, revertir el commit de integración de esta oferta y comprobar precio, enlaces y despliegue previo.

## Medición piloto

Registrar por separado visitas presenciales, demos solicitadas, presupuestos pedidos y señas recibidas. Son señales distintas. Sin tracking nuevo ni formulario que recolecte datos en esta iteración.
