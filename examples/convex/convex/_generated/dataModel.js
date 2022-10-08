/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@0.2.0.
 * To regenerate, run `npx convex codegen`.
 * @module
 */

import { GenericId } from "convex/values";

/**
 * An identifier for a document in Convex.
 *
 * Convex documents are uniquely identified by their `Id`, which is accessible
 * on the `_id` field. To learn more, see [Data Modeling](https://docs.convex.dev/using/data-modeling).
 *
 * Documents can be loaded using `db.get(id)` in query and mutation functions.
 *
 * **Important**: Use `myId.equals(otherId)` to check for equality.
 * Using `===` will not work because two different instances of `Id` can refer
 * to the same document.
 */
export const Id = GenericId;
