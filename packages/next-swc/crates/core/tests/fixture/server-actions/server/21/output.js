/* __next_internal_action_entry_do_not_use__ $$ACTION_1,$$ACTION_3,$$ACTION_5 */ import __create_action_proxy__ from "private-next-rsc-action-proxy";
import { validator, another } from 'auth';
const x = 1;
export default function Page() {
    const y = 1;
    return <Foo action={validator(($$ACTION_0 = async function(...args) {
        return $$ACTION_1(($$ACTION_0.$$bound || []).concat(args));
    }, $$ACTION_0.$$typeof = Symbol.for("react.server.reference"), $$ACTION_0.$$id = "188d5d945750dc32e2c842b93c75a65763d4a922", $$ACTION_0.$$bound = [
        y
    ], __create_action_proxy__($$ACTION_0, $$ACTION_1), $$ACTION_0))}/>;
}
export async function $$ACTION_1(closure, z = closure[1]) {
    return x + closure[0] + z;
}
var $$ACTION_0;
validator(($$ACTION_2 = async (...args)=>$$ACTION_3(($$ACTION_2.$$bound || []).concat(args)), $$ACTION_2.$$typeof = Symbol.for("react.server.reference"), $$ACTION_2.$$id = "56a859f462d35a297c46a1bbd1e6a9058c104ab8", $$ACTION_2.$$bound = null, __create_action_proxy__($$ACTION_2, $$ACTION_3), $$ACTION_2));
export const $$ACTION_3 = async (closure)=>{};
var $$ACTION_2;
another(validator(($$ACTION_4 = async (...args)=>$$ACTION_5(($$ACTION_4.$$bound || []).concat(args)), $$ACTION_4.$$typeof = Symbol.for("react.server.reference"), $$ACTION_4.$$id = "1383664d1dc2d9cfe33b88df3fa0eaffef8b99bc", $$ACTION_4.$$bound = null, __create_action_proxy__($$ACTION_4, $$ACTION_5), $$ACTION_4)));
export const $$ACTION_5 = async (closure)=>{};
var $$ACTION_4;