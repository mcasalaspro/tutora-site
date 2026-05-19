import { getCollection, type CollectionEntry } from 'astro:content';

export type CursoEntry = CollectionEntry<'cursos'>;

/**
 * Resolve uma lista de slugs em entries da collection `cursos`, ignorando
 * silenciosamente qualquer slug que não exista (requisito explícito do prompt).
 */
export async function resolverCursosPorSlugs(slugs: string[]): Promise<CursoEntry[]> {
  if (!slugs || slugs.length === 0) return [];
  const todos = await getCollection('cursos');
  const indice = new Map(todos.map((c) => [c.slug, c]));
  return slugs.map((s) => indice.get(s)).filter((x): x is CursoEntry => Boolean(x));
}

/**
 * Cursos relacionados de um curso, com fallback: se a lista de relacionados
 * estiver vazia ou tiver poucos itens, completa com cursos da mesma área
 * (excluindo o próprio).
 */
export async function cursosRelacionadosCom(curso: CursoEntry, minimo = 3): Promise<CursoEntry[]> {
  const explicitos = await resolverCursosPorSlugs(curso.data.cursos_relacionados);
  if (explicitos.length >= minimo) return explicitos.slice(0, 4);

  const todos = await getCollection('cursos');
  const mesmaArea = todos.filter(
    (c) =>
      c.data.area === curso.data.area &&
      c.slug !== curso.slug &&
      !explicitos.find((e) => e.slug === c.slug)
  );
  return [...explicitos, ...mesmaArea].slice(0, 4);
}
