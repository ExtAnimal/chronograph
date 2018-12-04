import {AnyFunction, Base, Constructable, Mixin} from "../class/Mixin.js";
import {Calculable, Atom, Readable, Writable} from "./Atom.js";


export type NamedInput      =  { [s : string] : Atom & Readable }
export type ArrayInput      =  (Atom & Readable)[]

export type ArrayOutput     =  (Atom & Writable)[]

/*

All we need from Input type is basically `map` function, so it can be a functor over any type

This should allow arbitrary JSON graph as input

*/


export const MutationData = <T extends Constructable<Base>>(base : T) =>

class MutationData extends base {
    input           : NamedInput | ArrayInput

    as              : (Atom & Writable)[]

    mapInput (func : (atom : Atom & Readable) => any) {
        const input     = this.input

        if (input instanceof Array) {
            return input.map(func)
        } else {
            // no Object.map() ? are JS designers serious?
            let res     = {}

            for (let key in input) {
                res[ key ] = func(input[ key ])
            }

            return res
        }
    }
}

export type MutationData = Mixin<typeof MutationData>



export const PureCalculation = <T extends Constructable<Calculable & MutationData>>(base : T) => {

    abstract class PureCalculation extends base {

        calculation         : AnyFunction

        runCalculation () {
            const values    = this.mapInput(atom => atom.get())

            const result    = Array.isArray(values) ? this.calculation.apply(this, values) : this.calculation(values)

            return this.as.map(atom => atom.set(result))
        }
    }

    return PureCalculation
}

export type PureCalculation = Mixin<typeof PureCalculation>



export const MinimalMutation = PureCalculation(Calculable(MutationData(Base)))
