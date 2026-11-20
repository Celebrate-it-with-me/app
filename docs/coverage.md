# Cobertura de pruebas (cwm_app)

Regla del dueño: el codigo nuevo o modificado de cada rama debe quedar con >= 95 % de cobertura (AGENTS.md §8). No hay umbral global todavia (linea base ~68 % de lineas).

## 1. Instalar (una vez, tras mergear)

`@vitest/coverage-v8` esta fijado a `5.1.0` (igual que `vitest`) en `package.json` y el lockfile. Reinstala en el contenedor:

```bash
docker restart cwm_app   # ejecuta npm install al arrancar
```

## 2. Correr

```bash
# Suite completa con cobertura (2 workers). Es pesada: usa heavy.sh.
/home/hhcarmenate/cwm/scripts/heavy.sh docker exec cwm_app npm run test:coverage

# Cobertura SOLO de las lineas nuevas o modificadas de la rama (necesita el paso anterior)
npm run test:coverage:changed          # dentro de la copia de trabajo (necesita git)
```

Salida: `coverage/coverage-final.json`, `coverage/coverage-summary.json`, `coverage/lcov.info` (git-ignorado). El resumen sale por consola.

## 3. Leer

- `test:coverage`: resumen global; para un archivo concreto abre `coverage/coverage-final.json` o `lcov.info`.
- `test:coverage:changed`: por archivo `% cubiertas/ejecutables` y `uncovered lines`; termina con exit 1 si el total esta por debajo de 95 %. Se ignoran los archivos que no se miden (locales, datos, CSS, `__tests__`, `src/views/dev`, `main.js`) y las lineas sin codigo ejecutable.

Variables: `COVERAGE_BASE` (por defecto `origin/develop`), `COVERAGE_CHANGED_THRESHOLD` (95), `COVERAGE_FILE` (`coverage/coverage-final.json`).
`COVERAGE_ENFORCE=1` activa ademas el umbral global de vitest (`COVERAGE_THRESHOLD`, 95 por defecto); no lo uses todavia.

## 4. Notas

- Hace falta `git fetch origin` antes para que `origin/develop` este al dia.
- Si el contenedor no tiene `git`, corre el script en el host sobre el worktree apuntando `COVERAGE_FILE` al `coverage-final.json` generado (las rutas se comparan por sufijo, vale el prefijo del contenedor).
