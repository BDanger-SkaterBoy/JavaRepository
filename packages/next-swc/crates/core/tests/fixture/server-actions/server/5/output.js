/* __next_internal_action_entry_do_not_use__ $$ACTION_0 */ import __create_action_proxy__ from "private-next-rsc-action-proxy";
import deleteFromDb from 'db';
const v1 = 'v1';
export function Item({ id1 , id2  }) {
    const v2 = id2;
    async function deleteItem(...args) {
        return $$ACTION_0((deleteItem.$$bound || []).concat(args));
    }
    deleteItem.$$typeof = Symbol.for("react.server.reference");
    deleteItem.$$id = "6d53ce510b2e36499b8f56038817b9bad86cabb4";
    deleteItem.$$bound = [
        id1,
        v2
    ];
    __create_action_proxy__(deleteItem, $$ACTION_0);
    return <Button action={deleteItem}>Delete</Button>;
}
export async function $$ACTION_0(closure) {
    await deleteFromDb(closure[0]);
    await deleteFromDb(v1);
    await deleteFromDb(closure[1]);
}