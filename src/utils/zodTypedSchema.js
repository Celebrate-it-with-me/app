/**
 * vee-validate <-> Zod 4 adapter.
 *
 * `@vee-validate/zod` (latest 4.15.1) only supports Zod 3 and Zod 3 has no fix for
 * GHSA-mrhx-c7xc-m3w5, so this small adapter implements vee-validate's
 * `TypedSchema` contract on top of Zod 4. It can be replaced by passing the Zod
 * schema directly (Standard Schema) once vee-validate 5 is stable.
 *
 * Usage (same as before): `toTypedSchema(z.object({ ... }))`
 */
import { z } from 'zod'

// Zod 3 answered "Required" when a value was missing; Zod 4 answers
// "Invalid input: expected string, received undefined". Keep the old message.
z.config({
  customError: issue =>
    issue.code === 'invalid_type' && issue.input === undefined ? 'Required' : undefined
})

/** ['a', 'b', 0, 'c'] -> 'a.b[0].c' (vee-validate path syntax) */
function toFormPath(path) {
  return path.reduce((acc, segment) => {
    if (typeof segment === 'number') return `${acc}[${segment}]`
    return acc ? `${acc}.${String(segment)}` : String(segment)
  }, '')
}

function collectIssues(issues, errors) {
  for (const issue of issues) {
    // Unions report the issues of every branch in `errors`.
    // Their paths are relative to the union, so prefix the union's own path.
    if (issue.code === 'invalid_union' && Array.isArray(issue.errors)) {
      const nested = issue.errors.flat().map(inner => ({ ...inner, path: [...issue.path, ...(inner.path ?? [])] }))
      collectIssues(nested, errors)
      continue
    }

    const path = toFormPath(issue.path)
    if (!errors[path]) errors[path] = { path, errors: [] }
    errors[path].errors.push(issue.message)
  }
}

const WRAPPERS = ['optional', 'nullable', 'default', 'prefault', 'nonoptional', 'readonly']

/** Unwraps optional/nullable/default wrappers to reach the real schema. */
function unwrap(schema) {
  let current = schema
  while (current && WRAPPERS.includes(current.def?.type) && current.def.innerType) {
    current = current.def.innerType
  }
  return current
}

/** Walks 'a.b[0].c' through object shapes and array elements. */
function getSchemaForPath(path, schema) {
  const segments = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
  let current = schema

  for (const segment of segments) {
    current = unwrap(current)
    if (current?.shape && segment in current.shape) {
      current = current.shape[segment]
    } else if (current?.def?.type === 'array' && /^\d+$/.test(segment)) {
      current = current.def.element
    } else {
      return undefined
    }
  }

  return current
}

export function toTypedSchema(zodSchema, params) {
  return {
    __type: 'VVTypedSchema',

    async parse(value) {
      const result = await zodSchema.safeParseAsync(value, params)

      if (result.success) {
        return { value: result.data, errors: [] }
      }

      const errors = {}
      collectIssues(result.error.issues, errors)

      return { errors: Object.values(errors) }
    },

    // Zod cannot "cast" partial values; use the parsed result when it is valid.
    cast(values) {
      const result = zodSchema.safeParse(values, params)
      return result.success ? result.data : values
    },

    describe(path) {
      try {
        const target = path ? getSchemaForPath(path, zodSchema) : zodSchema

        if (!target) return { required: false, exists: false }

        return { required: !target.safeParse(undefined).success, exists: true }
      } catch {
        return { required: false, exists: false }
      }
    }
  }
}
